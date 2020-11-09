import type { Context } from "koa";

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

export function ok(ctx: Context, body: unknown) {
	ctx.response.body = body;
	ctx.status = OK;
}

export function created(ctx: Context, ID?: string) {
	if (ID !== undefined) {
		ctx.body = { ID };
	}

	ctx.status = CREATED;
}

export function noContent(ctx: Context) {
	ctx.status = NO_CONTENT;
}

export function badRequest(ctx: Context, message?: string) {
	if (message !== undefined) {
		ctx.response.body = message;
	}

	ctx.status = BAD_REQUEST;
}

export function notFound(ctx: Context, message?: string) {
	if (message !== undefined) {
		ctx.body = message;
	}

	ctx.status = NOT_FOUND;
}

export function internalServerError(ctx: Context) {
	ctx.status = INTERNAL_SERVER_ERROR;
}
