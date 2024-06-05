// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ISwapRouter.sol";
import "../weth/IWETH.sol";
import "../WethProvider.sol";
import "./libraries/Path.sol";

abstract contract Algebra is WethProvider {
    using Path for bytes;

    struct AlgebraData {
        bytes path;
        uint256 deadline;
        bool feeOnTransfer;
    }

    function swapOnAlgebra(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        AlgebraData memory data = abi.decode(payload, (AlgebraData));

        address _fromToken = address(fromToken) == Utils.ethAddress() ? WETH : address(fromToken);
        address _toToken = address(toToken) == Utils.ethAddress() ? WETH : address(toToken);

        if (address(fromToken) == Utils.ethAddress()) {
            IWETH(WETH).deposit{ value: fromAmount }();
        }

        Utils.approve(address(exchange), _fromToken, fromAmount);

        if (data.feeOnTransfer) {
            (address tokenA, address tokenB) = data.path.decodeFirstPool();
            ISwapRouter(exchange).exactInputSingleSupportingFeeOnTransferTokens(
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: tokenA,
                    tokenOut: tokenB,
                    recipient: address(this),
                    deadline: data.deadline,
                    amountIn: fromAmount,
                    amountOutMinimum: 1,
                    limitSqrtPrice: 0
                })
            );
        } else {
            ISwapRouter(exchange).exactInput(
                ISwapRouter.ExactInputParams({
                    path: data.path,
                    recipient: address(this),
                    deadline: data.deadline,
                    amountIn: fromAmount,
                    amountOutMinimum: 1
                })
            );
        }

        if (address(toToken) == Utils.ethAddress()) {
            IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        }
    }

    function buyOnAlgebra(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 toAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        AlgebraData memory data = abi.decode(payload, (AlgebraData));

        address _fromToken = address(fromToken) == Utils.ethAddress() ? WETH : address(fromToken);
        address _toToken = address(toToken) == Utils.ethAddress() ? WETH : address(toToken);

        if (address(fromToken) == Utils.ethAddress()) {
            IWETH(WETH).deposit{ value: fromAmount }();
        }

        Utils.approve(address(exchange), _fromToken, fromAmount);

        ISwapRouter(exchange).exactOutput(
            ISwapRouter.ExactOutputParams({
                path: data.path,
                recipient: address(this),
                deadline: data.deadline,
                amountOut: toAmount,
                amountInMaximum: fromAmount
            })
        );

        if (address(fromToken) == Utils.ethAddress() || address(toToken) == Utils.ethAddress()) {
            IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));
        }
    }
}
