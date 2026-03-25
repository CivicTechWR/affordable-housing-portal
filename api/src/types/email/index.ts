import type {
  CreateBatchRequestOptions,
  CreateBatchResponse,
  CreateEmailOptions,
  CreateEmailResponse,
} from 'resend';

export type EmailAttachmentData = {
  data: string;
  name: string;
  type: string;
};

export type HtmlEmailPayload = Extract<CreateEmailOptions, { html: string }>;

export type BatchHtmlEmailPayload = Omit<
  HtmlEmailPayload,
  'attachments' | 'scheduledAt'
>;

export type SingleEmailResponse = CreateEmailResponse;
export type BatchEmailResponse = CreateBatchResponse<CreateBatchRequestOptions>;
