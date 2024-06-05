// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

import "./ICLFactory.sol";
import "./ICLPool.sol";

interface IVelodromeStateMulticall {
    struct Slot0 {
        uint160 sqrtPriceX96;
        int24 tick;
        uint16 observationIndex;
        uint16 observationCardinality;
        uint16 observationCardinalityNext;
        bool unlocked;
    }

    struct TickBitMapMappings {
        int16 index;
        uint256 value;
    }

    struct TickInfo {
        uint128 liquidityGross;
        int128 liquidityNet;
        int56 tickCumulativeOutside;
        uint160 secondsPerLiquidityOutsideX128;
        uint32 secondsOutside;
        bool initialized;
    }

    struct TickInfoMappings {
        int24 index;
        TickInfo value;
    }

    struct Observation {
        uint32 blockTimestamp;
        int56 tickCumulative;
        uint160 secondsPerLiquidityCumulativeX128;
        bool initialized;
    }

    struct StateResult {
        ICLPool pool;
        uint256 blockTimestamp;
        Slot0 slot0;
        uint128 liquidity;
        int24 tickSpacing;
        uint128 maxLiquidityPerTick;
        Observation observation;
        TickBitMapMappings[] tickBitmap;
        TickInfoMappings[] ticks;
    }

    function getFullState(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (StateResult memory state);

    function getFullStateWithoutTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (StateResult memory state);

    function getFullStateWithRelativeBitmaps(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 leftBitmapAmount,
        int16 rightBitmapAmount
    ) external view returns (StateResult memory state);

    function getAdditionalBitmapWithTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (TickBitMapMappings[] memory tickBitmap, TickInfoMappings[] memory ticks);

    function getAdditionalBitmapWithoutTicks(
        ICLFactory factory,
        address tokenIn,
        address tokenOut,
        int24 tickSpacing,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (TickBitMapMappings[] memory tickBitmap);
}
