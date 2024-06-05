// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/traderjoe-v2/TraderJoeV2.sol";
import "../../lib/traderjoe-v2.1/TraderJoeV21.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/dexalot/Dexalot.sol";
import "../../lib/WethProvider.sol";
import "../../lib/wombat/Wombat.sol";

/**
 * @dev This contract will route call to different exchanges
 * 1 - HashFlow
 * 2 - TraderJoeV2
 * 3 - DystopiaUniswapV2Fork
 * 4 - TraderJoeV21
 * 5 - UniswapV3
 * 6 - Dexalot
 * 7 - Wombat
 * The above are the indexes
 */
contract AvalancheAdapter02 is
    IAdapter,
    HashFlow,
    TraderJoeV2,
    DystopiaUniswapV2Fork,
    TraderJoeV21,
    UniswapV3,
    Dexalot,
    Wombat
{
    using SafeMath for uint256;

    /*solhint-disable no-empty-blocks*/
    constructor(address _weth) public WethProvider(_weth) {}

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
                // swap on HashFlow
                swapOnHashFlow(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 2) {
                // swap on TraderJoeV2
                swapOnTraderJoeV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 3) {
                // swap on Dystopia
                swapOnDystopiaUniswapV2Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                // swap on TraderJoeV2.1
                swapOnTraderJoeV21(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                //swap on uniswapv3
                swapOnUniswapV3(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                //swap on dexalot
                swapOnDexalot(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 7) {
                swapOnWombat(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
            } else {
                revert("Index not supported");
            }
        }
    }
}
