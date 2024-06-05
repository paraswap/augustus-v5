// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

interface ICoFiXRouter {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function swapExactETHForTokens(
        address token,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        address rewardTo,
        uint256 deadline
    ) external payable returns (uint256 _amountIn, uint256 _amountOut);

    function swapExactTokensForETH(
        address token,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        address rewardTo,
        uint256 deadline
    ) external payable returns (uint256 _amountIn, uint256 _amountOut);

    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        address rewardTo,
        uint256 deadline
    ) external payable returns (uint256 _amountIn, uint256 _amountOut);

    function swapETHForExactTokens(
        address token,
        uint256 amountInMax,
        uint256 amountOutExact,
        address to,
        address rewardTo,
        uint256 deadline
    ) external payable returns (uint256 _amountIn, uint256 _amountOut);

    function swapTokensForExactETH(
        address token,
        uint256 amountInMax,
        uint256 amountOutExact,
        address to,
        address rewardTo,
        uint256 deadline
    ) external payable returns (uint256 _amountIn, uint256 _amountOut);
}
