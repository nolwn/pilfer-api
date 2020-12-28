import { Context, Next } from "koa";
import Router, { RouterContext } from "@koa/router";
import dotEnv from "dotenv";
import jwt from "jsonwebtoken";
import type { User, UserRecord } from "../types";
import { validate } from "../types.validator";
import * as response from "../response";
import Records from "../models/Records";

dotEnv.config();

const secret = process.env.TOKEN_SECRET;

const router = new Router({ prefix: "/api/token" });
router.post("/", getToken);

const userRecords = new Records<User, UserRecord>("users", "UserRecord");

async function getToken(ctx: RouterContext) {
	const basicAuth = ctx.request.get("Authorization");
	const [type, creds64] = basicAuth.split(" ");

	if (!secret) {
		response.internalServerError(ctx);

		return;
	}

	if (type !== "Basic") {
		response.forbidden(ctx);

		return;
	}

	const creds = Buffer.from(creds64, "base64").toString();
	const [email, password] = creds.split(":");

	if (!email || !password) {
		response.forbidden(ctx);
	}

	const user: UserRecord = await userRecords.findByProperty("email", email);

	if (user.password !== password) {
		response.forbidden(ctx);

		return;
	}

	delete user.password;

	const token = jwt.sign(
		{
			data: user,
		},
		secret
	);

	response.ok(ctx, { token });
}

export async function checkToken(ctx: Context, next: Next): Promise<void> {
	const bearerToken = ctx.request.get("Authorization");
	const [type, token64] = bearerToken.split(" ");
	let token;

	if (!secret) {
		response.internalServerError(ctx);

		return;
	}

	if (type !== "Bearer") {
		response.forbidden(ctx);

		return;
	}

	try {
		token = jwt.verify(token64, secret);
	} catch (e) {
		response.forbidden(ctx);

		return;
	}

	let parsedToken;

	if (typeof token === "string") {
		parsedToken = JSON.parse(token).data;
	} else {
		parsedToken = token;
	}

	const { data } = parsedToken;
	const user = validate("User")(data);

	ctx.state.user = user;

	await next();
}

export default router;
