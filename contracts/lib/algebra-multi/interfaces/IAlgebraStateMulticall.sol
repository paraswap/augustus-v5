// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

import "./IAlgebraPool.sol";
import "./IAlgebraFactory.sol";

interface IAlgebraStateMulticall {
    struct GlobalState {
        uint160 price;
        int24 tick;
        uint16 fee;
        uint16 timepointIndex;
        uint8 communityFeeToken0;
        uint8 communityFeeToken1;
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

    struct Timepoints {
        bool initialized;
        uint32 blockTimestamp;
        int56 tickCumulative;
        uint160 secondsPerLiquidityCumulative;
        uint88 volatilityCumulative;
        int24 averageTick;
        uint144 volumePerLiquidityCumulative;
    }

    struct StateResult {
        IAlgebraPool pool;
        uint256 blockTimestamp;
        GlobalState globalState;
        uint128 liquidity;
        int24 tickSpacing;
        uint128 maxLiquidityPerTick;
        Timepoints timepoints;
        TickBitMapMappings[] tickBitmap;
        TickInfoMappings[] ticks;
    }

    function getFullState(
        IAlgebraFactory factory,
        address tokenIn,
        address tokenOut,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (StateResult memory state);

    function getFullStateWithoutTicks(
        IAlgebraFactory factory,
        address tokenIn,
        address tokenOut,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (StateResult memory state);

    function getFullStateWithRelativeBitmaps(
        IAlgebraFactory factory,
        address tokenIn,
        address tokenOut,
        int16 leftBitmapAmount,
        int16 rightBitmapAmount
    ) external view returns (StateResult memory state);

    function getAdditionalBitmapWithTicks(
        IAlgebraFactory factory,
        address tokenIn,
        address tokenOut,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (TickBitMapMappings[] memory tickBitmap, TickInfoMappings[] memory ticks);

    function getAdditionalBitmapWithoutTicks(
        IAlgebraFactory factory,
        address tokenIn,
        address tokenOut,
        int16 tickBitmapStart,
        int16 tickBitmapEnd
    ) external view returns (TickBitMapMappings[] memory tickBitmap);
}
