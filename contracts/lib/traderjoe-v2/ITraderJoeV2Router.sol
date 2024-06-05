// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;
import "../Utils.sol";

interface ITraderJoeV2Router {
    function swapExactTokensForTokens(
        uint256 _amountIn,
        uint256 _amountOutMin,
        uint256[] memory _pairBinSteps,
        IERC20[] memory _tokenPath,
        address _to,
        uint256 _deadline
    ) external returns (uint256 amountOut);

    function swapTokensForExactTokens(
        uint256 _amountOut,
        uint256 _amountInMax,
        uint256[] memory _pairBinSteps,
        IERC20[] memory _tokenPath,
        address _to,
        uint256 _deadline
    ) external returns (uint256[] memory amountsIn);
}
