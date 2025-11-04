import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './modules/bot/bot.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CRM Api Docs')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const platformDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, platformDocument);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT ?? 3000);

  const botService = app.get(BotService);
  botService.initBot();
  botService.launch();

  console.log('✅ NestJS application and Telegram bot started!');
}
bootstrap();
