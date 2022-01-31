/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Controller,
  HttpCode,
  HttpStatus,
  INestApplication,
  Module,
  Post,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

/** Simulates another webchat server on a localhost port
 * by exposing the webchat server api routes.
 * This is useful for E2E testing functionality which involves
 * calls to another webchat server.
 * All calls return HTTP 200 OK.
 */

const mockServerPort = 9999;
export const mockServerUrl = `http://localhost:${mockServerPort}`;

@Controller('server')
class MockServerController {
  @Post(':connectionId/confirm')
  @HttpCode(HttpStatus.OK)
  receiveConfirmation(): void {}

  @Post(':connectionId')
  @HttpCode(HttpStatus.OK)
  receiveMessage(): void {}
}

@Module({
  controllers: [MockServerController],
})
class MockServerModule {}

export const bootstrapMockServer = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(MockServerModule);

  app.enableCors();

  await app.listen(mockServerPort);

  return app;
};
