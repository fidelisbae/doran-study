import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupSwagger } from './commons/utils/swaggerSetup.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  app.enableCors();

  await app.listen(3001);
}
bootstrap();
