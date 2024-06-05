// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

import "./interfaces/ICLPool.sol";
import "./interfaces/ICLFactory.sol";
import "./interfaces/IVelodromeStateMulticall.sol";

contract VelodromeSlipstreamStateMulticall is IVelodromeStateMulticall {
    function getFullState(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view override returns (StateResult memory state) {
        require(tickBitmapEnd >= tickBitmapStart, "tickBitmapEnd < tickBitmapStart");

        state = _fillStateWithoutTicks(factory, tokenIn, tokenOut, tickSpacing, tickBitmapStart, tickBitmapEnd);
        state.ticks = _calcTicksFromBitMap(factory, tokenIn, tokenOut, tickSpacing, state.tickBitmap);
    }

    function getFullStateWithoutTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view override returns (StateResult memory state) {
        require(tickBitmapEnd >= tickBitmapStart, "tickBitmapEnd < tickBitmapStart");

        return _fillStateWithoutTicks(factory, tokenIn, tokenOut, tickSpacing, tickBitmapStart, tickBitmapEnd);
    }

    function getFullStateWithRelativeBitmaps(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 leftBitmapAmount,
        int16 rightBitmapAmount
    ) external view override returns (StateResult memory state) {
        require(leftBitmapAmount > 0, "leftBitmapAmount <= 0");
        require(rightBitmapAmount > 0, "rightBitmapAmount <= 0");

        state = _fillStateWithoutBitmapsAndTicks(factory, tokenIn, tokenOut, tickSpacing);
        int16 currentBitmapIndex = _getBitmapIndexFromTick(state.slot0.tick / state.tickSpacing);

        state.tickBitmap = _calcTickBitmaps(
            factory,
            tokenIn,
            tokenOut,
            tickSpacing,
            currentBitmapIndex - leftBitmapAmount,
            currentBitmapIndex + rightBitmapAmount
        );
        state.ticks = _calcTicksFromBitMap(factory, tokenIn, tokenOut, tickSpacing, state.tickBitmap);
    }

    function getAdditionalBitmapWithTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view override returns (TickBitMapMappings[] memory tickBitmap, TickInfoMappings[] memory ticks) {
        require(tickBitmapEnd >= tickBitmapStart, "tickBitmapEnd < tickBitmapStart");

        tickBitmap = _calcTickBitmaps(factory, tokenIn, tokenOut, tickSpacing, tickBitmapStart, tickBitmapEnd);
        ticks = _calcTicksFromBitMap(factory, tokenIn, tokenOut, tickSpacing, tickBitmap);
    }

    function getAdditionalBitmapWithoutTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view override returns (TickBitMapMappings[] memory tickBitmap) {
        require(tickBitmapEnd >= tickBitmapStart, "tickBitmapEnd < tickBitmapStart");

        return _calcTickBitmaps(factory, tokenIn, tokenOut, tickSpacing, tickBitmapStart, tickBitmapEnd);
    }

    function _fillStateWithoutTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) internal view returns (StateResult memory state) {
        state = _fillStateWithoutBitmapsAndTicks(factory, tokenIn, tokenOut, tickSpacing);
        state.tickBitmap = _calcTickBitmaps(factory, tokenIn, tokenOut, tickSpacing, tickBitmapStart, tickBitmapEnd);
    }

    function _fillStateWithoutBitmapsAndTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing
    ) internal view returns (StateResult memory state) {
        ICLPool pool = _getPool(factory, tokenIn, tokenOut, tickSpacing);

        state.pool = pool;
        state.blockTimestamp = block.timestamp;
        state.liquidity = pool.liquidity();
        state.tickSpacing = pool.tickSpacing();
        state.maxLiquidityPerTick = pool.maxLiquidityPerTick();

        (
            state.slot0.sqrtPriceX96,
            state.slot0.tick,
            state.slot0.observationIndex,
            state.slot0.observationCardinality,
            state.slot0.observationCardinalityNext,
            state.slot0.unlocked
        ) = pool.slot0();

        (
            state.observation.blockTimestamp,
            state.observation.tickCumulative,
            state.observation.secondsPerLiquidityCumulativeX128,
            state.observation.initialized
        ) = pool.observations(state.slot0.observationIndex);
    }

    function _calcTickBitmaps(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) internal view returns (TickBitMapMappings[] memory tickBitmap) {
        ICLPool pool = _getPool(factory, tokenIn, tokenOut, tickSpacing);

        uint256 numberOfPopulatedBitmaps = 0;
        for (int256 i = tickBitmapStart; i <= tickBitmapEnd; i++) {
            uint256 bitmap = pool.tickBitmap(int16(i));
            if (bitmap == 0) continue;
            numberOfPopulatedBitmaps++;
        }

        tickBitmap = new TickBitMapMappings[](numberOfPopulatedBitmaps);
        uint256 globalIndex = 0;
        for (int256 i = tickBitmapStart; i <= tickBitmapEnd; i++) {
            int16 index = int16(i);
            uint256 bitmap = pool.tickBitmap(index);
            if (bitmap == 0) continue;

            tickBitmap[globalIndex] = TickBitMapMappings({ index: index, value: bitmap });
            globalIndex++;
        }
    }

    function _calcTicksFromBitMap(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        TickBitMapMappings[] memory tickBitmap
    ) internal view returns (TickInfoMappings[] memory ticks) {
        ICLPool pool = _getPool(factory, tokenIn, tokenOut, tickSpacing);

        uint256 numberOfPopulatedTicks = 0;
        for (uint256 i = 0; i < tickBitmap.length; i++) {
            uint256 bitmap = tickBitmap[i].value;

            for (uint256 j = 0; j < 256; j++) {
                if (bitmap & (1 << j) > 0) numberOfPopulatedTicks++;
            }
        }

        ticks = new TickInfoMappings[](numberOfPopulatedTicks);

        uint256 globalIndex = 0;
        for (uint256 i = 0; i < tickBitmap.length; i++) {
            uint256 bitmap = tickBitmap[i].value;

            for (uint256 j = 0; j < 256; j++) {
                if (bitmap & (1 << j) > 0) {
                    int24 populatedTick = ((int24(tickBitmap[i].index) << 8) + int24(j)) * tickSpacing;

                    ticks[globalIndex].index = populatedTick;
                    TickInfo memory newTickInfo = ticks[globalIndex].value;

                    (
                        newTickInfo.liquidityGross,
                        newTickInfo.liquidityNet,
                        ,
                        ,
                        ,
                        ,
                        newTickInfo.tickCumulativeOutside,
                        newTickInfo.secondsPerLiquidityOutsideX128,
                        newTickInfo.secondsOutside,
                        newTickInfo.initialized
                    ) = pool.ticks(populatedTick);

                    globalIndex++;
                }
            }
        }
    }

    function _getPool(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing
    ) internal view returns (ICLPool pool) {
        pool = ICLPool(factory.getPool(tokenIn, tokenOut, tickSpacing));
        require(address(pool) != address(0), "Pool does not exist");
    }

    function _getBitmapIndexFromTick(int24 tick) internal pure returns (int16) {
        return int16(tick >> 8);
    }
}
