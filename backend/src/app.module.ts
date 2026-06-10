import { Module } from '@nestjs/common';
import { FaucetModule } from './faucet/faucet.module';

@Module({
  imports: [FaucetModule],
})
export class AppModule {}
