import { mongoClient } from "./mongo"
import { ObjectId } from "mongodb"

export const db = {
  /* ===================== 👤 EMPLOYEES ===================== */
  employees: {
    getAll: async () => {
      const database = await mongoClient()
      return database.collection("employees").find({}).toArray()
    },

    getById: async (id: string) => {
      const database = await mongoClient()
      return database
        .collection("employees")
        .findOne({ _id: new ObjectId(id) })
    },

    getByUsername: async (username: string) => {
      const database = await mongoClient()
      return database.collection("employees").findOne({ username })
    },

    create: async (employee: any) => {
      const database = await mongoClient()
      const payload = { ...employee, createdAt: new Date() }
      await database.collection("employees").insertOne(payload)
      return payload
    },

    update: async (id: string, data: any) => {
      const database = await mongoClient()
      await database
        .collection("employees")
        .updateOne({ _id: new ObjectId(id) }, { $set: data })

      return database
        .collection("employees")
        .findOne({ _id: new ObjectId(id) })
    },

    delete: async (id: string) => {
      const database = await mongoClient()
      const result = await database
        .collection("employees")
        .deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    },
  },

  /* ===================== 📋 TASKS ===================== */
  tasks: {
    getAll: async () => {
      const database = await mongoClient()
      const data = await database.collection("tasks").find({}).toArray()

      return data.map((t: any) => ({
        ...t,
        yourProjectEarning:
          typeof t.yourProjectEarning === "string"
            ? t.yourProjectEarning
            : "0",
      }))
    },

    getById: async (id: string) => {
      const database = await mongoClient()
      return database
        .collection("tasks")
        .findOne({ _id: new ObjectId(id) })
    },

    // ✅ REQUIRED FOR OPEN TASK FILTERING
    findMany: async (query: any) => {
      const database = await mongoClient()
      return database.collection("tasks").find(query).toArray()
    },

    create: async (task: any) => {
      const database = await mongoClient()
      const payload = {
        ...task,
        createdAt: new Date(),
      }
      await database.collection("tasks").insertOne(payload)
      return payload
    },

    update: async (id: string, data: any) => {
      const database = await mongoClient()
      await database
        .collection("tasks")
        .updateOne({ _id: new ObjectId(id) }, { $set: data })

      return database
        .collection("tasks")
        .findOne({ _id: new ObjectId(id) })
    },

    delete: async (id: string) => {
      const database = await mongoClient()
      const result = await database
        .collection("tasks")
        .deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    },

    // 🔥 ATOMIC TAKE TASK (CRITICAL)
    findOneAndUpdate: async (query: any, update: any) => {
      const database = await mongoClient()

      const result = await database
        .collection("tasks")
        .findOneAndUpdate(query, update, {
          returnDocument: "after",
        })

      // ✅ Handle MongoDB typings properly
      if (!result || !result.value) {
        return null
      }

      return result.value
    },

  },

  /* ===================== 🧾 INVOICES ===================== */
  invoices: {
    create: async (invoice: any) => {
      const database = await mongoClient()
      return database.collection("invoices").insertOne(invoice)
    },

    getByTask: async (taskId: string) => {
      const database = await mongoClient()
      return database.collection("invoices").findOne({ taskId })
    },

    getAll: async () => {
      const database = await mongoClient()
      return database.collection("invoices").find().toArray()
    },

    update: async (id: string, data: any) => {
      const database = await mongoClient()
      await database
        .collection("invoices")
        .updateOne({ _id: new ObjectId(id) }, { $set: data })
      return true
    },

    delete: async (id: string) => {
      const database = await mongoClient()
      const result = await database
        .collection("invoices")
        .deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    },
  },

  /* ===================== 📅 ATTENDANCE ===================== */
  attendance: {
    findOne: async (query: any) => {
      const database = await mongoClient()
      return database.collection("attendance").findOne(query)
    },

    findMany: async (query: any) => {
      const database = await mongoClient()
      return database.collection("attendance").find(query).toArray()
    },

    create: async (data: any) => {
      const database = await mongoClient()
      const payload = {
        ...data,
        createdAt: new Date(),
      }
      await database.collection("attendance").insertOne(payload)
      return payload
    },

    update: async (id: string, data: any) => {
      const database = await mongoClient()
      await database
        .collection("attendance")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: data }
        )

      return database
        .collection("attendance")
        .findOne({ _id: new ObjectId(id) })
    },
  },

  /* ===================== 🏖️ LEAVE REQUESTS ===================== */
  leaveRequests: {
    create: async (data: any) => {
      const database = await mongoClient()
      const payload = {
        ...data,
        status: "PENDING",
        createdAt: new Date(),
      }
      await database.collection("leave_requests").insertOne(payload)
      return payload
    },

    findByEmployee: async (employeeId: string) => {
      const database = await mongoClient()
      return database
        .collection("leave_requests")
        .find({ employeeId })
        .sort({ createdAt: -1 })
        .toArray()
    },
  },
}
