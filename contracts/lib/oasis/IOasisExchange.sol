// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

interface IOasisExchange {
    function sellAllAmount(
        address otc,
        address payToken,
        uint256 payAmt,
        address buyToken,
        uint256 minBuyAmt
    ) external returns (uint256 buyAmt);

    function sellAllAmountPayEth(
        address otc,
        address wethToken,
        address buyToken,
        uint256 minBuyAmt
    ) external payable returns (uint256 buyAmt);

    function sellAllAmountBuyEth(
        address otc,
        address payToken,
        uint256 payAmt,
        address wethToken,
        uint256 minBuyAmt
    ) external returns (uint256 wethAmt);

    function createAndSellAllAmount(
        address factory,
        address otc,
        address payToken,
        uint256 payAmt,
        address buyToken,
        uint256 minBuyAmt
    ) external returns (address proxy, uint256 buyAmt);

    function createAndSellAllAmountPayEth(
        address factory,
        address otc,
        address buyToken,
        uint256 minBuyAmt
    ) external payable returns (address proxy, uint256 buyAmt);

    function createAndSellAllAmountBuyEth(
        address factory,
        address otc,
        address payToken,
        uint256 payAmt,
        uint256 minBuyAmt
    ) external returns (address proxy, uint256 wethAmt);

    function buyAllAmount(
        address otc,
        address buyToken,
        uint256 buyAmt,
        address payToken,
        uint256 maxPayAmt
    ) external returns (uint256 payAmt);

    function buyAllAmountPayEth(
        address otc,
        address buyToken,
        uint256 buyAmt,
        address wethToken
    ) external payable returns (uint256 wethAmt);

    function buyAllAmountBuyEth(
        address otc,
        address wethToken,
        uint256 wethAmt,
        address payToken,
        uint256 maxPayAmt
    ) external returns (uint256 payAmt);

    function createAndBuyAllAmount(
        address factory,
        address otc,
        address buyToken,
        uint256 buyAmt,
        address payToken,
        uint256 maxPayAmt
    ) external returns (address proxy, uint256 payAmt);

    function createAndBuyAllAmountPayEth(
        address factory,
        address otc,
        address buyToken,
        uint256 buyAmt
    ) external payable returns (address proxy, uint256 wethAmt);

    function createAndBuyAllAmountBuyEth(
        address factory,
        address otc,
        uint256 wethAmt,
        address payToken,
        uint256 maxPayAmt
    ) external returns (address proxy, uint256 payAmt);
}
