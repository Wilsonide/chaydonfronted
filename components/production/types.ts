import { TaskStatus, TaskPriority } from "../tasks/types";

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

export interface ProductionFile {
  id: string;
  file_name: string;
  file_url: string;
  public_id: string | null;
  file_type: string | null;
  resource_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface ProductionActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  created_at: string;
}

export interface ProductionTask {
  id: string;
  title: string;
  assigned_to: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
}

export interface ProductionFolder {
  id: string;
  order_id: string;
  folder_number: string;
  title: string;
  requirements: string | null;
  status: ProductionStatus;
  created_at: string;
  updated_at: string;
  files: ProductionFile[];
  activities: ProductionActivity[];
  tasks: ProductionTask[];
}

export interface ProductionCreatePayload {
  order_id: string;
  title: string;
  requirements?: string;
}

export interface ProductionUpdatePayload {
  title?: string;
  requirements?: string;
  status?: ProductionStatus;
}

export interface ProductionListResponse {
  data: ProductionFolder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
  };
}
