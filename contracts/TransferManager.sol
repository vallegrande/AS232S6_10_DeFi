// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransferManager {
    function transfer(address payable _to, uint256 _amount) public {
        require(address(this).balance >= _amount, "Saldo insuficiente en el contrato");
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transferencia fallida");
    }

    function deposit() public payable {
        emit Deposit(msg.sender, msg.value);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    event Deposit(address indexed from, uint256 amount);
}
