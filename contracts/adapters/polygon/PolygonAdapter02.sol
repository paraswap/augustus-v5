// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/jarvis-v6/JarvisV6.sol";
import "../../lib/swaap-v1/SwaapV1.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/swaap-v2/SwaapV2.sol";
import "../../lib/smardex/Smardex.sol";
import "../../lib/angle-staked/AngleStaked.sol";

/*
 * @dev This contract will route calls to dexes according to the following indexing:
 * 1- AaveV3
 * 2- AugustusRFQ
 * 3- DystopiaUniswapV2Fork
 * 4- WooFiV2
 * 5- JarvisV6
 * 6- SwaapV1
 * 7 - HashFlow
 * 8 - SwaapV2
 * 9 - SmarDex
 * 10 - AngleStaked
 */
contract PolygonAdapter02 is
    IAdapter,
    AaveV3,
    AugustusRFQ,
    DystopiaUniswapV2Fork,
    WooFiV2Adapter,
    JarvisV6,
    SwaapV1,
    HashFlow,
    SwaapV2,
    SmarDex,
    AngleStaked
{
    using SafeMath for uint256;

    /*solhint-disable no-empty-blocks*/
    constructor(
        address _weth,
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    ) public WethProvider(_weth) AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway) {}

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
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 2) {
                //swap on augustusRFQ
                swapOnAugustusRFQ(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 3) {
                swapOnDystopiaUniswapV2Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                swapOnJarvisV6(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                swapOnSwaapV1(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 7) {
                // swap on HashFlow
                swapOnHashFlow(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 8) {
                swapOnSwaapV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                swapOnSmarDex(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 10) {
                swapOnAngleStaked(
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
