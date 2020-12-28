import { validate } from "../types.validator";
import { getDb } from "../connection";

import { ObjectId } from "mongodb";
import {
	MalformedDataError,
	RecordNotFoundError,
	UniqueFieldError,
} from "./errors";

interface Record {
	ID: ObjectId;
}

type Type = "users" | "posts";
type ValidatorType = "UserRecord" | "PostRecord";

export default class Records<T, R extends Record> {
	protected type: Type;
	protected recordSchema: ValidatorType;
	protected pipeline: { [key: string]: any }[];
	protected filterFields: string[];

	constructor(type: Type, schema: ValidatorType) {
		this.type = type;
		this.recordSchema = schema;
		this.pipeline = [
			{
				$addFields: { ID: "$_id" },
			},
			{
				$unset: ["_id"],
			},
		];
		this.filterFields = ["_id"];
	}

	private validateRecord(record: unknown): record is R {
		// this.schema can't be passed in directly because each overload of the validate function
		// takes a defined string as a type. It's gross, but unavoidable with this package.
		switch (this.recordSchema) {
			case "PostRecord":
				validate("PostRecord")(record);
				break;
			case "UserRecord":
				validate("UserRecord")(record);
				break;
			default:
				throw new Error(
					`Cannot validate type ${this.recordSchema} because a validator has not been added for it`
				);
		}

		return true;
	}

	private validateRecords(records: unknown[]): records is R[] {
		for (const record of records) {
			if (!this.validateRecord(record)) {
				console.log(record);
				return false;
			}
		}

		return true;
	}

	async getRecord(ID: string): Promise<R> {
		const db = await getDb();
		const collection = db.collection(this.type);
		const user = await collection.findOne({ _id: new ObjectId(ID) });

		if (user === null) {
			throw new RecordNotFoundError();
		}

		user.ID = user._id;

		for (const field of this.filterFields) {
			delete user[field];
		}

		if (!this.validateRecord(user)) {
			throw new MalformedDataError();
		}

		return user;
	}

	async getAllRecords(): Promise<R[]> {
		const db = await getDb();
		const collection = db.collection(this.type);
		const records = await collection.aggregate(this.pipeline).toArray();

		if (!this.validateRecords(records)) {
			throw new MalformedDataError();
		}

		return records;
	}

	async createRecord(input: T): Promise<string> {
		const db = await getDb();
		const userCollection = db.collection(this.type);
		let response;

		try {
			response = await userCollection.insertOne(input);
		} catch (e) {
			const key = Object.keys(e.keyValue)[0];
			const value = e.keyValue[key];

			throw new UniqueFieldError(key, value);
		}

		const recordID: string = response.insertedId.toString();

		return recordID;
	}

	async deleteRecord({ ID }: R): Promise<void> {
		const db = await getDb();
		const userCollection = db.collection("users");
		await userCollection.deleteOne({ _id: new ObjectId(ID) });
	}

	filterProperty(...properties: string[]): void {
		this.filterFields.push(...properties);
		this.pipeline.push({
			$unset: [...properties],
		});
	}
}
