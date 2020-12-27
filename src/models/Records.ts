import { getDb } from "../connection";
import Joi from "joi";

import { FindOneOptions, ObjectId } from "mongodb";
import { MalformedDataError, UniqueFieldError } from "./errors";

interface Record {
	ID: string;
}

interface MongoSchema {
	_id: string;
}

export type Type = "users" | "posts";

export default class Records<T, R extends Record, M extends MongoSchema> {
	protected type: Type;
	protected schema: Joi.ObjectSchema;
	protected pipeline: { [key: string]: any }[];
	protected findOneOptions: FindOneOptions<M>;

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
		this.findOneOptions = { projection: { _id: 0, ID: "$_id" } };
	}

	private validateRecord(record: unknown): record is R {
		const { errors } = this.schema.validate(record);

		if (errors) {
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
		const user = await collection.findOne(
			{ _id: new ObjectId(ID) },
			{
				projection: { ID: "$_id" },
			}
		);
		const record = { ID, ...user };

		if (!this.validateRecord(record)) {
			throw new MalformedDataError();
		}

		return record;
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
		this.pipeline.push({
			$unset: [...properties],
		});
	}
}
