export const SOCKET_EVENTS = {
  // Task events
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_STATUS_CHANGED: "task:status_changed",

  // Real-time updates
  TASKS_LIST_UPDATED: "tasks:list_updated",
  ANALYTICS_UPDATED: "analytics:updated",
  EMPLOYEE_ACTIVITY: "employee:activity",

  // Notifications
  NOTIFICATION: "notification:send",
}

export interface TaskUpdateEvent {
  taskId: string
  changes: Record<string, any>
  updatedBy: string
  timestamp: string
}

export interface NotificationEvent {
  type: "success" | "warning" | "error" | "info"
  message: string
  taskId?: string
}
