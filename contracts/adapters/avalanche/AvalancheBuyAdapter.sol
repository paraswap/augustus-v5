// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/traderjoe-v2/TraderJoeV2.sol";
import "../../lib/traderjoe-v2.1/TraderJoeV21.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/dexalot/Dexalot.sol";
import "../IBuyAdapter.sol";

/**
 * @dev This contract will route call to:
 * 1 - UniswapV2Forks
 * 2 - AugustusRFQ
 * 3 - HashFlow
 * 4 - TraderJoeV2
 * 5 - TraderJoeV2.1
 * 6 - UniswapV3
 * 7 - BalancerV2
 * 8 - Dexalot
 * The above are the indexes
 */
contract AvalancheBuyAdapter is
    IBuyAdapter,
    NewUniswapV2,
    AugustusRFQ,
    HashFlow,
    TraderJoeV2,
    TraderJoeV21,
    UniswapV3,
    BalancerV2,
    Dexalot
{
    using SafeMath for uint256;

    constructor(address _weth) public WethProvider(_weth) {}

    function initialize(bytes calldata data) external override {
        revert("METHOD NOT IMPLEMENTED");
    }

    function buy(
        uint256 index,
        IERC20 fromToken,
        IERC20 toToken,
        uint256 maxFromAmount,
        uint256 toAmount,
        address targetExchange,
        bytes calldata payload
    ) external payable override {
        if (index == 1) {
            buyOnUniswapFork(fromToken, toToken, maxFromAmount, toAmount, payload);
        } else if (index == 2) {
            buyOnAugustusRFQ(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 3) {
            buyOnHashFlow(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 4) {
            buyOnTraderJoeV2(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 5) {
            buyOnTraderJoeV21(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 6) {
            buyOnUniswapV3(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 7) {
            buyOnBalancerV2(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 8) {
            buyOnDexalot(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else {
            revert("Index not supported");
        }
    }
}
