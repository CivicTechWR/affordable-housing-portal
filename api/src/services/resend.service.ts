import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend, CreateEmailOptions, CreateEmailResponse } from 'resend';

@Injectable()
export class ResendService {
  private readonly resend: Resend;

  constructor(configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('EMAIL_API_KEY'));
  }

  public async send(data: CreateEmailOptions): Promise<CreateEmailResponse> {
    return this.resend.emails.send(data);
  }
}
