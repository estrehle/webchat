import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ConnectionService } from '@src/services/connection.service';
import { MessageService } from '@src/services/message.service';
import { SendConfirmationReqDto, SendMessageReqDto } from './dtos';

@Controller('server')
export class ServerApiInboundController {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly messageService: MessageService,
  ) {}

  @Post(':connectionId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm connection', tags: ['Server'] })
  @ApiParam({
    description: 'Connection ID',
    name: 'connectionId',
    required: true,
    type: String,
    example: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
  })
  @ApiBody({ type: () => SendConfirmationReqDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found: Unknown connection ID' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request: Connection already confirmed' })
  receiveConfirmation(
    @Param('connectionId') connectionId: string,
    @Body() body: SendConfirmationReqDto,
  ): void {
    this.connectionService.receiveConfirmation({ connectionId, ...body });
  }

  @Post(':connectionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send message', tags: ['Server'] })
  @ApiParam({
    description: 'Connection ID',
    name: 'connectionId',
    required: true,
    type: String,
    example: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
  })
  @ApiBody({ type: () => SendMessageReqDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found: Unknown connection ID' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request: Connection still unconfirmed' })
  receiveMessage(
    @Param('connectionId') connectionId: string,
    @Body() body: SendMessageReqDto,
  ): void {
    this.messageService.receive(connectionId, body.msg);
  }
}
