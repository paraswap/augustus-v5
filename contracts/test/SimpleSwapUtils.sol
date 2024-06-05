// SPDX-License-Identifier: ISC

pragma solidity ^0.7.0;
pragma abicoder v2;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IUniswapV2Router01 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

contract TestSimpleSwapUtils {
    address public uniswapV2Router02 = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    address public USDC = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    address public WETH = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    function getUniswapUSDCETHCalls(uint256 _amountUSDC, address _receiver)
        external
        view
        returns (bytes[] memory _calls)
    {
        address[] memory _path = new address[](2);
        _path[0] = USDC;
        _path[1] = WETH;
        _calls = new bytes[](2);
        _calls[0] = abi.encodeWithSelector(IERC20.approve.selector, uniswapV2Router02, _amountUSDC);
        _calls[1] = abi.encodeWithSelector(
            IUniswapV2Router01.swapExactTokensForETH.selector,
            _amountUSDC,
            0,
            _path,
            _receiver,
            block.timestamp * 2
        );
    }

    function getUniswapETHUSDCCalls(address _receiver) external view returns (bytes[] memory _calls) {
        address[] memory _path = new address[](2);
        _path[0] = WETH;
        _path[1] = USDC;
        _calls = new bytes[](1);
        _calls[0] = abi.encodeWithSelector(
            IUniswapV2Router01.swapExactETHForTokens.selector,
            0,
            _path,
            _receiver,
            block.timestamp * 2
        );
    }
}
