// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.5;

import "../interfaces/ICLPool.sol";
import "./PoolAddress.sol";

/// @notice Provides validation for callbacks from VelodromeSlipstream Pools
library CallbackValidation {
    /// @notice Returns the address of a valid VelodromeSlipstream Pool
    /// @param factory The contract address of the VelodromeSlipstream factory
    /// @param tokenA The contract address of either token0 or token1
    /// @param tokenB The contract address of the other token
    /// @param tickSpacing The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @return pool The VelodromeSlipstream pool contract address
    function verifyCallback(
        address factory,
        address tokenA,
        address tokenB,
        uint24 tickSpacing
    ) internal view returns (ICLPool pool) {
        return verifyCallback(factory, PoolAddress.getPoolKey(tokenA, tokenB, tickSpacing));
    }

    /// @notice Returns the address of a valid VelodromeSlipstream Pool
    /// @param factory The contract address of the VelodromeSlipstream factory
    /// @param poolKey The identifying key of the V3 pool
    /// @return pool The VelodromeSlipstream pool contract address
    function verifyCallback(address factory, PoolAddress.PoolKey memory poolKey) internal view returns (ICLPool pool) {
        pool = ICLPool(PoolAddress.computeAddress(factory, poolKey));
        require(msg.sender == address(pool));
    }
}
