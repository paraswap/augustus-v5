// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

import "../../lib/uniswapv2/NewUniswapV2.sol";
import "../../lib/uniswapv3/UniswapV3.sol";
import "../../lib/balancerv2/BalancerV2.sol";
import "../../lib/augustus-rfq/AugustusRFQ.sol";
import "../IBuyAdapter.sol";
import "../../lib/swaap-v1/SwaapV1.sol";
import "../../lib/hashflow/HashFlow.sol";
import "../../lib/swaap-v2/SwaapV2.sol";
import "../../lib/smardex/Smardex.sol";
import "../../lib/angle-staked/AngleStaked.sol";

/**
 * @dev This contract will route call to:
 * 1 - UniswapV2Forks
 * 2 - UniswapV3
 * 3 - AugustusRFQ
 * 4 - SwaapV1
 * 5 - HashFlow
 * 6 - BalancerV2
 * 7 - SwaapV2
 * 8 - SmarDex
 * 9 - AngleStaked
 * The above are the indexes
 */
contract PolygonBuyAdapter is
    IBuyAdapter,
    NewUniswapV2,
    UniswapV3,
    AugustusRFQ,
    SwaapV1,
    HashFlow,
    BalancerV2,
    SwaapV2,
    SmarDex,
    AngleStaked
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
            buyOnUniswapV3(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 3) {
            buyOnAugustusRFQ(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 4) {
            buyOnSwaapV1(fromToken, toToken, maxFromAmount, toAmount, targetExchange);
        } else if (index == 5) {
            buyOnHashFlow(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 6) {
            buyOnBalancerV2(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 7) {
            buyOnSwaapV2(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 8) {
            buyOnSmarDex(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else if (index == 9) {
            buyOnAngleStaked(fromToken, toToken, maxFromAmount, toAmount, targetExchange, payload);
        } else {
            revert("Index not supported");
        }
    }
}
