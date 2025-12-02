export interface VeriffConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  webhookSecret?: string;
}

export interface VeriffModuleOptions {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  webhookSecret?: string;
}
