import type { Context, Next } from "koa";
import { HttpCode, HttpMessage } from "../response";

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
	try {
		await next();
	} catch (e) {
		ctx.status = e.statusCode || HttpCode.INTERNAL_SERVER_ERROR;
		ctx.body = e.message || "Internal Server Error";
	}
}

class ApiError extends Error {
	statusCode: number;

	constructor(statusCode: HttpCode, message?: string) {
		super(message || HttpMessage[statusCode]);

		this.statusCode = statusCode;
	}
}

export class MalformedDataError extends ApiError {
	constructor() {
		super(HttpCode.INTERNAL_SERVER_ERROR);
	}
}

export class RecordNotFoundError extends ApiError {
	constructor() {
		super(HttpCode.NOT_FOUND);
	}
}

export class UniqueFieldError extends ApiError {
	constructor(key: string, value: string) {
		super(
			HttpCode.BAD_REQUEST,
			`${value} has already been set for field ${key}`
		);
	}
}
