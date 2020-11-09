import Joi from "joi";
import Router from "@koa/router";
import type { Context } from "koa";
import type { UserInput } from "../types";
import { getUsers, createUser } from "../models/users";
import * as response from "../response";

const router = new Router({ prefix: "/api/users" });
const userInputSchema = Joi.object<UserInput, UserInput>({
	email: Joi.string(),
	password: Joi.string(),
	username: Joi.string(),
});

router.post(
	"create user",
	"/",
	async (ctx: Context): Promise<void> => {
		const input = ctx.request.body;
		const { error } = userInputSchema.validate(input);

		if (error) {
			response.badRequest(ctx, error.message);
			return;
		}

		try {
			const error = await createUser(input);
			if (error) {
				response.badRequest(ctx, error);
			} else {
				response.created(ctx);
				ctx.status = 201;
			}
		} catch (e) {
			ctx.status = 500;
		}
	}
);

router.get(
	"get users",
	"/",
	async (ctx: Context): Promise<void> => {
		const users = await getUsers();

		response.ok(ctx, users);
	}
);

export default router;
