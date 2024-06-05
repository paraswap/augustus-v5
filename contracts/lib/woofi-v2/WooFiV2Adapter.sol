// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "../WethProvider.sol";
import "../Utils.sol";
import "../weth/IWETH.sol";

interface IWooPPV2 {
    function swap(
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 minToAmount,
        address to,
        address rebateTo
    ) external returns (uint256 realToAmount);
}

abstract contract WooFiV2Adapter is WethProvider {
    using SafeERC20 for IERC20;

    struct WooFiV2Data {
        address rebateTo;
    }

    function swapOnWooFiV2(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        WooFiV2Data memory wooFiV2Data = abi.decode(payload, (WooFiV2Data));

        address _fromToken = address(fromToken) == Utils.ethAddress() ? WETH : address(fromToken);
        address _toToken = address(toToken) == Utils.ethAddress() ? WETH : address(toToken);

        if (address(fromToken) == Utils.ethAddress()) {
            IWETH(WETH).deposit{ value: fromAmount }();
        }

        IERC20(_fromToken).safeTransfer(exchange, fromAmount);

        IWooPPV2(exchange).swap(_fromToken, _toToken, fromAmount, 1, address(this), wooFiV2Data.rebateTo);

        if (address(toToken) == Utils.ethAddress()) {
            IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        }
    }
}
