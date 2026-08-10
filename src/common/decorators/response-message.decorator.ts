import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

/**
 * Decorator to attach a custom success message to controller routes.
 * Used by TransformInterceptor to construct standard API responses.
 * 
 * @example
 * @ResponseMessage('User registered successfully')
 * @Post('register')
 * register(...) {}
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
