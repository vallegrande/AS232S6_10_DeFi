// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransparentWallet {
    event Deposited(address indexed from, uint256 amount, uint256 timestamp);
    event Transferred(address indexed caller, address indexed to, uint256 amount, uint256 timestamp);

    receive() external payable {
        emit Deposited(msg.sender, msg.value, block.timestamp);
    }

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value, block.timestamp);
    }

    function transfer(address payable to, uint256 amount) external {
        require(address(this).balance >= amount, "Saldo insuficiente en el contrato");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transferencia fallida");
        emit Transferred(msg.sender, to, amount, block.timestamp);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
