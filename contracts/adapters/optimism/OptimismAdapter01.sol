// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";

import "../../lib/weth/WethExchange.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/curve/Curve.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/synthetix/SynthetixAdapter.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/wombat/Wombat.sol";

/**
 * @dev This contract will route call to different exchanges
 * 1 - WETH
 * 2 - UniswapV2Forks
 * 3 - UniswapV3
 * 4 - BalancerV2
 * 5 - Curve
 * 6 - AaveV3
 * 7 - AugustusRFQ
 * 8 - DystopiaUniswapV2Fork
 * 9 - Synthetix
 * 10 - HashFlow
 * 11 - WooFiV2
 * 12 - Wombat
 * The above are the indexes
 */
contract OptimismAdapter01 is
    IAdapter,
    WethExchange,
    NewUniswapV2,
    UniswapV3,
    BalancerV2,
    Curve,
    AaveV3,
    AugustusRFQ,
    DystopiaUniswapV2Fork,
    Synthetix,
    HashFlow,
    WooFiV2Adapter,
    Wombat
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
                //swap on uniswapv3
                swapOnUniswapV3(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                //swap on BalancerV2
                swapOnBalancerV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                //swap on curve
                swapOnCurve(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                //swap on AaveV3
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 7) {
                //swap on augustusRFQ
                swapOnAugustusRFQ(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                swapOnDystopiaUniswapV2Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                swapOnSynthetix(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 10) {
                // swap on HashFlow
                swapOnHashFlow(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 11) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 12) {
                swapOnWombat(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else {
                revert("Index not supported");
            }
        }
    }
}
