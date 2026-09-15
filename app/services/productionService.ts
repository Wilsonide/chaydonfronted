import api from "./api";
import {
  ProductionCreatePayload,
  ProductionFile,
  ProductionFolder,
  ProductionListResponse,
  ProductionUpdatePayload,
} from "@/components/production/types";

class ProductionService {
  async getProductionFolders(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
  ) {
    return api.get<ProductionListResponse>("/production", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      },
    });
  }

  async getProductionFolder(folderId: string) {
    return api.get<ProductionFolder>(`/production/${folderId}`);
  }

  async createProductionFolder(data: ProductionCreatePayload) {
    return api.post<ProductionFolder>("/production", data);
  }

  async updateProductionFolder(
    folderId: string,
    data: ProductionUpdatePayload,
  ) {
    return api.patch<ProductionFolder>(`/production/${folderId}`, data);
  }

  async uploadProductionFile(folderId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ProductionFile>(`/production/${folderId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deleteProductionFile(fileId: string) {
    return api.delete(`/production/files/${fileId}`);
  }

  // NEW: Download backend-generated PDF
  async downloadProductionFile(fileId: string, fileName: string) {
    const response = await api.get(`/production/files/${fileId}/download`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.replace(/\.[^.]+$/, "") + ".pdf";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

const productionService = new ProductionService();
export default productionService;
