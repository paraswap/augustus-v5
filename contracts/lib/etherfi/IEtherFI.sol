// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

interface IEtherFi {
    /* eETH Pool */
    function deposit() external payable returns (uint256);

    /* weETH */
    function wrap(uint256 _eETHAmount) external returns (uint256);

    function unwrap(uint256 _weETHAmount) external returns (uint256);
}
