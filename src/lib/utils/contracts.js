import { Interface, parseEther } from "ethers";

export const TRANSFER_MANAGER_ABI = [
  "function transfer(address payable _to, uint256 _amount) public",
  "function deposit() public payable",
  "function getContractBalance() public view returns (uint256)",
  "event Deposit(address indexed from, uint256 amount)"
];

const iface = new Interface(TRANSFER_MANAGER_ABI);

export function encodeDeposit() {
  return iface.encodeFunctionData("deposit");
}

export function encodeTransfer(to, amountEth) {
  return iface.encodeFunctionData("transfer", [to, parseEther(String(amountEth))]);
}

export function decodeBalance(data) {
  return iface.decodeFunctionResult("getContractBalance", data);
}
