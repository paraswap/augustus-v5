// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/traderjoe-v2/TraderJoeV2.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/traderjoe-v2.1/TraderJoeV21.sol";
import "../../lib/uniswapv2/dystopia/CamelotSolidlyFork.sol";
import "../../lib/swaap-v2/SwaapV2.sol";
import "../../lib/algebra/Algebra.sol";
import "../../lib/wombat/Wombat.sol";
import "../../lib/smardex/Smardex.sol";

/**
 * @dev This contract will route call to:
 * 1 - DystopiaUniswapV2Fork
 * 2 - TraderJoe2
 * 3 - WooFiV2
 * 4 - TraderJoeV2
 * 5 - CamelotSolidlyFork
 * 6 - SwaapV2
 * 7 - Algebra
 * 8 - Wombat
 * 9 - SmarDex
 * The above are the indexes
 */
contract ArbitrumAdapter02 is
    IAdapter,
    DystopiaUniswapV2Fork,
    TraderJoeV2,
    WooFiV2Adapter,
    TraderJoeV21,
    CamelotSolidlyFork,
    SwaapV2,
    Algebra,
    Wombat,
    SmarDex
{
    using SafeMath for uint256;

    /* solhint-disable no-empty-blocks */
    constructor(address _weth) public WethProvider(_weth) {}

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
                swapOnDystopiaUniswapV2Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 2) {
                // swap on Maverick
                swapOnTraderJoeV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 3) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                swapOnTraderJoeV21(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                swapOnCamelotSolidlyFork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                swapOnSwaapV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 7) {
                swapOnAlgebra(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                swapOnWombat(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 9) {
                swapOnSmarDex(
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
