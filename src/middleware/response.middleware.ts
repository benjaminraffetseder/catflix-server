import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class ResponseMiddleware implements NestMiddleware {
  logger = new Logger('Response');

  constructor() {}

  /**
   * This middleware logs the request and response status code in the console.
   * The format of the log is:
   * <METHOD> <URL> <STATUS CODE> <RESPONSE TIME IN MS>
   *
   * @param {Request} req - The incoming request
   * @param {Response} res - The outgoing response
   * @param {NextFunction} next - The next middleware in the stack
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const requestStartTime = new Date().getTime();

    /**
     * This event is emitted when the response is finished.
     * We log the request and response information in this listener.
     */
    res.on('finish', () => {
      const { statusCode } = res;

      const responseTime = new Date().getTime();
      const duration = responseTime - requestStartTime;
      const message = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

      /**
       * Log the request and response information in the console.
       */
      this.logger.log(message);
    });

    /**
     * Call the next middleware in the stack.
     */
    next();
  }
}
