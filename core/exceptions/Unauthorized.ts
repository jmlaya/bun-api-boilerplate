import { HTTPException } from "hono/http-exception";

export class UnauthorizedException extends HTTPException {
  constructor(message?: string, cause?: any) {
    super(401, {
      message: message || "Unauthorized",
      ...(cause ? { cause } : {}),
    });
  }
}
