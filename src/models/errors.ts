import type { Context, Next } from "koa";

export async function errorHandler(ctx: Context, next: Next) {
    try {
        await next();
    } catch(e) {
        ctx.status = e.statusCode || 500;
        ctx.body = e.message || "Internal Server Error"
    }
}

class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message?: string) {
        super(message);

        this.statusCode = statusCode;
    }
}

export class UniqueFieldError extends ApiError {
    constructor(key: string, value: string) {
        super(400, `${value} has already been set for field ${key}`);
    }
}

export class MalformedDataError extends ApiError {
    constructor() {
        super(500);
    }
}
