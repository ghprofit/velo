import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  getAppInfo() {
    return {
      name: 'VeloLink API',
      description: 'Content platform with authentication, verification, and anonymous buyer tracking',
      version: '1.0.0',
      apiPrefix: 'api',
    };
  }
}
