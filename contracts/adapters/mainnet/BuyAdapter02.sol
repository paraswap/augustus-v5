// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

import "../../lib/traderjoe-v2.1/TraderJoeV21.sol";
import "../../lib/smardex/Smardex.sol";
import "../../lib/solidlyv3/SolidlyV3.sol";
import "../../lib/angle-staked/AngleStaked.sol";
import "../IBuyAdapter.sol";

/**
 * @dev This contract will route call to:
 * 1 - TraderJoeV21
 * 2 - SmarDex
 * 3 - SolidlyV3
 * 4 - AngleStaked
 * The above are the indexes
 */
contract BuyAdapter02 is IBuyAdapter, TraderJoeV21, SmarDex, SolidlyV3, AngleStaked {
    using SafeMath for uint256;

    constructor(address _weth) public WethProvider(_weth) {}

    function initialize(bytes calldata data) external override {
        revert("METHOD NOT IMPLEMENTED");
    }

    function buy(
        uint256 index,
        IERC20 fromToken,
        IERC20 toToken,
        uint256 maxFromAmount,
        uint256 toAmount,
        address targetExchange,
        bytes calldata payload
    ) external payable override {
        if (index == 1) {
            buyOnTraderJoeV21(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 2) {
            buyOnSmarDex(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 3) {
            buyOnSolidlyV3(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 4) {
            buyOnAngleStaked(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else {
            revert("Index not supported");
        }
    }
}
