"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import credentialService from "@/app/services/credential.service";

import {
  getRoleLabel,
  STAFF_ROLES,
  type StaffCredential,
  type StaffCredentialDetail,
  type UserRole,
} from "@/components/staff-credentials/types";

export default function StaffCredentialsPage() {
  const [staff, setStaff] = useState<StaffCredential[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [revealedPasswords, setRevealedPasswords] = useState<
    Record<string, string>
  >({});

  const [loadingPasswords, setLoadingPasswords] = useState<
    Record<string, boolean>
  >({});

  const [passwordErrors, setPasswordErrors] = useState<Record<string, boolean>>(
    {},
  );

  const [selectedStaff, setSelectedStaff] = useState<StaffCredential | null>(
    null,
  );

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedRole, setSelectedRole] = useState<UserRole>("FRONT_DESK");

  const [savingPassword, setSavingPassword] = useState(false);

  const [savingRole, setSavingRole] = useState(false);

  const [changingStatus, setChangingStatus] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const loadStaff = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await credentialService.getStaffCredentials(search);

        setStaff(response.data);
      } catch (error) {
        console.error("Failed to load staff credentials:", error);

        toast.error("Failed to load staff credentials.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaff();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadStaff]);

  const totalStaff = staff.length;

  const activeStaff = useMemo(
    () => staff.filter((member) => member.is_active).length,
    [staff],
  );

  const inactiveStaff = totalStaff - activeStaff;

  const handleRevealPassword = async (member: StaffCredential) => {
    const existingPassword = revealedPasswords[member.id];

    if (existingPassword !== undefined) {
      setRevealedPasswords((current) => {
        const next = { ...current };

        delete next[member.id];

        return next;
      });

      return;
    }

    setLoadingPasswords((current) => ({
      ...current,
      [member.id]: true,
    }));

    setPasswordErrors((current) => ({
      ...current,
      [member.id]: false,
    }));

    try {
      const response = await credentialService.getStaffCredential(member.id);

      setRevealedPasswords((current) => ({
        ...current,
        [member.id]: response.data.password,
      }));
    } catch (error) {
      console.error("Failed to retrieve password:", error);

      setPasswordErrors((current) => ({
        ...current,
        [member.id]: true,
      }));

      toast.error("Unable to retrieve this password.");
    } finally {
      setLoadingPasswords((current) => ({
        ...current,
        [member.id]: false,
      }));
    }
  };

  const openPasswordDialog = (member: StaffCredential) => {
    setSelectedStaff(member);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!selectedStaff) {
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      toast.error("Password cannot exceed 72 bytes.");
      return;
    }

    setSavingPassword(true);

    try {
      const response = await credentialService.changePassword(
        selectedStaff.id,
        {
          password: newPassword,
        },
      );

      setRevealedPasswords((current) => ({
        ...current,
        [selectedStaff.id]: response.data.password,
      }));

      setPasswordErrors((current) => ({
        ...current,
        [selectedStaff.id]: false,
      }));

      setPasswordDialogOpen(false);

      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error("Failed to change password:", error);

      toast.error("Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const openRoleDialog = (member: StaffCredential) => {
    setSelectedStaff(member);
    setSelectedRole(member.role);
    setRoleDialogOpen(true);
  };

  const handleChangeRole = async () => {
    if (!selectedStaff) {
      return;
    }

    if (selectedRole === selectedStaff.role) {
      setRoleDialogOpen(false);
      return;
    }

    setSavingRole(true);

    try {
      const response = await credentialService.changeRole(selectedStaff.id, {
        role: selectedRole,
      });

      setStaff((current) =>
        current.map((member) =>
          member.id === selectedStaff.id
            ? {
                ...member,
                role: response.data.role,
              }
            : member,
        ),
      );

      setRoleDialogOpen(false);

      toast.success("Staff role updated successfully.");
    } catch (error) {
      console.error("Failed to change role:", error);

      toast.error("Failed to change staff role.");
    } finally {
      setSavingRole(false);
    }
  };

  const openStatusDialog = (member: StaffCredential) => {
    setSelectedStaff(member);
    setStatusDialogOpen(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedStaff) {
      return;
    }

    const nextStatus = !selectedStaff.is_active;

    setChangingStatus(true);

    try {
      const response = await credentialService.changeStatus(selectedStaff.id, {
        is_active: nextStatus,
      });

      setStaff((current) =>
        current.map((member) =>
          member.id === selectedStaff.id
            ? {
                ...member,
                is_active: response.data.is_active,
              }
            : member,
        ),
      );

      setStatusDialogOpen(false);

      toast.success(
        nextStatus ? "Staff account activated." : "Staff account deactivated.",
      );
    } catch (error) {
      console.error("Failed to change staff status:", error);

      toast.error("Failed to update account status.");
    } finally {
      setChangingStatus(false);
    }
  };

  const openDeleteDialog = (member: StaffCredential) => {
    setSelectedStaff(member);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStaff) {
      return;
    }

    setDeleting(true);

    try {
      await credentialService.deleteStaff(selectedStaff.id);

      setStaff((current) =>
        current.filter((member) => member.id !== selectedStaff.id),
      );

      setRevealedPasswords((current) => {
        const next = { ...current };

        delete next[selectedStaff.id];

        return next;
      });

      setDeleteDialogOpen(false);

      toast.success("Staff account deleted successfully.");
    } catch (error) {
      console.error("Failed to delete staff:", error);

      toast.error(
        "Unable to delete this staff account. " +
          "Try deactivating it instead.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <Shield className="h-4 w-4" />
              Super Admin
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Staff Credentials
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Manage staff accounts, roles, passwords, and account access.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => loadStaff(true)}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Staff
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalStaff}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active</p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {activeStaff}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Inactive</p>

                <p className="mt-1 text-2xl font-bold text-slate-600">
                  {inactiveStaff}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
                <PowerOff className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Staff Accounts</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Only Super Admins can access and manage these credentials.
                </p>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, username or email..."
                  className="h-10 pl-9 pr-9"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

                <p className="text-sm text-slate-500">
                  Loading staff credentials...
                </p>
              </div>
            </div>
          ) : staff.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <Users className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-900">No staff found</h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "No staff accounts match your search."
                  : "There are currently no staff accounts to display."}
              </p>

              {search && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearSearch}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Staff
                    </th>

                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Username
                    </th>

                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Email
                    </th>

                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Role
                    </th>

                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Password
                    </th>

                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {staff.map((member) => {
                    const revealed = revealedPasswords[member.id];

                    const passwordLoading = loadingPasswords[member.id];

                    const passwordError = passwordErrors[member.id];

                    return (
                      <tr
                        key={member.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Staff */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                              {member.first_name.charAt(0).toUpperCase()}
                              {member.last_name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {member.first_name} {member.last_name}
                              </p>

                              <p className="text-xs text-slate-500">
                                Staff account
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-5 py-4">
                          <span className="font-medium text-slate-700">
                            {member.username}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4">
                          <span className="text-slate-600">{member.email}</span>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {getRoleLabel(member.role)}
                          </span>
                        </td>

                        {/* Password */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <code className="min-w-[120px] rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-700">
                              {passwordError
                                ? "Unavailable"
                                : (revealed ?? "••••••••••••")}
                            </code>

                            <button
                              type="button"
                              onClick={() => handleRevealPassword(member)}
                              disabled={passwordLoading || passwordError}
                              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                              title={
                                revealed ? "Hide password" : "Show password"
                              }
                            >
                              {passwordLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : revealed ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {member.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem
                                onClick={() => openPasswordDialog(member)}
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Change Password
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openRoleDialog(member)}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => openStatusDialog(member)}
                              >
                                {member.is_active ? (
                                  <>
                                    <PowerOff className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Power className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => openDeleteDialog(member)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Staff
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* CHANGE PASSWORD DIALOG */}
      {/* ===================================================== */}

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>

            <DialogDescription>
              Set a new password for{" "}
              <strong>
                {selectedStaff?.first_name} {selectedStaff?.last_name}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                New Password
              </label>

              <Input
                type="text"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <p className="text-xs text-slate-500">
                Maximum 72 bytes because the system uses bcrypt authentication.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>

              <Input
                type="text"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match.</p>
              )}
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              disabled={savingPassword}
            >
              Cancel
            </Button>

            <Button
              onClick={handleChangePassword}
              disabled={
                savingPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
            >
              {savingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================== */}
      {/* CHANGE ROLE DIALOG */}
      {/* ===================================================== */}

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Change Staff Role</DialogTitle>

            <DialogDescription>
              Choose the role for{" "}
              <strong>
                {selectedStaff?.first_name} {selectedStaff?.last_name}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={savingRole}
            >
              Cancel
            </Button>

            <Button onClick={handleChangeRole} disabled={savingRole}>
              {savingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Save Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================== */}
      {/* STATUS DIALOG */}
      {/* ===================================================== */}

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff?.is_active ? "Deactivate Staff" : "Activate Staff"}
            </DialogTitle>

            <DialogDescription>
              {selectedStaff?.is_active
                ? `This will prevent ${selectedStaff?.first_name} ${selectedStaff?.last_name} from accessing the system.`
                : `This will restore ${selectedStaff?.first_name} ${selectedStaff?.last_name}'s access to the system.`}
            </DialogDescription>
          </DialogHeader>

          <div
            className={`rounded-lg border p-4 ${
              selectedStaff?.is_active
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div className="flex gap-3">
              {selectedStaff?.is_active ? (
                <PowerOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              ) : (
                <Power className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              )}

              <p className="text-sm text-slate-700">
                {selectedStaff?.is_active
                  ? "The account will remain in the system and can be activated again later."
                  : "The staff member will be able to log in again after activation."}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={changingStatus}
            >
              Cancel
            </Button>

            <Button
              variant={selectedStaff?.is_active ? "destructive" : "default"}
              onClick={handleChangeStatus}
              disabled={changingStatus}
            >
              {changingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : selectedStaff?.is_active ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================== */}
      {/* DELETE DIALOG */}
      {/* ===================================================== */}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Staff Account</DialogTitle>

            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="font-medium text-red-900">
                  Delete {selectedStaff?.first_name} {selectedStaff?.last_name}?
                </p>

                <p className="mt-1 text-sm text-red-700">
                  The staff account and its stored credential will be
                  permanently removed.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Staff
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
