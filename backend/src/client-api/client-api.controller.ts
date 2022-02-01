import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ConnectionRepo } from '@src/db/connection.repo';
import { ConnectionService } from '@src/services/connection.service';
import { MessageService } from '@src/services/message.service';
import {
  ReceiveInvitationReqDto,
  ContactDto,
  CreateInvitationResDto,
  GetContactsResDto,
  GetMessagesResDto,
  GetMyInfoResDto,
  MessageDto,
  SendMessageReqDto,
} from './dtos';

@Controller('client')
export class ClientApiController {
  constructor(
    private readonly config: ConfigService,
    private readonly connections: ConnectionRepo,
    private readonly connectionService: ConnectionService,
    private readonly messageService: MessageService,
  ) {}

  @Post('create-invitation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invitation', tags: ['Client'] })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created',
    type: () => CreateInvitationResDto,
  })
  createInvitation(): CreateInvitationResDto {
    const invitationCode = this.connectionService.createInvitation();
    return { invitationCode };
  }

  @Post('receive-invitation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add contact through invitation code',
    tags: ['Client'],
  })
  @ApiBody({ type: () => ReceiveInvitationReqDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Invalid invitation code',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict: Connection already added',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Internal Server Error: Could not confirm connection with inviter',
  })
  async receiveInvitation(
    @Body() body: ReceiveInvitationReqDto,
  ): Promise<void> {
    await this.connectionService.receiveInvitation(body.invitationCode);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get confirmed contacts', tags: ['Client'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OK',
    type: () => GetContactsResDto,
  })
  getContacts(): GetContactsResDto {
    const connections = this.connections.findAllConfirmed();
    const result = connections.map((c) => ContactDto.fromConnection(c));
    return { result };
  }

  @Get('messages/:connectionId')
  @ApiOperation({ summary: 'Get messages for contact', tags: ['Client'] })
  @ApiParam({
    description: 'Connection ID',
    name: 'connectionId',
    required: true,
    type: String,
    example: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OK',
    type: () => GetMessagesResDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: Unknown connection ID',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Connection still unconfirmed',
  })
  getMessagesFor(
    @Param('connectionId') connectionId: string,
  ): GetMessagesResDto {
    const connection = this.connections.find(connectionId);
    if (!connection) {
      throw new NotFoundException('unknown connection id');
    }
    if (connection.status !== 'confirmed') {
      throw new BadRequestException('connection still unconfirmed');
    }
    const result = connection.messages.map((m) => MessageDto.fromMessage(m));
    return { result };
  }

  @Post('messages/:connectionId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message to contact', tags: ['Client'] })
  @ApiParam({
    description: 'Connection ID',
    name: 'connectionId',
    required: true,
    type: String,
    example: '9f3cc2ef-8ed6-4ae3-bafd-daae422bcaa3',
  })
  @ApiBody({ type: () => SendMessageReqDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found: Unknown connection ID',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request: Connection still unconfirmed',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error: Message could not be delivered',
  })
  async sendMessageTo(
    @Param('connectionId') connectionId: string,
    @Body() body: SendMessageReqDto,
  ): Promise<void> {
    await this.messageService.send(connectionId, body.msg);
  }

  @Get('my-info')
  @ApiOperation({ summary: 'Get user info', tags: ['Client'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OK',
    type: () => GetMyInfoResDto,
  })
  getMyInfo(): GetMyInfoResDto {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const name = this.config.get('MY_NAME')!;
    return { name };
  }
}
