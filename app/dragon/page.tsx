"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { updateUserRoleAction } from "../actions/admin";

type Role = "user" | "member" | "dragon";

interface AdminUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName: string;
  email: string;
  imageUrl?: string;
  username?: string | null;
  role: Role;
  isMember: boolean;
  createdAt?: number;
}

export default function DragonAdminPage() {
  const { isLoaded, isSignedIn } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateUserRoleInConvex = useMutation(api.users.updateUserRoleByClerkId);

  const [activeTab, setActiveTab] = useState<"users">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDragon = currentUser?.role === "dragon";

  // Fetch Clerk users list
  useEffect(() => {
    if (!isSignedIn || !isDragon) return;

    let isMounted = true;
    setLoadingUsers(true);

    fetch("/api/admin/users")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load users");
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setUsers(data.users || []);
          setLoadingUsers(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error loading admin users:", err);
          setErrorMessage(err.message);
          setLoadingUsers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, isDragon]);

  const handleRoleChange = async (targetUser: AdminUser, newRole: Role) => {
    if (targetUser.role === newRole) return;

    setUpdatingUserId(targetUser.id);
    setSavedUserId(null);

    // Optimistically update local state
    const previousUsers = [...users];
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              role: newRole,
              isMember: newRole === "member" || newRole === "dragon",
            }
          : u
      )
    );

    try {
      // 1. Update Clerk publicMetadata via server action
      await updateUserRoleAction(targetUser.id, newRole);

      // 2. Update Convex users table
      await updateUserRoleInConvex({
        clerkId: targetUser.id,
        role: newRole,
        name: targetUser.fullName,
        email: targetUser.email,
        imageUrl: targetUser.imageUrl,
      });

      setSavedUserId(targetUser.id);
      setTimeout(() => {
        setSavedUserId((current) => (current === targetUser.id ? null : current));
      }, 2500);
    } catch (err: any) {
      console.error("Failed to update user role:", err);
      alert(err.message || "Failed to update role. Reverting change.");
      setUsers(previousUsers);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Auth gate checks
  if (!isLoaded || (isSignedIn && currentUser === undefined)) {
    return (
      <div className="dragon-admin-container">
        <div className="dragon-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--secondary)" }}>Loading dragon archives...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="dragon-admin-container">
        <div className="dragon-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <h2 style={{ color: "#f87171", marginBottom: "1rem" }}>Dragon Access Required</h2>
          <p style={{ color: "var(--secondary)", marginBottom: "1.5rem" }}>
            You must be signed in to view this council.
          </p>
          <Link href="/" className="auth-btn">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isDragon) {
    return (
      <div className="dragon-admin-container">
        <div className="dragon-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <h2 style={{ color: "#f87171", marginBottom: "1rem" }}>Access Denied</h2>
          <p style={{ color: "var(--secondary)", marginBottom: "1.5rem" }}>
            This sanctum is reserved for Dragons. You currently have the &quot;{currentUser?.role || "user"}&quot; role.
          </p>
          <Link href="/" className="auth-btn">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="dragon-admin-container">
      <div className="dragon-admin-header">
        <h1>
          <span>🐉</span> Dragon Council
        </h1>
        <p>Manage members, roles, and guild permissions across Tarragon.</p>
      </div>

      <div className="dragon-tabs">
        <button
          className={`dragon-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === "users" && (
        <div className="dragon-panel">
          <div className="dragon-controls">
            <input
              type="text"
              className="dragon-search-input"
              placeholder="Search by full name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="dragon-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="dragon">
                Dragons ({users.filter((u) => u.role === "dragon").length})
              </option>
              <option value="member">
                Members ({users.filter((u) => u.role === "member").length})
              </option>
              <option value="user">
                Standard Users ({users.filter((u) => u.role === "user").length})
              </option>
            </select>
          </div>

          {errorMessage && (
            <div
              style={{
                background: "rgba(220, 38, 38, 0.2)",
                color: "#f87171",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--secondary)" }}>
              Loading user registry...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--secondary)" }}>
              No users match your criteria.
            </div>
          ) : (
            <div className="dragon-table-wrapper">
              <table className="dragon-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Membership</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="dragon-user-info">
                          {u.imageUrl ? (
                            <Image
                              src={u.imageUrl}
                              alt={u.fullName}
                              width={40}
                              height={40}
                              className="dragon-avatar"
                            />
                          ) : (
                            <div className="dragon-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="dragon-user-names">
                            <span className="dragon-fullname">{u.fullName}</span>
                            {u.username && (
                              <span className="dragon-username">@{u.username}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--secondary)" }}>{u.email}</td>
                      <td>
                        {u.isMember ? (
                          <span className="role-badge role-member">Active</span>
                        ) : (
                          <span
                            className="role-badge"
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              color: "var(--secondary)",
                            }}
                          >
                            None
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <select
                            className={`role-select role-${u.role}`}
                            value={u.role}
                            disabled={updatingUserId === u.id}
                            onChange={(e) =>
                              handleRoleChange(u, e.target.value as Role)
                            }
                          >
                            <option value="user">User</option>
                            <option value="member">Member</option>
                            <option value="dragon">Dragon (Admin)</option>
                          </select>

                          {updatingUserId === u.id && (
                            <span className="status-indicator saving">
                              Updating...
                            </span>
                          )}
                          {savedUserId === u.id && (
                            <span className="status-indicator saved">
                              ✓ Saved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
