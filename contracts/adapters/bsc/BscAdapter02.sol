// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/uniswapv2/dystopia/DystopiaUniswapV2Fork.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/traderjoe-v2/TraderJoeV2.sol";
import "../../lib/traderjoe-v2.1/TraderJoeV21.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/gmx/GMX.sol";
import "../../lib/wombat/Wombat.sol";
import "../../lib/smardex/Smardex.sol";
import "../../lib/aave-v3/AaveV3.sol";
import "../../lib/angle-staked/AngleStaked.sol";

/**
 * @dev This contract will route call to:
 * 1 - DystopiaUniswapV2Fork
 * 2 - HashFlow
 * 3 - TraderJoeV2
 * 4 - UniswapV3
 * 5 - TraderJoeV2.1
 * 6 - Morphex (GMX fork)
 * 7 - Wombat
 * 8 - SmarDex
 * 9 - AaveV3
 * 10 - AngleStaked
 * The above are the indexes
 */

contract BscAdapter02 is
    IAdapter,
    DystopiaUniswapV2Fork,
    HashFlow,
    TraderJoeV2,
    UniswapV3,
    TraderJoeV21,
    GMX,
    Wombat,
    SmarDex,
    AaveV3,
    AngleStaked
{
    using SafeMath for uint256;

    /* solhint-disable no-empty-blocks */
    constructor(
        address _wrappedNativeToken,
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    ) public WethProvider(_wrappedNativeToken) AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway) {}

    /* solhint-disable no-empty-blocks */

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
                swapOnDystopiaUniswapV2Fork(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].payload
                );
            } else if (route[i].index == 2) {
                // swap on HashFlow
                swapOnHashFlow(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 3) {
                // swap on HashFlow
                swapOnTraderJoeV2(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 4) {
                //swap on uniswapv3
                swapOnUniswapV3(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 5) {
                //swap on TraderJoeV2.1
                swapOnTraderJoeV21(
                    fromToken,
                    toToken,
                    fromAmount.mul(route[i].percent).div(10000),
                    route[i].targetExchange,
                    route[i].payload
                );
            } else if (route[i].index == 6) {
                swapOnGMX(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].targetExchange);
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
