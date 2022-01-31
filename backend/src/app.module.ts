import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientApiController } from './client-api/client-api.controller';
import { ConnectionRepo } from './db/connection.repo';
import { ServerApiInboundController } from './server-api/server-api-inbound.controller';
import { ColorPickerService } from './services/color-picker.service';
import { ConnectionService } from './services/connection.service';
import { InvitationCodeService } from './services/invitation-code.service';
import { MessageService } from './services/message.service';
import { ServerApiOutboundService } from './services/server-api-outbound.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        // defaults are for local dev setup
        MY_NAME: Joi.string().default('Alice'),
        MY_URL: Joi.string().default('http://localhost:3000'),
      }),
    }),
    HttpModule,
  ],
  controllers: [ClientApiController, ServerApiInboundController],
  providers: [
    ColorPickerService,
    ConnectionRepo,
    ConnectionService,
    InvitationCodeService,
    MessageService,
    ServerApiOutboundService,
  ],
})
export class AppModule {}
