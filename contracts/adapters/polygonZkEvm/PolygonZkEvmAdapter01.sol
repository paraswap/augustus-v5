// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/gmx/GMX.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/woofi-v2/WooFiV2Adapter.sol";
import "../../lib/weth/WethExchange.sol";

/*
 * @dev This contract will route calls to dexes according to the following indexing:
 * 1 - UniswapV3
 * 2 - GMX
 * 3 - WETH
 * 4 - BalancerV2
 * 5 - UniswapV2Forks
 * 6 - WooFiV2
 */
contract PolygonZkEvmAdapter01 is IAdapter, WethExchange, UniswapV3, GMX, BalancerV2, NewUniswapV2, WooFiV2Adapter {
    using SafeMath for uint256;

    constructor(address _weth) public WethProvider(_weth) {}

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
                //swap on uniswapv3
                swapOnUniswapV3(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 2) {
                //swap on GMX
                swapOnGMX(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else if (route[i].index == 3) {
                //swap on WETH
                swapOnWETH(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
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
                //swap on UniswapV2Forks
                swapOnUniswapV2Fork(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 6) {
                //swap on WooFiV2
                swapOnWooFiV2(
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
