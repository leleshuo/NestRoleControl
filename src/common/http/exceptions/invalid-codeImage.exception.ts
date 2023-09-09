import { UnauthorizedException } from '@nestjs/common';
import { ErrorType } from '../../enums';

export class InvalidCodeImageException extends UnauthorizedException {
  constructor() {
    super({
      errorType: ErrorType.InvalidCodeIMAGE,
      message: '验证码错误',
      code: 406,
    });
  }
}
export class ExpiredCodeImageException extends UnauthorizedException {
  constructor() {
    super({
      errorType: ErrorType.CodeIMAGEExpired,
      message: '验证码超时',
      code: 406,
    });
  }
}
