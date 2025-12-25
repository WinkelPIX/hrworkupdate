import { mongoClient } from "./mongo";
import { ObjectId } from "mongodb";

export const db = {
  employees: {
    getAll: async () => {
      const database = await mongoClient();
      const data = await database.collection("employees").find({}).toArray();
      return Array.isArray(data) ? data : [];
    },

    getById: async (id: string) => {
      const database = await mongoClient();
      return database
        .collection("employees")
        .findOne({ _id: new ObjectId(id) });
    },

    create: async (employee: any) => {
      const database = await mongoClient();
      const payload = { ...employee, createdAt: new Date() };
      await database.collection("employees").insertOne(payload);
      return payload;
    },

    update: async (id: string, data: any) => {
      const database = await mongoClient();
      await database
        .collection("employees")
        .updateOne({ _id: new ObjectId(id) }, { $set: data });

      return database
        .collection("employees")
        .findOne({ _id: new ObjectId(id) });
    },

    delete: async (id: string) => {
      const database = await mongoClient();
      const result = await database
        .collection("employees")
        .deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    },
  },

  tasks: {
    getAll: async () => {
      const database = await mongoClient();
      const data = await database.collection("tasks").find({}).toArray();

      if (!Array.isArray(data)) return [];

      // ✅ FORCE correct earning value
      return data.map((t) => ({
        ...t,
        yourProjectEarning:
          typeof t.yourProjectEarning === "string"
            ? t.yourProjectEarning
            : "0", // ⬅️ IMPORTANT: no fallback to paymentAmount
      }));
    },


    getById: async (id: string) => {
      const database = await mongoClient();
      return database.collection("tasks").findOne({ _id: new ObjectId(id) });
    },

    create: async (task: any) => {
      const database = await mongoClient();
      const payload = { ...task, createdAt: new Date() };
      await database.collection("tasks").insertOne(payload);
      return payload;
    },

    update: async (id: string, data: any) => {
      const database = await mongoClient();
      await database.collection("tasks").updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      return database.collection("tasks").findOne({ _id: new ObjectId(id) });
    },

    delete: async (id: string) => {
      const database = await mongoClient();
      const result = await database.collection("tasks").deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    },
  },
  invoices: {
    create: async (invoice: any) => {
      const database = await mongoClient();
      return database.collection("invoices").insertOne(invoice);
    },

    getByTask: async (taskId: string) => {
      const database = await mongoClient();
      return database.collection("invoices").findOne({ taskId });
    },

    getAll: async () => {
      const database = await mongoClient();
      return database.collection("invoices").find().toArray();
    },
    delete: async (id: string) => {
      const database = await mongoClient();
      const result = await database
        .collection("invoices")
        .deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    },
    update: async (id: string, data: any) => {
      const database = await mongoClient();
      const result = await database
        .collection("invoices")
        .updateOne({ _id: new ObjectId(id) }, { $set: data });
      return result.modifiedCount > 0;
    },
  }

};
