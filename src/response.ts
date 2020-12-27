import type { Context } from "koa";

export enum HttpCode {
	OK = 200,
	CREATED = 201,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
}

export const HttpMessage: { [key in HttpCode]: string } = {
	[HttpCode.OK]: "Ok",
	[HttpCode.CREATED]: "Created",
	[HttpCode.NO_CONTENT]: "No Content",
	[HttpCode.BAD_REQUEST]: "Bad Request",
	[HttpCode.NOT_FOUND]: "Not Found",
	[HttpCode.INTERNAL_SERVER_ERROR]: "Internal Server Error",
};

export function ok(ctx: Context, body: unknown): void {
	ctx.response.body = body;
	ctx.status = HttpCode.OK;
}

export function created(ctx: Context, ID?: string): void {
	if (ID !== undefined) {
		ctx.body = { ID };
	}

	ctx.status = HttpCode.CREATED;
}

export function noContent(ctx: Context): void {
	ctx.status = HttpCode.NO_CONTENT;
}

export function badRequest(ctx: Context, message?: string): void {
	if (message !== undefined) {
		ctx.response.body = message;
	}

	ctx.status = HttpCode.BAD_REQUEST;
}

export function notFound(ctx: Context, message?: string): void {
	if (message !== undefined) {
		ctx.body = message;
	}

	ctx.status = HttpCode.NOT_FOUND;
}

export function internalServerError(ctx: Context): void {
	ctx.status = HttpCode.INTERNAL_SERVER_ERROR;
}
