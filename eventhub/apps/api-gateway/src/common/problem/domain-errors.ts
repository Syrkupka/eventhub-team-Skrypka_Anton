// Доменні помилки нічого не знають про HTTP.
// Перекладом на мову статус-кодів займається problem.ts.
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EventNotFound extends DomainError {
  constructor(readonly eventId: string) {
    super(`Подію ${eventId} не знайдено`);
  }
}

export class InvalidCursor extends DomainError {
  constructor(readonly cursor: string) {
    super("Курсор пошкоджений або не належить цьому списку");
  }
}

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export class RequestValidationFailed extends DomainError {
  constructor(readonly issues: ValidationIssue[]) {
    super("Запит не пройшов валідацію");
  }
}
