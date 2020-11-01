import type { Context } from "koa";
import { getUsers } from "../models/users";

export async function handleUsers(ctx: Context): Promise<void> {
	const users = await getUsers();

	ctx.body = users;
}
