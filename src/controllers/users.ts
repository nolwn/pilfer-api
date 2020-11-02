import type { Context } from "koa";
import { getUsers, createUser } from "../models/users";

export async function handleCreateUser(ctx: Context): Promise<void> {
	const { username, email } = ctx.request.body;
	try {
		const validation = await createUser(username, email);
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

export async function handleGetUsers(ctx: Context): Promise<void> {
	const users = await getUsers();

	ctx.body = users;
}
