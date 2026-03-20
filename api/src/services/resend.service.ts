import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend, CreateEmailOptions } from 'resend';
import {
  BatchEmailPayload,
  BatchEmailResponse,
  SingleEmailResponse,
} from '../types/email';

@Injectable()
export class ResendService {
  private readonly resend: Resend;

  constructor(configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('EMAIL_API_KEY'));
  }

  /**
   * Forwards a fully constructed email payload to the Resend SDK.
   *
   * @param data - The email payload (to, from, subject, html, attachments, etc.).
   * @returns The Resend API response containing the created email ID.
   */
  public async send(data: CreateEmailOptions): Promise<SingleEmailResponse> {
    return this.resend.emails.send(data);
  }

  /**
   * Sends multiple emails in a single batch API call.
   * Attachments and scheduledAt are not supported by the batch endpoint.
   *
   * @param data - Array of email payloads (max 100 per call).
   * @returns The Resend API response containing the created email IDs.
   */
  public async sendBatch(
    data: BatchEmailPayload[],
  ): Promise<BatchEmailResponse> {
    return this.resend.batch.send(data);
  }
}
