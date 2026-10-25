import { HttpException } from "@nestjs/common";
import type { Problem } from "@eventhub/contracts";
import {
  EventNotFound,
  InvalidCursor,
  RequestValidationFailed,
} from "./domain-errors";
import type { ValidationIssue } from "./domain-errors";

export type ProblemBody = Problem & { errors?: ValidationIssue[] };

// Чиста функція: помилка → тіло відповіді RFC 9457.
// Нічого не знає про запит і відповідь, тож тестується без сервера.
export function toProblem(err: unknown): ProblemBody {
  if (err instanceof RequestValidationFailed) {
    return {
      type: "/errors/invalid-query",
      title: "Некоректний параметр запиту",
      status: 400,
      detail: err.issues.map((i) => `${i.field}: ${i.message}`).join("; "),
      errors: err.issues,
    };
  }
  if (err instanceof InvalidCursor) {
    return {
      type: "/errors/invalid-cursor",
      title: "Некоректний курсор",
      status: 400,
      detail: err.message,
    };
  }
  if (err instanceof EventNotFound) {
    return {
      type: "/errors/not-found",
      title: "Подію не знайдено",
      status: 404,
      detail: err.message,
    };
  }
  // помилки самого Nest: неіснуючий маршрут, неправильний метод тощо
  if (err instanceof HttpException) {
    return {
      type: "about:blank",
      title: err.message,
      status: err.getStatus(),
    };
  }
  // усе інше – 500 без деталей: стектрейс іде в лог, а не клієнту
  return { type: "about:blank", title: "Внутрішня помилка сервера", status: 500 };
}
