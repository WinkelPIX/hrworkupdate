import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "ems_db";

export async function mongoClient() {
  if (db) return db;

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);

  console.log("[MongoDB] Connected");
  return db;
}

export function getDB() {
  if (!db) throw new Error("MongoDB not connected. Call mongoClient() first.");
  return db;
}
