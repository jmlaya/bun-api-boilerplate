import type { ZodType } from 'zod';
import { ZodError } from 'zod';
import { zValidator as zv } from '@hono/zod-validator';

export const jsonValidator = <T extends ZodType>(schema: T) =>
  zv('json', schema, (result) => {
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
  });
