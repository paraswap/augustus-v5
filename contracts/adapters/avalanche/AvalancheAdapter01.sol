// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/weth/WethExchange.sol";
import "../../lib/saddle/SaddleAdapter.sol";
import "../../lib/kyberdmm/KyberDmm.sol";
import "../../lib/curve/CurveV2.sol";
import "../../lib/curve/Curve.sol";
import "../../lib/aavee2/Aavee2.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/platypus/Platypus.sol";
import "../../lib/gmx/GMX.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";

/**
 * @dev This contract will route call to different exchanges
 * 1 - WAVAX
 * 2 - UniswapV2Forks
 * 3 - Snowball
 * 4 - KyberDmm
 * 5 - Curve
 * 6 - Curvev2
 * 7 - Aavee2
 * 8 - BalancerV2
 * 9 - AaveV3
 * 10 - Platypus
 * 11 - GMX
 * 12 - WooFiV2
 * 13 - AugustusRFQ
 * The above are the indexes
 */
contract AvalancheAdapter01 is
    IAdapter,
    NewUniswapV2,
    WethExchange,
    SaddleAdapter,
    KyberDmm,
    Curve,
    CurveV2,
    Aavee2,
    BalancerV2,
    AaveV3,
    Platypus,
    GMX,
    WooFiV2Adapter,
    AugustusRFQ
{
    using SafeMath for uint256;

    /*solhint-disable no-empty-blocks*/
    constructor(
        address _weth,
        uint16 _aaveeRefCode,
        address _aaveeLendingPool,
        address _aaveeWethGateway,
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    )
        public
        WethProvider(_weth)
        Aavee2(_aaveeRefCode, _aaveeLendingPool, _aaveeWethGateway)
        AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway)
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
                //swap on WETH
                swapOnWETH(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
            } else if (route[i].index == 2) {
                //swap on uniswapV2Fork
                swapOnUniswapV2Fork(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 3) {
                //swap on Snowball (Saddle Fork)
                swapOnSaddle(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                //swap on KyberDmm
                swapOnKyberDmm(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                //swap on Curve
                swapOnCurve(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                //swap on CurveV2
                swapOnCurveV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 7) {
                //swap on aavee2
                swapOnAaveeV2(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 8) {
                swapOnBalancerV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 10) {
                swapOnPlatypus(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange
                );
            } else if (route[i].index == 11) {
                swapOnGMX(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 12) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 13) {
                //swap on augustusRFQ
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
