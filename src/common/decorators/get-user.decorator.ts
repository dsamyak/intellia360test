import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated User object (or a specific property) from the request.
 * 
 * @example
 * @Get('profile')
 * getProfile(@GetUser() user: any) {}
 * 
 * @example
 * @Get('id')
 * getId(@GetUser('id') userId: string) {}
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
