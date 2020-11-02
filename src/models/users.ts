import { getDb } from "../db";
import type { User } from "../types";

const DUPLICATE_KEY_ERROR = 11000;

export async function getUsers(): Promise<User[]> {
	const db = await getDb();
	const userCollection = db.collection("users");
	const pipeline = [
		{
			$addFields: {
				ID: "$_id",
			},
		},
		{
			$unset: "_id",
		},
	];
	const users: User[] = await userCollection.aggregate(pipeline).toArray();

	return users;
}

export async function createUser(
	username: string,
	email: string
): Promise<string | null> {
	const db = await getDb();
	const userCollection = db.collection("users");
	const user = {
		username,
		email,
	};

	try {
		await userCollection.insertOne(user);
		return null;
	} catch (e) {
		if (e.code === DUPLICATE_KEY_ERROR) {
			return "email already exists";
		} else {
			throw e;
		}
	}
}
