import { MongoClient, Db } from "mongodb";

let connection: void | MongoClient;

export async function getDb(): Promise<Db> {
	const user = process.env.DB_USER;
	const password = process.env.DB_PASSWORD;
	const host = process.env.DB_HOST;
	const port = process.env.DB_PORT;
	const database = process.env.DB_NAME;

	if (connection === undefined) {
		connection = await MongoClient.connect(
			`mongodb://${user}:${password}@${host}:${port}/${database}`,
			{ useNewUrlParser: true, useUnifiedTopology: true }
		);
	}

	if (isMongoClient(connection)) {
		return connection.db(database);
	} else {
		throw new Error("Failed for form connection");
	}
}

function isMongoClient(
	connection: MongoClient | void
): connection is MongoClient {
	return !!connection;
}
