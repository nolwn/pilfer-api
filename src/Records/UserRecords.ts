import Joi from "joi";
import Records from "./Records";
import type { User, UserRecord } from "../types";

interface MongoUser extends User {
	_id: string;
}

const userSchema = Joi.object<UserRecord>({
	ID: Joi.string().required(),
	email: Joi.string().required(),
	username: Joi.string().required(),
});

export default class UserRecords extends Records<User, UserRecord, MongoUser> {
	constructor() {
		super("users", userSchema);
		this.pipeline.push({
			$unset: ["_id", "password"],
		});
	}
}
