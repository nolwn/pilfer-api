import { getDb } from "../connection";
import UserRecords from "../Records/UserRecords";
import type { User, UserRecord, UserInput } from "../types";

const DUPLICATE_KEY_ERROR = 11000;

interface MongoUser extends User {
	_id: string;
}

const userRecords = new UserRecords();

export async function getUsers(): Promise<UserRecord[]> {
	const users = userRecords.getAllRecords();

	return users;
}

export async function getUser(ID: string): Promise<UserRecord> {
	const user = await userRecords.getRecord(ID);

	return user;
}

export async function createUser(input: UserInput): Promise<string | null> {
	const db = await getDb();
	const userCollection = db.collection("users");

	try {
		const item = await userCollection.insertOne(input);
		console.log(item);
		return null;
	} catch (e) {
		if (e.code === DUPLICATE_KEY_ERROR) {
			return "email already exists";
		} else {
			throw e;
		}
	}
}
