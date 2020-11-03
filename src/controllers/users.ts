import Joi from "joi";
import Router from "@koa/router";
import type { Context } from "koa";
import type { ObjectSchema } from "joi";
import type { User, UserInput } from "../types";
import { getUsers, createUser } from "../models/users";

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
		const value = userInputSchema.validate(input).value;

		if (error) {
			ctx.status = 400;
			ctx.body = {
				error: error,
			};
			return;
		}

		try {
			const validation = await createUser(value);
			if (validation) {
				ctx.status = 400;
				ctx.body = {
					error: validation,
				};
			} else {
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

		ctx.body = users;
	}
);

export default router;
