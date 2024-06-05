// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/curve/Curve.sol";
import "../../lib/aavee2/Aavee2.sol";
import "../../lib/weth/WethExchange.sol";
import "../../lib/curve/CurveV2.sol";
import "../../lib/dodov2/DODOV2.sol";
import "../../lib/mstable/MStable.sol";
import "../../lib/curveFork/CurveV1ForkAdapter.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/kyberdmm/KyberDmm.sol";
import "../../lib/zeroxv4/ZeroxV4.sol";
import "../../lib/jarvis/Jarvis.sol";
import "../../lib/uniswapv3/UniswapV3.sol";

/*
 * @dev This contract will route calls to dexes according to the following indexing:
 * 1- AAVEE2
 * 2- Wmatic
 * 3- Curve
 * 4- UniswapV2Forks
 * 5- CurveV2
 * 6- MStable
 * 7- CurveV1ForkAdapter
 * 8- DODOV2
 * 9- BalancerV2
 * 10- KyberDmm
 * 11- 0xV4
 * 12- Jarvis
 * 13- UniswapV3
 */
contract PolygonAdapter01 is
    IAdapter,
    NewUniswapV2,
    Curve,
    Aavee2,
    WethExchange,
    CurveV2,
    MStable,
    CurveV1ForkAdapter,
    DODOV2,
    BalancerV2,
    KyberDmm,
    ZeroxV4,
    Jarvis,
    UniswapV3
{
    using SafeMath for uint256;

    /*solhint-disable no-empty-blocks*/
    constructor(
        uint16 _aaveeRefCode,
        address _aaveeLendingPool,
        address _aaveeWethGateway,
        address _weth,
        uint256 _dodoV2SwapLimitOverhead,
        address _dodoV2Erc20ApproveProxy
    )
        public
        WethProvider(_weth)
        DODOV2(_dodoV2SwapLimitOverhead, _dodoV2Erc20ApproveProxy)
        Aavee2(_aaveeRefCode, _aaveeLendingPool, _aaveeWethGateway)
    {}

    /*solhint-enable no-empty-blocks*/

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
                swapOnAaveeV2(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 2) {
                swapOnWETH(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
            } else if (route[i].index == 3) {
                swapOnCurve(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                swapOnUniswapV2Fork(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 5) {
                swapOnCurveV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                swapOnMStable(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 7) {
                swapOnCurveV1Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                //swap on DODOV2
                swapOnDodoV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                swapOnBalancerV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 10) {
                swapOnKyberDmm(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 11) {
                //swap on 0xV4
                swapOnZeroXv4(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 12) {
                //swap on Jarvis
                swapOnJarvis(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 13) {
                //swap on uniswapv3
                swapOnUniswapV3(
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
