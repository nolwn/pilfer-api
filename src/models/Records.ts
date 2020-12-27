import { getDb } from "../connection";
import Joi from "joi";

import { ObjectId } from "mongodb";
import { MalformedDataError, UniqueFieldError } from "./errors";

interface Record {
	ID: string;
}

export type Type = "users" | "posts";

export default class Records<T, R extends Record> {
	protected type: Type;
	protected schema: Joi.ObjectSchema;
	protected pipeline: { [key: string]: any }[];
	protected filterFields: string[];

	constructor(type: Type, schema: Joi.ObjectSchema) {
		this.type = type;
		this.schema = schema;
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
		const { error } = this.schema.validate(record);

		console.log(error);

		if (error) {
			return false;
		}

		return true;
	}

	private validateRecords(records: unknown[]): records is R[] {
		for (const record of records) {
			if (!this.validateRecord(record)) {
				return false;
			}
		}

		return true;
	}

	async getRecord(ID: string): Promise<R> {
		const db = await getDb();
		const collection = db.collection(this.type);
		const user = await collection.findOne({ _id: new ObjectId(ID) });
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

	async createRecord(input: T): Promise<R> {
		const db = await getDb();
		const userCollection = db.collection("users");
		let response;

		try {
			response = await userCollection.insertOne(input);
		} catch (e) {
			const key = Object.keys(e.keyValue)[0];
			const value = e.keyValue[key];

			throw new UniqueFieldError(key, value);
		}

		const recordID: string = response.insertedId;
		const record = { ID: recordID, ...input };

		if (!this.validateRecord(record)) {
			throw new MalformedDataError();
		}

		return record;
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
