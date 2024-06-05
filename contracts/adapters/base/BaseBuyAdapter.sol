// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

import "../IBuyAdapter.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/maverick/Maverick.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/WethProvider.sol";
import "../../lib/smardex/Smardex.sol";
import "../../lib/angle-staked/AngleStaked.sol";
import "../../lib/algebra/Algebra.sol";

/**
 * @dev This contract will route call to:
 * 1 - UniswapV3
 * 2 - Maverick
 * 3 - BalancerV2
 * 4 - NewUniswapV2
 * 5 - SmarDex
 * 6 - Algebra
 * 7 - AngleStaked
 * The above are the indexes
 */
contract BaseBuyAdapter is IBuyAdapter, UniswapV3, Maverick, BalancerV2, NewUniswapV2, SmarDex, Algebra, AngleStaked {
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
            buyOnUniswapV3(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 2) {
            buyOnMaverick(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 3) {
            buyOnBalancerV2(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 4) {
            buyOnUniswapFork(fromToken, toToken, maxFromAmount, toAmount, payload);
        } else if (index == 5) {
            buyOnSmarDex(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 6) {
            buyOnAlgebra(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 7) {
            buyOnAngleStaked(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else {
            revert("Index not supported");
        }
    }
}
