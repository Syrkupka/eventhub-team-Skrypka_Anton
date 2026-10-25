import type { z } from "zod";

// Клас-обгортка над Zod-схемою: Nest передає в pipe тип параметра
// (завдяки emitDecoratorMetadata), а схему pipe бере зі статичного поля.
export interface ZodDtoClass<S extends z.ZodTypeAny = z.ZodTypeAny> {
  new (): z.infer<S>;
  zodSchema: S;
}

export function createZodDto<S extends z.ZodTypeAny>(schema: S): ZodDtoClass<S> {
  class Dto {
    static zodSchema = schema;
  }
  return Dto as unknown as ZodDtoClass<S>;
}
