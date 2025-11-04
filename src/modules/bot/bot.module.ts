import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
