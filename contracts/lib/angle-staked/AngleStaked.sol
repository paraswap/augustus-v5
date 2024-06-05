// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Utils.sol";
import "./IAngleStakedStableEventPool.sol";

contract AngleStaked {
    struct AngleStakedData {
        bool toStaked;
    }

    function swapOnAngleStaked(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        AngleStakedData memory data = abi.decode(payload, (AngleStakedData));

        if (data.toStaked) {
            Utils.approve(exchange, address(fromToken), fromAmount);
            IAngleStakedStableEventPool(exchange).deposit(fromAmount, address(this));
        } else {
            IAngleStakedStableEventPool(exchange).redeem(fromAmount, address(this), address(this));
        }
    }

    function buyOnAngleStaked(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 destAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        AngleStakedData memory data = abi.decode(payload, (AngleStakedData));

        if (data.toStaked) {
            Utils.approve(exchange, address(fromToken), fromAmount);
            IAngleStakedStableEventPool(exchange).mint(destAmount, address(this));
        } else {
            IAngleStakedStableEventPool(exchange).withdraw(destAmount, address(this), address(this));
        }
    }
}
