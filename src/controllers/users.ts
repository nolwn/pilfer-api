import Joi from "joi";
import Router, { RouterContext } from "@koa/router";
import type { User, UserRecord, UserInput } from "../types";
import * as response from "../response";
import Records from "../models/Records";

interface MongoUser extends User {
	_id: string;
}

const userInputSchema = Joi.object<UserInput, UserInput>({
	email: Joi.string().required(),
	password: Joi.string().required(),
	username: Joi.string().required(),
});

const userSchema = Joi.object<UserRecord>({
	ID: Joi.string().required(),
	email: Joi.string().required(),
	username: Joi.string().required(),
});

const router = new Router({ prefix: "/api/users" });
router.post("/", createUser);
router.get("/", getUsers);
router.delete("/:userID", removeUser);

const userRecords = new Records<User, UserRecord, MongoUser>("users", userSchema);
userRecords.filterProperty("password");

async function createUser(ctx: RouterContext): Promise<void> {
	const input = ctx.request.body;
	const { error } = userInputSchema.validate(input);

	if (error) {
		response.badRequest(ctx, error.message);
		return;
	}

	const { ID } = await userRecords.createRecord(input);

	response.created(ctx, ID);
	ctx.status = 201;
}

async function getUsers(ctx: RouterContext): Promise<void> {
	userRecords.filterProperty("password");

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
