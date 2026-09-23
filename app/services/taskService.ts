import api from "./api";

import {
  Task,
  TaskAssignmentPayload,
  TaskComment,
  TaskCommentCreatePayload,
  TaskCreatePayload,
  TaskListResponse,
  TaskReviewPayload,
  TaskStatusUpdatePayload,
  TaskUpdatePayload,
} from "@/components/tasks/types";

class TaskService {
  async getTasks(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    priority?: string,
    orderType?: string,
  ) {
    return api.get<TaskListResponse>("/tasks", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(orderType ? { order_type: orderType } : {}),
      },
    });
  }

  async getTask(taskId: string) {
    return api.get<Task>(`/tasks/${taskId}`);
  }

  async createTask(data: TaskCreatePayload) {
    return api.post<Task>("/tasks", data);
  }

  async updateTask(taskId: string, data: TaskUpdatePayload) {
    return api.patch<Task>(`/tasks/${taskId}`, data);
  }

  async deleteTask(taskId: string) {
    return api.delete(`/tasks/${taskId}`);
  }

  async getFolderTasks(
    folderId: string,
    page = 1,
    limit = 20,
    search?: string,
  ) {
    return api.get<TaskListResponse>(`/tasks/folder/${folderId}`, {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    });
  }

  async getMyTasks(page = 1, limit = 20, search?: string) {
    return api.get<TaskListResponse>("/tasks/my", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    });
  }

  async assignTask(taskId: string, data: TaskAssignmentPayload) {
    return api.patch<Task>(`/tasks/${taskId}/assign`, data);
  }

  async updateTaskStatus(taskId: string, data: TaskStatusUpdatePayload) {
    return api.patch<Task>(`/tasks/${taskId}/status`, data);
  }

  async reviewTask(taskId: string, data: TaskReviewPayload) {
    return api.post<Task>(`/tasks/${taskId}/review`, data);
  }

  async getComments(taskId: string) {
    return api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
  }

  async addComment(taskId: string, data: TaskCommentCreatePayload) {
    return api.post<TaskComment>(`/tasks/${taskId}/comments`, data);
  }

  async addCommentWithAttachment(
    taskId: string,
    message: string | null,
    file: File | null,
  ) {
    const formData = new FormData();

    if (message?.trim()) {
      formData.append("message", message.trim());
    }

    if (file) {
      formData.append("file", file);
    }

    return api.post<TaskComment>(
      `/tasks/${taskId}/comments/with-attachment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  }

  async deleteAttachment(commentId: string) {
    return api.delete(`/tasks/attachments/${commentId}`);
  }
}

const taskService = new TaskService();

export default taskService;
