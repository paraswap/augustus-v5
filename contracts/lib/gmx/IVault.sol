// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

interface IVault {
    function swap(
        address _tokenIn,
        address _tokenOut,
        address _receiver
    ) external returns (uint256);
}
