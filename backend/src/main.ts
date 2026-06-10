import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['POST'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Faucet API running on http://localhost:${port}`);

  const faucetAddress = process.env.FAUCET_ADDRESS;
  if (faucetAddress) {
    console.log(`Faucet wallet: ${faucetAddress}`);
    console.log(`Fund this address with ~0.001 Sepolia ETH for gas`);
  }
}
bootstrap();
