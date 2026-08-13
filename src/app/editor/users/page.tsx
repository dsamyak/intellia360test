"use client";

import React, { useCallback, useEffect, useState } from "react";

interface UserRow { id: string; name: string; email: string; role: string; createdAt: string; }

const ROLES = ["ADMIN","STUDENT","PARENT","TEACHER","SCHOOL","EDITOR"];
const ROLE_COLORS: Record<string,string> = {
  STUDENT: "#3b82f6", TEACHER: "#10b981", EDITOR: "#7c3aed",
  ADMIN: "#f97316", PARENT: "#06b6d4", SCHOOL: "#ec4899",
};

export default function UsersPage() {
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [query, setQuery]       = useState("");

  // Edit modal
  const [editing, setEditing]   = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving]     = useState(false);
  const [editMsg, setEditMsg]   = useState("");

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ name:"", email:"", password:"", role:"STUDENT" });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (roleFilter) params.set("role", roleFilter);
    if (query)      params.set("q",    query);
    fetch(`/api/editor/users?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setUsers(j.data);
          setTotal(j.meta.total);
          setPages(j.meta.pages);
        }
      })
      .finally(() => setLoading(false));
  }, [page, roleFilter, query]);

  useEffect(() => { load(); }, [load]);

  async function updateRole() {
    if (!editing) return;
    setSaving(true); setEditMsg("");
    const r = await fetch(`/api/editor/users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole }),
    }).then((r) => r.json());
    setSaving(false);
    if (r.success) { setEditMsg("Updated!"); load(); setTimeout(() => setEditing(null), 800); }
    else setEditMsg(r.message);
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This is permanent.`)) return;
    const r = await fetch(`/api/editor/users/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (r.success) load(); else alert(r.message);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setCreateMsg("");
    const r = await fetch("/api/editor/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    }).then((r) => r.json());
    setCreating(false);
    if (r.success) {
      setCreateMsg("User created!"); setShowCreate(false);
      setNewForm({ name:"", email:"", password:"", role:"STUDENT" });
      load();
    } else setCreateMsg(r.message);
  }

  return (
    <div className="ed-page">
      <div className="ed-page-header">
        <div>
          <h2 className="ed-page-title">Users</h2>
          <p className="ed-page-sub">Search, filter, edit roles, and manage platform users.</p>
        </div>
        <button className="ed-btn-primary" onClick={() => setShowCreate((s) => !s)}>
          {showCreate ? "Cancel" : "+ New User"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="ed-panel ed-create-panel">
          <div className="ed-panel-header"><span className="ed-panel-title">➕ Create User</span></div>
          <div className="ed-panel-body">
            <form className="ed-form-grid" onSubmit={createUser}>
              <div className="ed-field">
                <label className="ed-label">Full Name</label>
                <input className="ed-input" required placeholder="Jane Doe"
                  value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Email</label>
                <input className="ed-input" type="email" required placeholder="jane@school.com"
                  value={newForm.email} onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Password</label>
                <input className="ed-input" type="password" required minLength={8} placeholder="Min 8 chars"
                  value={newForm.password} onChange={(e) => setNewForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Role</label>
                <select className="ed-input"
                  value={newForm.role} onChange={(e) => setNewForm((f) => ({ ...f, role: e.target.value }))}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="ed-form-actions">
                <button className="ed-btn-primary" type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
            {createMsg && <p className="ed-success-txt">{createMsg}</p>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="ed-filter-row">
        <input
          className="ed-input ed-search-input"
          placeholder="🔍 Search name or email…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <select className="ed-input ed-select-sm"
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="ed-total-badge">{total} users</span>
      </div>

      {/* Table */}
      <div className="ed-panel">
        <div className="ed-table-wrap">
          {loading ? (
            <div className="ed-empty">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="ed-empty">No users found.</div>
          ) : (
            <table className="ed-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="ed-user-row">
                        <div className="ed-user-avatar" style={{ background: ROLE_COLORS[u.role] ?? "#9ca3af" }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td><span className="ed-muted">{u.email}</span></td>
                    <td>
                      <span className="ed-role-pill" style={{ background: `${ROLE_COLORS[u.role] ?? "#9ca3af"}18`, color: ROLE_COLORS[u.role] ?? "#9ca3af" }}>
                        {u.role}
                      </span>
                    </td>
                    <td><span className="ed-muted">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                    <td className="ed-actions-cell">
                      <button className="ed-btn-sm"
                        onClick={() => { setEditing(u); setEditRole(u.role); setEditMsg(""); }}>
                        ✏️ Edit Role
                      </button>
                      <button className="ed-btn-sm danger" onClick={() => deleteUser(u.id, u.name)}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="ed-pagination">
            <button className="ed-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span className="ed-page-label">Page {page} / {pages}</span>
            <button className="ed-btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Edit role modal */}
      {editing && (
        <div className="ed-modal-overlay" onClick={() => setEditing(null)}>
          <div className="ed-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-header">
              <span>Edit Role — {editing.name}</span>
              <button className="ed-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="ed-modal-body">
              <div className="ed-field">
                <label className="ed-label">Role</label>
                <select className="ed-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {editMsg && <p className="ed-success-txt">{editMsg}</p>}
            </div>
            <div className="ed-modal-footer">
              <button className="ed-btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="ed-btn-primary" onClick={updateRole} disabled={saving}>
                {saving ? "Saving…" : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
