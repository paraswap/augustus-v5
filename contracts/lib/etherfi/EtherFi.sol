// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../weth/IWETH.sol";
import "../Utils.sol";
import "./IEtherFI.sol";

contract EtherFI {
    address public immutable weth;
    address public immutable eETH;
    address public immutable eETHPool;
    address public immutable weETH;

    constructor(
        address _weth,
        address _eETH,
        address _eETHPool,
        address _weETH
    ) {
        weth = _weth;
        eETH = _eETH;
        eETHPool = _eETHPool;
        weETH = _weETH;
    }

    /*
        This function supports
        - eth -> eETH
        - weth -> eETH
        - eETH -> weETH
        - weETH -> eETH
    */
    function swapOnEtherFi(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount
    ) internal {
        if (address(fromToken) == weth) {
            IWETH(weth).withdraw(fromAmount);
            fromToken = IERC20(Utils.ethAddress());
        }

        if (address(fromToken) == Utils.ethAddress() && address(toToken) == eETH) {
            IEtherFi(eETHPool).deposit{ value: fromAmount }();
        } else if (address(fromToken) == eETH && address(toToken) == weETH) {
            Utils.approve(weETH, eETH, fromAmount);
            IEtherFi(weETH).wrap(fromAmount);
        } else if (address(fromToken) == weETH && address(toToken) == eETH) {
            IEtherFi(weETH).unwrap(fromAmount);
        } else {
            revert("Swap not supported");
        }
    }
}
