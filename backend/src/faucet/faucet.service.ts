import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JsonRpcProvider, Wallet, Contract, parseEther, HDNodeWallet } from 'ethers';

const CONTRACT_ADDRESS = '0x5E7D4159abb284199Cc9c6EE5261Dd5255DD2E51';

const TRANSPARENT_WALLET_ABI = [
  'function transfer(address payable to, uint256 amount) external',
  'function deposit() external payable',
  'function getBalance() external view returns (uint256)',
  'event Deposited(address indexed from, uint256 amount, uint256 timestamp)',
  'event Transferred(address indexed caller, address indexed to, uint256 amount, uint256 timestamp)',
];

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com/';

@Injectable()
export class FaucetService implements OnModuleInit {
  private readonly logger = new Logger(FaucetService.name);
  private provider: JsonRpcProvider;
  private contract!: Contract;
  private signer!: Wallet | HDNodeWallet;
  private faucetAddress!: string;
  private lastRequest: Map<string, number> = new Map();
  private readonly cooldownMs = 30_000;

  constructor() {
    this.provider = new JsonRpcProvider(RPC_URL, undefined, {
      staticNetwork: true,
    });
  }

  async onModuleInit() {
    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    if (privateKey) {
      this.signer = new Wallet(privateKey, this.provider);
    } else {
      this.signer = Wallet.createRandom().connect(this.provider);
      this.logger.warn('No FAUCET_PRIVATE_KEY set. Generated random wallet.');
    }

    this.faucetAddress = this.signer.address;
    this.contract = new Contract(CONTRACT_ADDRESS, TRANSPARENT_WALLET_ABI, this.signer);

    process.env.FAUCET_ADDRESS = this.faucetAddress;

    this.logger.log(`Faucet wallet address: ${this.faucetAddress}`);
    this.logger.log(`Contract address: ${CONTRACT_ADDRESS}`);

    const balance = await this.provider.getBalance(this.faucetAddress);
    this.logger.log(`Faucet wallet balance: ${balance.toString()} wei`);
  }

  async requestFunds(to: string, amountEth?: number): Promise<{ txHash: string }> {
    const now = Date.now();
    const last = this.lastRequest.get(to) ?? 0;
    if (now - last < this.cooldownMs) {
      throw new Error(`Please wait before requesting again.`);
    }

    const amount = amountEth ?? 0.001;

    const balance = await this.provider.getBalance(this.faucetAddress);
    if (balance === 0n) {
      throw new Error(
        `Faucet wallet has no ETH for gas. Send ~0.001 Sepolia ETH to ${this.faucetAddress} to activate.`,
      );
    }

    const tx = await this.contract.transfer(to, parseEther(String(amount)));
    this.logger.log(`Tx sent: ${tx.hash}`);

    const receipt = await tx.wait();
    this.logger.log(`Tx confirmed: ${receipt.hash}`);

    this.lastRequest.set(to, now);

    return { txHash: receipt.hash };
  }

  getStatus() {
    return {
      faucetAddress: this.faucetAddress,
      contractAddress: CONTRACT_ADDRESS,
      network: 'Sepolia',
      configured: !!process.env.FAUCET_PRIVATE_KEY,
    };
  }
}
