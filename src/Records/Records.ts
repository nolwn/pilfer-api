import { getDb } from "../connection";
import Joi from "joi";

import { Db, FindOneOptions, ObjectId } from "mongodb";
import type { Post, PostRecord, User, UserRecord } from "../types";

const userSchema = Joi.object<UserRecord>({
	ID: Joi.string().required(),
	email: Joi.string().required(),
	username: Joi.string().required(),
});

const postSchema = Joi.object<PostRecord>({
	ID: Joi.string().required(),
	author: Joi.string().required(),
	link: Joi.string(),
	postDate: Joi.string().required(),
	score: Joi.number().required(),
	text: Joi.string(),
});

const schemaMap: { [K in Type]: Joi.ObjectSchema } = {
	users: userSchema,
	posts: postSchema,
};

interface Record {
	ID: string;
}

interface MongoSchema {
	_id: string;
}

export type Type = "users" | "posts";

export default class Records<T, R extends Record, M extends MongoSchema> {
	type: Type;
	schema: Joi.ObjectSchema;
	pipeline: object[];
	findOneOptions: FindOneOptions<M>;

	constructor(resource: Type) {
		this.type = resource;
		this.schema = schemaMap[resource];
		this.pipeline = [
			{
				$addFields: { ID: "$_id" },
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

	// private fixID(record)

	// async createResource(input: T): Promise<R> {
	// 	const db = await this.connection;
	// 	const userCollection = db.collection(this.resource);
	// 	const item = await userCollection.insertOne(input);
	// }

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
			throw new Error("malformed data");
		}

		return record;
	}

	async getAllRecords(): Promise<R[]> {
		const db = await getDb();
		const collection = db.collection(this.type);
		const records = await collection.aggregate(this.pipeline).toArray();

		if (!this.validateRecords(records)) {
			throw new Error("malformed data");
		}

		return records;
	}
}
