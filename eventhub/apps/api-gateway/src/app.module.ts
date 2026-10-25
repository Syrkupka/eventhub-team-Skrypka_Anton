import { randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { CatalogModule } from "./catalog/catalog.module";
import { ProblemFilter } from "./common/problem/problem.filter";
import { HealthModule } from "./health/health.module";

const env = {
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

/**
 * Кореневий модуль застосунку.
 */
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: env.LOG_LEVEL,

        // беремо x-request-id від клієнта/проксі, якщо він є, інакше генеруємо
        genReqId: (req, res) => {
          const incoming = req.headers["x-request-id"];
          const id = typeof incoming === "string" && incoming ? incoming : randomUUID();
          res.setHeader("x-request-id", id);
          return id;
        },

        // ці поля ніколи не потрапляють у лог
        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          "res.headers['set-cookie']",
        ],

        transport:
          env.NODE_ENV === "development"
            ? { target: "pino-pretty", options: { singleLine: true } }
            : undefined,
      },
    }),
    HealthModule,
    CatalogModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ProblemFilter }],
})
export class AppModule {}
