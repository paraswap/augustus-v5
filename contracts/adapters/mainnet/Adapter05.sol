// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/swell/Swell.sol";
import "../../lib/etherfi/EtherFi.sol";

/**
 * @dev This contract will route call to:
 * 1 - Swell
 * 2 - EtherFi
 * The above are the indexes
 */
contract Adapter05 is IAdapter, Swell, EtherFI {
    using SafeMath for uint256;

    /* solhint-disable no-empty-blocks */
    constructor(
        address weth,
        address swETH,
        address rswETH,
        address eETH,
        address eETHPool,
        address weETH
    ) public Swell(weth, swETH, rswETH) EtherFI(weth, eETH, eETHPool, weETH) {}

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
                swapOnSwell(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
            } else if (route[i].index == 2) {
                swapOnEtherFi(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000));
            } else {
                revert("Index not supported");
            }
        }
    }
}
