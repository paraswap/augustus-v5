// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

interface IBdai {
    function join(uint256 wad) external;

    function exit(uint256 wad) external;
}
