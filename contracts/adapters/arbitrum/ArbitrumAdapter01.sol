// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";

import "../../lib/weth/WethExchange.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/kyberdmm/KyberDmm.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/curve/Curve.sol";
import "../../lib/curve/CurveV2.sol";
import "../../lib/saddle/SaddleAdapter.sol";
import "../../lib/gmx/GMX.sol";
import "../../lib/dodo/DODO.sol";
import "../..//lib/dodov2/DODOV2.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../../lib/hashflow/HashFlow.sol";

/**
 * @dev This contract will route call to different exchanges
 * 1 - WETH
 * 2 - UniswapV2Forks
 * 3 - UniswapV3
 * 4 - KyberDMM
 * 5 - BalancerV2
 * 6 - Curve
 * 7 - CurveV2
 * 8 - Saddle
 * 9 - GMX
 * 10 - DODO
 * 11 - DODOV2
 * 12 - AaveV3
 * 13 - AugustusRFQ
 * 14 - HashFlow
 * The above are the indexes
 */
contract ArbitrumAdapter01 is
    IAdapter,
    WethExchange,
    NewUniswapV2,
    UniswapV3,
    KyberDmm,
    BalancerV2,
    Curve,
    CurveV2,
    SaddleAdapter,
    GMX,
    DODO,
    DODOV2,
    AaveV3,
    AugustusRFQ,
    HashFlow
{
    using SafeMath for uint256;

    constructor(
        address _weth,
        address _dodoErc20ApproveProxy,
        uint256 _dodoSwapLimitOverhead,
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    )
        public
        WethProvider(_weth)
        DODO(_dodoErc20ApproveProxy, _dodoSwapLimitOverhead)
        DODOV2(_dodoSwapLimitOverhead, _dodoErc20ApproveProxy)
        AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway)
    {}

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
                //swap on uniswapv3
                swapOnUniswapV3(
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
                //swap on BalancerV2
                swapOnBalancerV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                //swap on curve
                swapOnCurve(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 7) {
                //swap on CurveV2
                swapOnCurveV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                //swap on Saddle
                swapOnSaddle(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                //swap on GMX
                swapOnGMX(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 10) {
                //swap on DODO
                swapOnDodo(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 11) {
                //swap on DODOV2
                swapOnDodoV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 12) {
                //swap on AaveV3
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 13) {
                //swap on augustusRFQ
                swapOnAugustusRFQ(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 14) {
                // swap on HashFlow
                swapOnHashFlow(
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
