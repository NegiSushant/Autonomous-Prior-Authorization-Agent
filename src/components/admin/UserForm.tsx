"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

type UserFormData = {
  email: string;
  password: string;
  name: string;
  role: string;
  organizationId: string;
};

type Props = {
  mode: "create" | "edit";
  userId?: number;
  initialData?: Omit<UserFormData, "password"> & { password?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
};

const ROLES = ["ADMIN", "REVIEWER"];

export default function UserForm({
  mode,
  userId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<
    { id: number; name: string }[]
  >([]);

  const [form, setForm] = useState<UserFormData>({
    email: initialData?.email || "",
    password: "",
    name: initialData?.name || "",
    role: initialData?.role || "REVIEWER",
    organizationId:
      initialData?.organizationId != null
        ? String(initialData.organizationId)
        : "",
  });

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await fetch("/api/admin/organizations");
        const json = await res.json();
        if (res.ok && json.success) {
          setOrganizations(json.data || []);
        }
      } catch {
        // ignore
      }
    }
    void loadOrgs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "create" && !form.password.trim()) {
        throw new Error("Password is required for new users");
      }

      const url =
        mode === "create" ? "/api/admin/users" : `/api/admin/users/${userId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const body: Record<string, unknown> = {
        email: form.email,
        name: form.name,
        role: form.role,
        organizationId: form.organizationId || null,
      };
      if (form.password.trim()) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Something went wrong");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="user@hospital.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">
          Password{" "}
          {mode === "create" && <span className="text-red-400">*</span>}
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required={mode === "create"}
          placeholder={
            mode === "edit" ? "Leave blank to keep current" : "••••••••"
          }
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={inputClass}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">
            Organization
          </label>
          <select
            name="organizationId"
            value={form.organizationId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">None</option>
            {organizations.map((org) => (
              <option key={org.id} value={String(org.id)}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              {mode === "create" ? "Create User" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";
