// Database setup script for MongoDB integration
// Run this after setting up MongoDB connection

const dbSetup = `
// MongoDB Collections Schema

// tasks collection
db.createCollection("tasks");
db.tasks.createIndex({ "employeeId": 1 });
db.tasks.createIndex({ "taskStatus": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "workGivenDate": 1, "dueDate": 1 });

// employees collection
db.createCollection("employees");
db.employees.createIndex({ "email": 1 }, { unique: true });
db.employees.createIndex({ "username": 1 }, { unique: true });

// analytics collection
db.createCollection("analytics");
db.analytics.createIndex({ "employeeId": 1, "month": 1 });
db.analytics.createIndex({ "createdAt": -1 });

// approvals collection
db.createCollection("approvals");
db.approvals.createIndex({ "taskId": 1 });
db.approvals.createIndex({ "status": 1 });
db.approvals.createIndex({ "createdAt": -1 });

// Create default indexes for common queries
db.tasks.createIndex({ "clientName": "text", "projectName": "text" });
`

console.log("[v0] MongoDB setup script prepared")
console.log(dbSetup)
