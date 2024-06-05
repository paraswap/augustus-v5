// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/uniswap/UniswapV1.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";

/**
 * @dev This contract will route call to:
 * 0- UniswapV2Forks
 * 1- UniswapV1
 * 2- AugustusRFQ
 * The above are the indexes
 */

contract RopstenAdapter01 is IAdapter, NewUniswapV2, UniswapV1, AugustusRFQ {
    using SafeMath for uint256;

    /*solhint-disable no-empty-blocks*/
    constructor(address uniswapFactory, address _weth) public WethProvider(_weth) UniswapV1(uniswapFactory) {}

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
            if (route[i].index == 0) {
                //swap on uniswapV2Fork
                swapOnUniswapV2Fork(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else if (route[i].index == 1) {
                //swap on Uniswap
                swapOnUniswapV1(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
            } else if (route[i].index == 2) {
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
