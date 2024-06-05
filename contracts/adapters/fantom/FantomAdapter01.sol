// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;
import "../IAdapter.sol";

import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/curve/Curve.sol";
import "../../lib/curve/CurveV2.sol";
import "../../lib/weth/WethExchange.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/saddle/SaddleAdapter.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/gmx/GMX.sol";

/**
 * @dev This contract will route call to different exchanges
 * 1 - WFTM
 * 2 - UniswapV2Forks
 * 3 - Curve
 * 4 - CurveV2
 * 5 - BalancerV2
 * 6 - AaveV3
 * 7 - Saddle
 * 8 - WooFiV2
 * 9 - AugustusRFQ
 * 10 - DystopiaUniswapV2Fork
 * 11 - UniswapV3
 * 12 - Morphex (GMX fork)
 * The above are the indexes
 */
contract FantomAdapter01 is
    IAdapter,
    NewUniswapV2,
    UniswapV3,
    WethExchange,
    Curve,
    CurveV2,
    BalancerV2,
    AaveV3,
    SaddleAdapter,
    WooFiV2Adapter,
    AugustusRFQ,
    DystopiaUniswapV2Fork,
    GMX
{
    using SafeMath for uint256;

    constructor(
        address _weth,
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    ) public WethProvider(_weth) AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway) {}

    function initialize(bytes calldata data) external override {
        revert("METHOD NOT IMPLEMENTED");
    }

    function swap(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 networkFee,
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
                //swap on curve
                swapOnCurve(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                //swap on CurveV2
                swapOnCurveV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                swapOnBalancerV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 7) {
                // swap on Saddle or Curve forks based on Nerve implementation
                swapOnSaddle(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                //swap on augustusRFQ
                swapOnAugustusRFQ(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 10) {
                swapOnDystopiaUniswapV2Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 11) {
                swapOnUniswapV3(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 12) {
                swapOnGMX(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else {
                revert("Index not supported");
            }
        }
    }
}
