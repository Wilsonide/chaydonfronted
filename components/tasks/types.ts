export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVISION_REQUIRED"
  | "APPROVED";

export type ProductionStatus =
  | "CREATED"
  | "WAITING_FOR_REQUIREMENTS"
  | "READY_FOR_DESIGN"
  | "IN_DESIGN"
  | "DESIGN_REVIEW"
  | "APPROVED_FOR_PRINT"
  | "PRINTING"
  | "COMPLETED"
  | "CANCELLED";

/* =========================================================
   ASSIGNEE
   ========================================================= */

export interface TaskAssignee {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

/* =========================================================
   PRODUCTION FOLDER
   ========================================================= */

export interface TaskProductionFolder {
  id: string;
  production_number: number;
  folder_number: string;
  title: string;
  requirements: string | null;
  status: ProductionStatus;
  created_at: string;
}

/* =========================================================
   TASK
   ========================================================= */

export interface Task {
  id: string;
  production_folder_id: string;
  assigned_by: string;
  assigned_to: string | null;

  /**
   * Enriched backend relationships
   */
  production_folder: TaskProductionFolder;
  assignee: TaskAssignee | null;

  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;

  /**
   * Designer charge recorded when the
   * Graphic Lead approves the task.
   *
   * Backend Decimal values are serialized
   * as strings.
   */
  designer_charge: string;

  created_at: string;
}

/* =========================================================
   TASK LIST
   ========================================================= */

export interface TaskListMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskListResponse {
  data: Task[];
  meta: TaskListMeta;
}

/* =========================================================
   CREATE TASK
   ========================================================= */

export interface TaskCreatePayload {
  production_folder_id: string;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  deadline?: string;
}

/* =========================================================
   UPDATE TASK
   ========================================================= */

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  deadline?: string;
}

/* =========================================================
   TASK STATUS
   ========================================================= */

export interface TaskStatusUpdatePayload {
  status: TaskStatus;
}

/* =========================================================
   TASK ASSIGNMENT
   ========================================================= */

export interface TaskAssignmentPayload {
  assigned_to: string;
}

/* =========================================================
   TASK REVIEW
   ========================================================= */

export interface TaskReviewPayload {
  approve: boolean;
  message?: string | null;

  /**
   * Required when approving a task.
   *
   * Use a string so decimal values such as
   * "1500.00" are sent without JavaScript
   * floating-point issues.
   */
  designer_charge: string;
}

/* =========================================================
   COMMENTS
   ========================================================= */

export interface TaskCommentUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
}

export interface TaskComment {
  id: string;
  user_id: string;
  user: TaskCommentUser;
  message: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  is_revision_request: boolean;
  is_approval: boolean;
  created_at: string;
}

export interface TaskCommentCreatePayload {
  message?: string | null;
}
