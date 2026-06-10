import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { FaucetService } from './faucet.service';

@Controller('faucet')
export class FaucetController {
  private readonly logger = new Logger(FaucetController.name);

  constructor(private readonly faucetService: FaucetService) {}

  @Post('request')
  async request(@Body() body: { to: string; amount?: number }) {
    const { to, amount } = body;

    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      return { success: false, error: 'Invalid Ethereum address' };
    }

    const amt = amount ?? 0.001;
    if (typeof amt !== 'number' || amt < 0.001 || amt > 0.01) {
      return { success: false, error: 'Amount must be between 0.001 and 0.01 ETH' };
    }

    try {
      const result = await this.faucetService.requestFunds(to, amt);
      return { success: true, txHash: result.txHash };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Request failed: ${msg}`);
      return { success: false, error: msg };
    }
  }

  @Get('status')
  status() {
    return this.faucetService.getStatus();
  }
}
