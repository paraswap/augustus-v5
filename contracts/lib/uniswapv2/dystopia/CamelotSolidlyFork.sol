// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "../../Utils.sol";
import "../../weth/IWETH.sol";

interface ICamelotPair {
    function getAmountOut(uint256, address) external view returns (uint256);

    function token0() external returns (address);

    function token1() external returns (address);

    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to,
        bytes calldata data
    ) external;

    function stableSwap() external returns (bool);
}

abstract contract CamelotSolidlyFork {
    using SafeMath for uint256;

    // Pool bits are 255-161: fee, 160: direction flag, 159-0: address
    uint256 constant CAMELOT_FEE_OFFSET = 161;
    uint256 constant CAMELOT_DIRECTION_FLAG = 0x0000000000000000000000010000000000000000000000000000000000000000;

    struct SolidlyData {
        address weth;
        uint256[] pools;
        bool isFeeTokenInRoute;
    }

    function swapOnCamelotSolidlyFork(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        bytes calldata payload
    ) internal {
        SolidlyData memory data = abi.decode(payload, (SolidlyData));
        if (data.isFeeTokenInRoute) {
            _swapOnCamelotSolidlyForkWithTransferFee(address(fromToken), fromAmount, data.weth, data.pools);
        } else {
            _swapOnCamelotSolidlyFork(address(fromToken), fromAmount, data.weth, data.pools);
        }
    }

    function _swapOnCamelotSolidlyForkWithTransferFee(
        address tokenIn,
        uint256 amountIn,
        address weth,
        uint256[] memory pools
    ) private returns (uint256 tokensBought) {
        uint256 pairs = pools.length;

        require(pairs != 0, "At least one pool required");

        bool tokensBoughtEth;

        uint256 balanceBeforeTransfer;
        if (tokenIn == Utils.ethAddress()) {
            balanceBeforeTransfer = Utils.tokenBalance(weth, address(pools[0]));
            IWETH(weth).deposit{ value: amountIn }();
            require(IWETH(weth).transfer(address(pools[0]), amountIn));
            tokensBought = Utils.tokenBalance(weth, address(pools[0])) - balanceBeforeTransfer;
        } else {
            balanceBeforeTransfer = Utils.tokenBalance(tokenIn, address(pools[0]));
            TransferHelper.safeTransfer(tokenIn, address(pools[0]), amountIn);
            tokensBoughtEth = weth != address(0);
            tokensBought = Utils.tokenBalance(tokenIn, address(pools[0])) - balanceBeforeTransfer;
        }

        for (uint256 i = 0; i < pairs; ++i) {
            uint256 p = pools[i];
            address pool = address(p);
            bool direction = p & CAMELOT_DIRECTION_FLAG == 0;

            address to;
            address _nextTokenIn;

            if (i + 1 == pairs) {
                to = address(this);
                _nextTokenIn = pools[i] & CAMELOT_DIRECTION_FLAG == 0
                    ? ICamelotPair(pool).token1()
                    : ICamelotPair(pool).token0();
            } else {
                to = address(pools[i + 1]);
                _nextTokenIn = pools[i + 1] & CAMELOT_DIRECTION_FLAG == 0
                    ? ICamelotPair(pool).token0()
                    : ICamelotPair(pool).token1();
            }

            tokensBought = ICamelotPair(pool).getAmountOut(
                tokensBought,
                direction ? ICamelotPair(pool).token0() : ICamelotPair(pool).token1()
            );

            (uint256 amount0Out, uint256 amount1Out) = direction
                ? (uint256(0), tokensBought)
                : (tokensBought, uint256(0));

            balanceBeforeTransfer = Utils.tokenBalance(_nextTokenIn, to);
            ICamelotPair(pool).swap(amount0Out, amount1Out, to, "");
            tokensBought = Utils.tokenBalance(_nextTokenIn, to) - balanceBeforeTransfer;
        }

        if (tokensBoughtEth) {
            IWETH(weth).withdraw(tokensBought);
        }
    }

    function _swapOnCamelotSolidlyFork(
        address tokenIn,
        uint256 amountIn,
        address weth,
        uint256[] memory pools
    ) private returns (uint256 tokensBought) {
        uint256 pairs = pools.length;

        require(pairs != 0, "At least one pool required");

        bool tokensBoughtEth;

        if (tokenIn == Utils.ethAddress()) {
            IWETH(weth).deposit{ value: amountIn }();
            require(IWETH(weth).transfer(address(pools[0]), amountIn));
        } else {
            TransferHelper.safeTransfer(tokenIn, address(pools[0]), amountIn);
            tokensBoughtEth = weth != address(0);
        }

        tokensBought = amountIn;

        for (uint256 i = 0; i < pairs; ++i) {
            uint256 p = pools[i];
            address pool = address(p);
            bool direction = p & CAMELOT_DIRECTION_FLAG == 0;

            tokensBought = ICamelotPair(pool).getAmountOut(
                tokensBought,
                direction ? ICamelotPair(pool).token0() : ICamelotPair(pool).token1()
            );

            if (ICamelotPair(pool).stableSwap()) {
                tokensBought = tokensBought.sub(100); // deduce 100wei to mitigate stable swap's K miscalculations
            }

            (uint256 amount0Out, uint256 amount1Out) = direction
                ? (uint256(0), tokensBought)
                : (tokensBought, uint256(0));
            ICamelotPair(pool).swap(amount0Out, amount1Out, i + 1 == pairs ? address(this) : address(pools[i + 1]), "");
        }

        if (tokensBoughtEth) {
            IWETH(weth).withdraw(tokensBought);
        }
    }
}
