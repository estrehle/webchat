import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors();

  // api docs
  const clientDocsConfig = new DocumentBuilder()
    .setTitle('Webchat API')
    .setDescription('API Docs for Webchat APIs.')
    .build();
  const clientDocs = SwaggerModule.createDocument(app, clientDocsConfig);
  const clientDocsCustomOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Webchat API Docs',
  };
  SwaggerModule.setup('/docs', app, clientDocs, clientDocsCustomOptions);

  await app.listen(3000);
}
bootstrap();
