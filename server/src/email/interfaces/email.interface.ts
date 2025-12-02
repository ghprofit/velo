export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject?: string;
  requiredVariables: string[];
}

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  fromName?: string;
  subject?: string; // Optional when using templateId
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  customArgs?: Record<string, string>;
  sendAt?: number; // Unix timestamp for scheduled sending
  batchId?: string; // For grouping emails
}

export interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition?: 'attachment' | 'inline';
  content_id?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  statusCode?: number;
  error?: string;
}

export interface BulkEmailResult {
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  failures: Array<{
    email: string;
    error: string;
  }>;
}
