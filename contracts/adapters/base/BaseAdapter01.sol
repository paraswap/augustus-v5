// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/maverick/Maverick.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/WethProvider.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/wombat/Wombat.sol";
import "../../lib/smardex/Smardex.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/angle-staked/AngleStaked.sol";
import "../../lib/algebra/Algebra.sol";

/*
 * @dev This contract will route calls to dexes according to the following indexing:
 * 1 - UniswapV3
 * 2 - Maverick
 * 3 - DystopiaUniswapV2Fork
 * 4 - BalancerV2
 * 5 - WooFiV2
 * 6 - NewUniswapV2
 * 7 - Wombat
 * 8 - SmarDex
 * 9 - AaveV3
 * 10 - Algebra
 * 11 - AngleStaked
 */
contract BaseAdapter01 is
    IAdapter,
    UniswapV3,
    Maverick,
    DystopiaUniswapV2Fork,
    BalancerV2,
    WooFiV2Adapter,
    NewUniswapV2,
    Wombat,
    SmarDex,
    AaveV3,
    Algebra,
    AngleStaked
{
    using SafeMath for uint256;

    constructor(
        address _weth,
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    ) public WethProvider(_weth) AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway) {}

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
                swapOnUniswapV3(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 2) {
                swapOnMaverick(
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
                swapOnBalancerV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                swapOnWooFiV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                swapOnUniswapV2Fork(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 7) {
                swapOnWombat(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 8) {
                swapOnSmarDex(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 9) {
                //swap on AaveV3
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 10) {
                swapOnAlgebra(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 11) {
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
