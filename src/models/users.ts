import { getDb } from "../db";
import type { User } from "../types";

export async function getUsers(): Promise<User[]> {
	const db = await getDb();
	const userCollection = db.collection("users");
	const users: User[] = await userCollection.find({}).toArray();

	return users;
}

export async function createUser(
	moniker: string,
	email: string
): Promise<void> {
	const db = await getDb();
	const userCollection = db.collection("users");
	const user = {
		moniker,
		email,
	};

	userCollection.insertOne(user);
}
