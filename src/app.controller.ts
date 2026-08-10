import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  index() {
    return {
      name: 'Intellia360 API',
      version: '1.0',
      status: 'running',
      docs: '/api/docs',
    };
  }

  @Get('health')
  @ApiExcludeEndpoint()
  health() {
    return {
      status: 'ok',
      service: 'intellia360-api',
      timestamp: new Date().toISOString(),
    };
  }
}
