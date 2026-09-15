import api from "./api";

import type {
  StaffCredential,
  StaffCredentialDetail,
  StaffCredentialListResponse,
  StaffPasswordUpdatePayload,
  StaffRoleUpdatePayload,
  StaffStatusUpdatePayload,
} from "@/components/staff-credentials/types";

class CredentialService {
  /**
   * Get all staff credentials.
   *
   * Passwords are intentionally not returned by the list endpoint.
   * The password is retrieved individually when the Super Admin
   * requests to reveal it.
   */
  async getStaffCredentials(search?: string) {
    return api.get<StaffCredentialListResponse>("/users/credentials", {
      params: search?.trim()
        ? {
            search: search.trim(),
          }
        : undefined,
    });
  }

  /**
   * Get one staff member including the decrypted password.
   */
  async getStaffCredential(userId: string) {
    return api.get<StaffCredentialDetail>(`/users/credentials/${userId}`);
  }

  /**
   * Change a staff member's password.
   */
  async changePassword(userId: string, data: StaffPasswordUpdatePayload) {
    return api.patch<StaffCredentialDetail>(
      `/users/credentials/${userId}/password`,
      data,
    );
  }

  /**
   * Change staff role.
   */
  async changeRole(userId: string, data: StaffRoleUpdatePayload) {
    return api.patch<StaffCredential>(
      `/users/credentials/${userId}/role`,
      data,
    );
  }

  /**
   * Activate or deactivate staff account.
   */
  async changeStatus(userId: string, data: StaffStatusUpdatePayload) {
    return api.patch<StaffCredential>(
      `/users/credentials/${userId}/status`,
      data,
    );
  }

  /**
   * Delete staff account.
   */
  async deleteStaff(userId: string) {
    return api.delete(`/users/credentials/${userId}`);
  }
}

const credentialService = new CredentialService();

export default credentialService;
