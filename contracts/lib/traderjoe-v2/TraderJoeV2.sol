// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../weth/IWETH.sol";
import "../WethProvider.sol";
import "./ITraderJoeV2Router.sol";
import "../Utils.sol";

abstract contract TraderJoeV2 is WethProvider {
    struct PartialJoeV2Param {
        uint256[] _pairBinSteps;
        IERC20[] _tokenPath;
        uint256 _deadline;
    }

    function swapOnTraderJoeV2(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        PartialJoeV2Param memory data = abi.decode(payload, (PartialJoeV2Param));

        address _fromToken = address(fromToken) == Utils.ethAddress() ? WETH : address(fromToken);
        address _toToken = address(toToken) == Utils.ethAddress() ? WETH : address(toToken);

        if (address(fromToken) == Utils.ethAddress()) {
            IWETH(WETH).deposit{ value: fromAmount }();
        }

        Utils.approve(address(exchange), _fromToken, fromAmount);

        ITraderJoeV2Router(exchange).swapExactTokensForTokens(
            fromAmount,
            1,
            data._pairBinSteps,
            data._tokenPath,
            address(this),
            data._deadline
        );

        if (address(toToken) == Utils.ethAddress()) {
            IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        }
    }

    function buyOnTraderJoeV2(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 toAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        PartialJoeV2Param memory data = abi.decode(payload, (PartialJoeV2Param));

        address _fromToken = address(fromToken) == Utils.ethAddress() ? WETH : address(fromToken);
        address _toToken = address(toToken) == Utils.ethAddress() ? WETH : address(toToken);

        if (address(fromToken) == Utils.ethAddress()) {
            IWETH(WETH).deposit{ value: fromAmount }();
        }

        Utils.approve(address(exchange), _fromToken, fromAmount);

        ITraderJoeV2Router(exchange).swapTokensForExactTokens(
            toAmount,
            fromAmount,
            data._pairBinSteps,
            data._tokenPath,
            address(this),
            data._deadline
        );

        if (address(fromToken) == Utils.ethAddress() || address(toToken) == Utils.ethAddress()) {
            IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        }
    }
}
