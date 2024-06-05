// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

/// @title Permissioned pool actions
/// @notice Contains pool methods that may only be called by the factory owner
interface ICLPoolOwnerActions {
    /// @notice Collect the gauge fee accrued to the pool
    /// @return amount0 The gauge fee collected in token0
    /// @return amount1 The gauge fee collected in token1
    function collectFees() external returns (uint128 amount0, uint128 amount1);
}
