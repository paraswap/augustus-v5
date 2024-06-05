// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../IAdapter.sol";
import "../../lib/aave-v3/AaveV3.sol";

/*
 * @dev This contract will route calls to dexes according to the following indexing:
 * 1 - AaveV3
 */
contract PolygonZkEvmAdapter02 is IAdapter, AaveV3 {
    using SafeMath for uint256;

    constructor(
        uint16 _aaveV3RefCode,
        address _aaveV3Pool,
        address _aaveV3WethGateway
    ) public AaveV3(_aaveV3RefCode, _aaveV3Pool, _aaveV3WethGateway) {}

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
                //swap on AaveV3
                swapOnAaveV3(fromToken, toToken, fromAmount.mul(route[i].percent).div(10000), route[i].payload);
            } else {
                revert("Index not supported");
            }
        }
    }
}
