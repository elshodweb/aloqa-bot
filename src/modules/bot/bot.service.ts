import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot?: Telegraf;
  private targetChatId?: string;

  constructor(private readonly configService: ConfigService) {}

  async initBot() {
    const token =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      process.env.TELEGRAM_BOT_TOKEN;
    this.targetChatId =
      this.configService.get<string>('TELEGRAM_TARGET_CHAT_ID') ||
      process.env.TELEGRAM_TARGET_CHAT_ID;

    if (!token) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN is not set; Telegram bot is disabled',
      );
      return;
    }

    this.bot = new Telegraf(token);

    this.bot.start(async (ctx) => {
      const fromId = String(ctx.update.message.from.id);
      const targetId = String(this.targetChatId ?? '');
      if (!targetId || fromId === targetId) {
        await ctx.reply('✅ Bot is running');
        return;
      }
      await ctx.reply('❌ You are not authorized to use this bot.');
    });
  }

  async launch() {
    if (!this.bot) return;
    await this.bot.launch();
    this.logger.log('🚀 Telegram bot started (long polling)');
  }


  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop('SIGTERM');
      this.logger.log('Telegram bot stopped');
    }
  }

  async sendToTarget(text: string) {
    if (!this.bot || !this.targetChatId) return;
    try {
      await this.bot.telegram.sendMessage(this.targetChatId, text, {
        parse_mode: 'HTML',
      } as any);
    } catch (err) {
      this.logger.error('Failed to send message to target chat', err as Error);
    }
  }
}
