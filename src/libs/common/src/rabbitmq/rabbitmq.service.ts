import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(private readonly configService: ConfigService) {}
  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        // urls: [this.configService.get<string>('RABBIT_MQ_URI')],
        urls: ['amqp://localhost:5672'],
        // queue: this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`),
        queue: 'RABBIT_MQ_USER_QUEUE',
        noAck,
        persistent: true,
      },
    };
  }
}
