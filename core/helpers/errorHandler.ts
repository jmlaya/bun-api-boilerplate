import { HTTPException } from "hono/http-exception";
import { HTTPResponseError } from "hono/types";
import { z } from "zod";
import { log } from "../log";
import { AppContext } from "../types";

export const errorHandler = async (err: Error | HTTPResponseError, c: AppContext) => {
  if (err instanceof HTTPException) {
    return c.json({ exception: err.constructor.name, message: err.message }, err.status);
  }

  if (err instanceof z.ZodError) {
    return c.json(
      {
        errors: err.issues,
        exception: "ValidationException",
      },
      400,
    );
  }

  log.ERROR(err.message, err.stack);
  return c.json({ exception: "UnhandledException", message: err.message }, 500);
};
