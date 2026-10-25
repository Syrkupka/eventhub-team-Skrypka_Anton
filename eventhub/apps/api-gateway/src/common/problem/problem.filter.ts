import { Catch } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { toProblem } from "./problem";

@Catch()
export class ProblemFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(ProblemFilter.name) private readonly logger: PinoLogger,
  ) {}

  catch(err: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const problem = toProblem(err);

    // 4xx – очікувана поведінка, тому не error, а debug
    if (problem.status >= 500) {
      this.logger.error({ err, url: req.url }, "unhandled error");
    } else {
      this.logger.debug({ type: problem.type, url: req.url }, "request rejected");
    }

    ctx
      .getResponse<Response>()
      .status(problem.status)
      .type("application/problem+json")
      .json({ ...problem, instance: req.originalUrl });
  }
}
