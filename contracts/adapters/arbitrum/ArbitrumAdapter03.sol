// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/angle-staked/AngleStaked.sol";
import "../../lib/dexalot/Dexalot.sol";

/**
 * @dev This contract will route call to:
 * 1 - AngleStaked
 * 2 - Dexalot
 * The above are the indexes
 */
contract ArbitrumAdapter03 is IAdapter, AngleStaked, Dexalot {
    using SafeMath for uint256;

    /* solhint-disable no-empty-blocks */
    constructor() public {}

    /* solhint-disable no-empty-blocks */
    function initialize(bytes calldata) external override {
        revert("METHOD NOT IMPLEMENTED");
    }

    function swap(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256,
        Utils.Route[] calldata route
    ) external payable override {
        for (uint256 i = 0; i < route.length; i++) {
            if (route[i].index == 1) {
                swapOnAngleStaked(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 2) {
                swapOnDexalot(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else {
                revert("Index not supported");
            }
        }
    }
}
