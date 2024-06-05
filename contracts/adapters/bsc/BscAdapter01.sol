// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/curve/Curve.sol";
import "../../lib/weth/WethExchange.sol";
import "../../lib/curveFork/CurveV1ForkAdapter.sol";
import "../../lib/dodo/DODO.sol";
import "../../lib/dodov2/DODOV2.sol";
import "../../lib/zeroxv4/ZeroxV4.sol";
import "../../lib/smoothy/SmoothyV1.sol";
import "../../lib/oneinchlp/OneInchPool.sol";
import "../../lib/zeroxv2/ZeroxV2.sol";
import "../../lib/bakery/BakeryAdapter.sol";
import "../../lib/kyberdmm/KyberDmm.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";

/**
 * @dev This contract will route call to:
 * 1- WETH
 * 2- Curve
 * 3- UniswapV2Forks
 * 4- CurveV1Fork
 * 5- DODOV2
 * 6- DODO
 * 7- ZeroxV4
 * 8- SmoothyV1
 * 9- OneInchLP
 * 10- ZeroxV2
 * 11- Bakery
 * 12- Kyber DMM
 * 13 - WooFiV2
 * 14- Augustus RFQ
 * The above are the indexes
 */
contract BscAdapter01 is
    IAdapter,
    NewUniswapV2,
    Curve,
    WethExchange,
    CurveV1ForkAdapter,
    KyberDmm,
    DODOV2,
    DODO,
    ZeroxV4,
    ZeroxV2,
    SmoothyV1,
    OneInchPool,
    BakeryAdapter,
    WooFiV2Adapter,
    AugustusRFQ
{
    using SafeMath for uint256;

    /*solhint-disable no-empty-blocks*/
    constructor(
        uint256 _dodoV2SwapLimitOverhead,
        address _dodoV2Erc20ApproveProxy,
        uint256 _dodoSwapLimitOverhead,
        address _dodoErc20ApproveProxy,
        address _zeroXv2erc20Proxy,
        address _weth
    )
        public
        WethProvider(_weth)
        DODOV2(_dodoV2SwapLimitOverhead, _dodoV2Erc20ApproveProxy)
        DODO(_dodoErc20ApproveProxy, _dodoSwapLimitOverhead)
        ZeroxV2(_zeroXv2erc20Proxy)
    {}

    /*solhint-disable no-empty-blocks*/

    function initialize(bytes calldata) external override {
        revert("METHOD NOT IMPLEMENTED");
    }

    /* solhint-disable code-complexity */
    function swap(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256,
        Utils.Route[] calldata route
    ) external payable override {
        for (uint256 i = 0; i < route.length; i++) {
            if (route[i].index == 1) {
                //swap on WETH
                swapOnWETH(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
            } else if (route[i].index == 2) {
                //swap on curve
                swapOnCurve(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 3) {
                //swap on uniswapV2Fork
                swapOnUniswapV2Fork(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 4) {
                //swap on CurveV1Fork
                swapOnCurveV1Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                //swap on DODOV2
                swapOnDodoV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                //swap on DODO
                swapOnDodo(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 7) {
                //swap on ZeroxV4
                swapOnZeroXv4(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                //swap on SmoothyV1
                swapOnSmoothyV1(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                //swap on OneInchLP
                swapOnOneInch(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 10) {
                //swap on ZeroxV2
                swapOnZeroXv2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 11) {
                //swap on Bakery
                swapOnBakery(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 12) {
                //swap on KyberDmm
                swapOnKyberDmm(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 13) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 14) {
                //swap on AugustusRFQ
                swapOnAugustusRFQ(
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
