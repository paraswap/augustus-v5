// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;
import "../IAdapter.sol";

import "../../lib/solidlyv3/SolidlyV3.sol";

/**
 * @dev This contract will route call to different exchanges
 * 1 - SolidlyV3
 * The above are the indexes
 */
contract FantomAdapter02 is IAdapter, SolidlyV3 {
    using SafeMath for uint256;

    constructor(address _weth) public WethProvider(_weth) {}

    function initialize(bytes calldata data) external override {
        revert("METHOD NOT IMPLEMENTED");
    }

    function swap(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 networkFee,
        Utils.Route[] calldata route
    ) external payable override {
        for (uint256 i = 0; i < route.length; i++) {
            if (route[i].index == 1) {
                swapOnSolidlyV3(
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
