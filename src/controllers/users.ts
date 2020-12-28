import { validate } from "../types.validator";
import Router, { RouterContext } from "@koa/router";
import type { User, UserRecord, UserInput } from "../types";
import * as response from "../response";
import Records from "../models/Records";

const router = new Router({ prefix: "/api/users" });
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:userID", getUser);
router.delete("/:userID", removeUser);

const userRecords = new Records<User, UserRecord>("users", "UserRecord");
userRecords.filterProperty("password");

async function createUser(ctx: RouterContext): Promise<void> {
	const input = ctx.request.body;
	let userInput: UserInput;

	try {
		userInput = validate("UserInput")(input);
	} catch (e) {
		response.badRequest(ctx, e.message);

		return;
	}

	const ID = await userRecords.createRecord(userInput);

	response.created(ctx, ID);
}

async function getUser(ctx: RouterContext): Promise<void> {
	const userID = ctx.params.userID;
	const user = await userRecords.getRecord(userID);

	response.ok(ctx, user);
}

async function getUsers(ctx: RouterContext): Promise<void> {
	const users = await userRecords.getAllRecords();

	response.ok(ctx, users);
}

async function removeUser(ctx: RouterContext): Promise<void> {
	const userID = ctx.params.userID;
	const user = await userRecords.getRecord(userID);

	await userRecords.deleteRecord(user);

	response.noContent(ctx);
}

export default router;
