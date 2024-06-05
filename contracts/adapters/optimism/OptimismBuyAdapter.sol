// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../IBuyAdapter.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/angle-staked/AngleStaked.sol";

/**
 * @dev This contract will route call to:
 * 1- UniswapV2Forks
 * 2- UniswapV3
 * 3- AugustusRFQ
 * 4 - HashFlow
 * 5 - BalancerV2
 * 6 - AngleStaked
 * The above are the indexes
 */
contract OptimismBuyAdapter is IBuyAdapter, NewUniswapV2, UniswapV3, AugustusRFQ, HashFlow, BalancerV2, AngleStaked {
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
            buyOnUniswapV3(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 3) {
            buyOnAugustusRFQ(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 4) {
            buyOnHashFlow(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 5) {
            buyOnBalancerV2(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 6) {
            buyOnAngleStaked(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else {
            revert("Index not supported");
        }
    }
}
