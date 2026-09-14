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

  const [activeTab, setActiveTab] = useState<"users" | "events">("events");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Events state
  const events = useQuery(api.events.listEvents, {});
  const saveEventMutation = useMutation(api.events.saveEvent);
  const deleteEventMutation = useMutation(api.events.deleteEvent);

  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [editingEvent, setEditingEvent] = useState<{
    _id?: any;
    slug: string;
    title: string;
    date: string;
    body: string;
    groups: { name: string; description?: string; maxSlots: number }[];
  } | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [eventModalError, setEventModalError] = useState<string | null>(null);

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

  const handleOpenNewEvent = () => {
    const today = new Date();
    today.setHours(19, 0, 0, 0);
    const dateStr = today.toISOString();
    const slugDate = dateStr.slice(0, 10).replace(/-/g, "");

    setEditingEvent({
      slug: `${slugDate}_Event`,
      title: "",
      date: dateStr,
      body: "",
      groups: [],
    });
    setEventModalError(null);
  };

  const handleOpenEditEvent = (ev: any) => {
    setEditingEvent({
      _id: ev._id,
      slug: ev.slug,
      title: ev.title,
      date: ev.date,
      body: ev.body || "",
      groups: ev.groups ? [...ev.groups] : [],
    });
    setEventModalError(null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!editingEvent.title.trim()) {
      setEventModalError("Event title is required.");
      return;
    }
    if (!editingEvent.slug.trim()) {
      setEventModalError("Event slug is required.");
      return;
    }

    setSavingEvent(true);
    setEventModalError(null);

    try {
      await saveEventMutation({
        id: editingEvent._id,
        slug: editingEvent.slug,
        title: editingEvent.title,
        date: editingEvent.date,
        body: editingEvent.body,
        groups: editingEvent.groups,
      });
      setEditingEvent(null);
    } catch (err: any) {
      console.error("Error saving event:", err);
      setEventModalError(err.message || "Failed to save event");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: any) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setDeletingEventId(id);
    try {
      await deleteEventMutation({ id });
      if (editingEvent?._id === id) {
        setEditingEvent(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    } finally {
      setDeletingEventId(null);
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

  const filteredEvents = (events || []).filter((ev) => {
    return (
      ev.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      ev.slug.toLowerCase().includes(eventSearchQuery.toLowerCase())
    );
  });

  return (
    <div className="dragon-admin-container">
      <div className="dragon-admin-header">
        <h1>
          <span>🐉</span> Dragon Council
        </h1>
        <p>Manage members, events, roles, and guild permissions across Tarragon.</p>
      </div>

      <div className="dragon-tabs">
        <button
          className={`dragon-tab ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events ({events ? events.length : "..."})
        </button>
        <button
          className={`dragon-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === "events" && (
        <div className="dragon-panel">
          <div className="dragon-controls">
            <input
              type="text"
              className="dragon-search-input"
              placeholder="Search events by title or slug..."
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
            />

            <button
              type="button"
              className="dragon-btn-primary"
              onClick={handleOpenNewEvent}
            >
              + Create Event
            </button>
          </div>

          {events === undefined ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--secondary)" }}>
              Loading events from Convex...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--secondary)" }}>
              No events found.
            </div>
          ) : (
            <div className="dragon-table-wrapper">
              <table className="dragon-users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Groups / Slots</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => {
                    const evDate = new Date(ev.date);
                    const formattedDate = isNaN(evDate.getTime())
                      ? ev.date
                      : evDate.toLocaleDateString("nl-BE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });

                    const totalSlots = ev.groups?.reduce((acc, g) => acc + g.maxSlots, 0) || 0;

                    return (
                      <tr
                        key={ev._id}
                        className="dragon-table-row-clickable"
                        onClick={() => handleOpenEditEvent(ev)}
                      >
                        <td style={{ color: "var(--secondary)", whiteSpace: "nowrap" }}>
                          {formattedDate}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--light)" }}>
                          {ev.title}
                        </td>
                        <td style={{ color: "rgba(242, 211, 180, 0.7)", fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {ev.slug}
                        </td>
                        <td>
                          {ev.groups && ev.groups.length > 0 ? (
                            <span style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
                              {ev.groups.length} tables ({totalSlots} slots)
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)" }}>
                              None
                            </span>
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              type="button"
                              className="dragon-btn-secondary"
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
                              onClick={() => handleOpenEditEvent(ev)}
                            >
                              Edit
                            </button>
                            <Link
                              href={`/event/${ev.slug}`}
                              target="_blank"
                              className="dragon-btn-secondary"
                              style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", textDecoration: "none" }}
                            >
                              View ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit / Create Event Modal */}
      {editingEvent && (
        <div className="dragon-modal-backdrop" onClick={() => !savingEvent && setEditingEvent(null)}>
          <div className="dragon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dragon-modal-header">
              <h2>{editingEvent._id ? "Edit Event" : "Create New Event"}</h2>
              <button
                type="button"
                className="dragon-modal-close"
                onClick={() => setEditingEvent(null)}
                disabled={savingEvent}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: "contents" }}>
              <div className="dragon-modal-body">
                {eventModalError && (
                  <div
                    style={{
                      background: "rgba(220, 38, 38, 0.2)",
                      color: "#f87171",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {eventModalError}
                  </div>
                )}

                <div className="dragon-form-group">
                  <label htmlFor="event-title">Title *</label>
                  <input
                    id="event-title"
                    type="text"
                    required
                    className="dragon-form-input"
                    value={editingEvent.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      if (!editingEvent._id) {
                        // Generate slug suggestion from title + date
                        const slugSuffix = title.replace(/[^a-zA-Z0-9]/g, "");
                        const datePrefix = editingEvent.date.slice(0, 10).replace(/-/g, "");
                        setEditingEvent({
                          ...editingEvent,
                          title,
                          slug: `${datePrefix}_${slugSuffix}`,
                        });
                      } else {
                        setEditingEvent({ ...editingEvent, title });
                      }
                    }}
                    placeholder="e.g. One Shot Night!"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="dragon-form-group">
                    <label htmlFor="event-slug">Slug (Filename/URL) *</label>
                    <input
                      id="event-slug"
                      type="text"
                      required
                      className="dragon-form-input"
                      value={editingEvent.slug}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          slug: e.target.value.replace(/\.mdx$/, ""),
                        })
                      }
                      placeholder="e.g. 20260923_Oneshot"
                    />
                  </div>

                  <div className="dragon-form-group">
                    <label htmlFor="event-date">Date & Time *</label>
                    <input
                      id="event-date"
                      type="datetime-local"
                      required
                      className="dragon-form-input"
                      value={
                        editingEvent.date
                          ? new Date(
                              new Date(editingEvent.date).getTime() -
                                new Date().getTimezoneOffset() * 60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        setEditingEvent({
                          ...editingEvent,
                          date: isNaN(d.getTime()) ? e.target.value : d.toISOString(),
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="dragon-form-group">
                  <label htmlFor="event-body">Event Description (Markdown)</label>
                  <textarea
                    id="event-body"
                    rows={8}
                    className="dragon-form-textarea"
                    value={editingEvent.body}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, body: e.target.value })
                    }
                    placeholder="Curious about Dungeons & Dragons? ..."
                  />
                </div>

                <div className="dragon-form-group">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <label style={{ margin: 0 }}>Signup Table Groups</label>
                    <button
                      type="button"
                      className="dragon-btn-secondary"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }}
                      onClick={() =>
                        setEditingEvent({
                          ...editingEvent,
                          groups: [
                            ...editingEvent.groups,
                            {
                              name: `Table ${editingEvent.groups.length + 1}`,
                              description: "",
                              maxSlots: 6,
                            },
                          ],
                        })
                      }
                    >
                      + Add Group / Table
                    </button>
                  </div>

                  {editingEvent.groups.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", margin: 0 }}>
                      No signup groups configured. Users won&apos;t see internal table signups.
                    </p>
                  ) : (
                    editingEvent.groups.map((grp, idx) => (
                      <div key={idx} className="dragon-group-row">
                        <input
                          type="text"
                          className="dragon-form-input"
                          placeholder="Group Name (e.g. Table 1)"
                          value={grp.name}
                          required
                          onChange={(e) => {
                            const newGroups = [...editingEvent.groups];
                            newGroups[idx].name = e.target.value;
                            setEditingEvent({ ...editingEvent, groups: newGroups });
                          }}
                        />
                        <input
                          type="text"
                          className="dragon-form-input"
                          placeholder="Description (optional)"
                          value={grp.description || ""}
                          onChange={(e) => {
                            const newGroups = [...editingEvent.groups];
                            newGroups[idx].description = e.target.value;
                            setEditingEvent({ ...editingEvent, groups: newGroups });
                          }}
                        />
                        <input
                          type="number"
                          min={1}
                          max={50}
                          className="dragon-form-input"
                          placeholder="Max"
                          value={grp.maxSlots}
                          required
                          onChange={(e) => {
                            const newGroups = [...editingEvent.groups];
                            newGroups[idx].maxSlots = parseInt(e.target.value, 10) || 1;
                            setEditingEvent({ ...editingEvent, groups: newGroups });
                          }}
                        />
                        <button
                          type="button"
                          className="dragon-btn-danger"
                          onClick={() => {
                            const newGroups = editingEvent.groups.filter((_, i) => i !== idx);
                            setEditingEvent({ ...editingEvent, groups: newGroups });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="dragon-modal-footer">
                <div>
                  {editingEvent._id && (
                    <button
                      type="button"
                      className="dragon-btn-danger"
                      disabled={savingEvent || deletingEventId === editingEvent._id}
                      onClick={() => handleDeleteEvent(editingEvent._id)}
                    >
                      {deletingEventId === editingEvent._id ? "Deleting..." : "Delete Event"}
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="dragon-btn-secondary"
                    disabled={savingEvent}
                    onClick={() => setEditingEvent(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dragon-btn-primary"
                    disabled={savingEvent}
                  >
                    {savingEvent ? "Saving..." : editingEvent._id ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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

