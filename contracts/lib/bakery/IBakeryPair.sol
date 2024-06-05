// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

interface IBakeryPair {
    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );

    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to
    ) external;
}
