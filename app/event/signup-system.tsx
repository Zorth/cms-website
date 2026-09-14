"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import { User, Mail, CheckCircle2, Loader2, LogIn, Trash2, Shield } from "lucide-react";

interface SignupSystemProps {
  eventSlug: string;
  eventTitle: string;
  groups: {
    name: string;
    description?: string;
    maxSlots: number;
  }[];
}

export default function SignupSystem({
  eventSlug,
  eventTitle,
  groups,
}: SignupSystemProps) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const signups = useQuery(api.signups.getEventSignups, { eventSlug });
  const signupMutation = useMutation(api.signups.signup);
  const cancelMySignupMutation = useMutation(api.signups.cancelMySignup);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-fill from Clerk account if logged in
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const bestName =
        currentUser?.name ||
        clerkUser.fullName ||
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username ||
        "";
      const bestEmail =
        currentUser?.email ||
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        "";

      setFormData((prev) => ({
        name: prev.name || bestName,
        email: prev.email || bestEmail,
      }));
    }
  }, [isSignedIn, clerkUser, currentUser]);

  if (!groups || groups.length === 0) return null;

  // Check if current user is already registered for this event
  const mySignup = signups?.find((s) => {
    if (currentUser?._id && s.userId === currentUser._id) return true;
    if (clerkUser?.primaryEmailAddress?.emailAddress && s.email) {
      return (
        s.email.toLowerCase() ===
        clerkUser.primaryEmailAddress.emailAddress.toLowerCase()
      );
    }
    return false;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    setSubmitting(true);
    setError(null);

    const group = groups.find((g) => g.name === selectedGroup);
    if (!group) return;

    try {
      await signupMutation({
        eventSlug,
        eventTitle,
        groupName: selectedGroup,
        name: formData.name.trim(),
        email: formData.email.trim(),
        maxSlots: group.maxSlots,
      });
      setSuccess(true);
      setSelectedGroup(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async (signupId: any) => {
    if (!confirm("Are you sure you want to cancel your registration for this event?")) {
      return;
    }
    setCancellingId(signupId);
    setError(null);
    try {
      await cancelMySignupMutation({ signupId });
      setSuccess(false);
    } catch (err: any) {
      setError(err.message || "Failed to cancel registration.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="signup-system">
      <div className="signup-header-row">
        <h2>Sign Up for this Event</h2>
        {isLoaded && !isSignedIn && (
          <div className="clerk-hint-banner">
            <span>Have an account?</span>
            <SignInButton mode="modal">
              <button type="button" className="clerk-sign-in-btn">
                <LogIn size={15} /> Sign In
              </button>
            </SignInButton>
          </div>
        )}
      </div>

      {/* User's existing registration status banner */}
      {mySignup && (
        <div className="user-registered-banner">
          <div className="registered-info">
            <CheckCircle2 size={24} className="registered-check" />
            <div>
              <p className="registered-title">
                You are registered for <strong>{mySignup.groupName}</strong> as &quot;{mySignup.name}&quot;.
              </p>
              <p className="registered-sub">
                A confirmation with details was sent to {mySignup.email}.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-cancel-my-signup"
            disabled={cancellingId === mySignup._id}
            onClick={() => handleCancelRegistration(mySignup._id)}
          >
            {cancellingId === mySignup._id ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Trash2 size={15} />
            )}
            <span>Cancel My Spot</span>
          </button>
        </div>
      )}

      <div className="groups-grid">
        {groups.map((group) => {
          const groupSignups = signups?.filter((s) => s.groupName === group.name) || [];
          const isFull = groupSignups.length >= group.maxSlots;
          const isUserInThisGroup = mySignup?.groupName === group.name;
          const isSelected = selectedGroup === group.name;

          return (
            <div
              key={group.name}
              className={`group-card ${isSelected ? "selected" : ""} ${
                isFull ? "full" : ""
              } ${isUserInThisGroup ? "my-group" : ""}`}
            >
              <div className="group-header">
                <h3>{group.name}</h3>
                <span className="slots">
                  {groupSignups.length} / {group.maxSlots} slots
                </span>
              </div>
              {group.description && <p className="group-description">{group.description}</p>}
              
              <div className="signup-names">
                {groupSignups.map((s, i) => {
                  const isCurrent = currentUser?._id && s.userId === currentUser._id;
                  return (
                    <div
                      key={i}
                      className={`signup-name-item ${isCurrent ? "is-current-user" : ""}`}
                    >
                      <span className="signup-name-text">
                        {s.name}
                        {isCurrent && " (You)"}
                      </span>
                      {currentUser?.role === "dragon" && s.email && (
                        <span className="signup-dragon-email" title={s.email}>
                          {s.email}
                        </span>
                      )}
                    </div>
                  );
                })}
                {groupSignups.length === 0 && <p className="no-signups">Be the first to join!</p>}
              </div>

              {/* Action Button inside the card */}
              <div className="card-action-area">
                {isUserInThisGroup ? (
                  <div className="registered-badge-btn">
                    <CheckCircle2 size={16} /> You are registered
                  </div>
                ) : isFull ? (
                  <button type="button" className="btn-table-action btn-table-full" disabled>
                    Table Full
                  </button>
                ) : mySignup ? (
                  <button type="button" className="btn-table-action btn-table-disabled" disabled>
                    Already Registered
                  </button>
                ) : isSelected ? (
                  <button
                    type="button"
                    className="btn-table-action btn-table-selected"
                    onClick={() => setSelectedGroup(null)}
                  >
                    Selected (Click to Close)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-table-action btn-table-join"
                    onClick={() => {
                      setSelectedGroup(group.name);
                      // Scroll to form smoothly
                      setTimeout(() => {
                        const form = document.getElementById("signup-form-anchor");
                        if (form) form.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }}
                  >
                    Sign Up for Table
                  </button>
                )}
              </div>

              {isUserInThisGroup && <div className="registered-badge">REGISTERED</div>}
              {isFull && !isUserInThisGroup && <div className="full-badge">FULL</div>}
            </div>
          );
        })}
      </div>

      {/* Anchor for auto-scroll */}
      <div id="signup-form-anchor" />

      {/* Signup Form */}
      {selectedGroup && !success && !mySignup && (
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Register for {selectedGroup}</h3>
            {isSignedIn && clerkUser ? (
              <div className="account-tag">
                <Shield size={14} /> Signed in as <strong>{clerkUser.fullName || clerkUser.username || "User"}</strong>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button type="button" className="form-login-hint-btn">
                  <LogIn size={13} /> Log in to auto-fill
                </button>
              </SignInButton>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="name">
              <User size={18} /> (Nick)Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} /> E-mail
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Your email (for confirmation)"
            />
          </div>

          <button type="submit" disabled={submitting} className="submit-button">
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Registering...
              </>
            ) : (
              `Confirm Registration for ${selectedGroup}`
            )}
          </button>

          <p className="privacy-notice">
            We only use your name and email to manage this registration and send your confirmation token.
            See our <Link href="/nl/Privacy-Beleid">Privacy Policy</Link>.
          </p>
        </form>
      )}

      {success && (
        <div className="success-message">
          <CheckCircle2 size={48} color="var(--secondary)" />
          <h3>Registration Confirmed!</h3>
          <p>
            You have been successfully registered for this event. A confirmation email has been sent to your inbox.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedGroup(null);
            }}
            className="submit-button"
            style={{ maxWidth: "250px", margin: "0 auto" }}
          >
            Done
          </button>
        </div>
      )}

      <style jsx>{`
        .signup-system {
          margin-top: 3rem;
          padding: 2rem;
          background: var(--dark);
          border-radius: 1rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .signup-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .signup-header-row h2 {
          text-align: left;
          margin: 0;
        }
        .clerk-hint-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--secondary);
          background: rgba(151, 183, 142, 0.08);
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          border: 1px solid rgba(151, 183, 142, 0.2);
        }
        .clerk-sign-in-btn {
          background: var(--secondary);
          color: #1a221d;
          border: none;
          border-radius: 1rem;
          padding: 0.25rem 0.65rem;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s;
        }
        .clerk-sign-in-btn:hover {
          background: #add1a3;
          transform: translateY(-1px);
        }
        .user-registered-banner {
          background: rgba(151, 183, 142, 0.12);
          border: 1px solid var(--secondary);
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .registered-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .registered-info :global(.registered-check) {
          color: var(--secondary);
          flex-shrink: 0;
        }
        .registered-title {
          margin: 0;
          font-size: 1rem;
          color: var(--light);
        }
        .registered-sub {
          margin: 0.2rem 0 0 0;
          font-size: 0.82rem;
          color: #94a3b8;
        }
        .btn-cancel-my-signup {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }
        .btn-cancel-my-signup:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
          color: #fff;
        }
        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }
        .group-card {
          padding: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background: rgba(0, 0, 0, 0.2);
        }
        .group-card:hover:not(.full) {
          border-color: var(--secondary);
          transform: translateY(-3px);
          background: rgba(151, 183, 142, 0.05);
        }
        .group-card.selected {
          border-color: var(--secondary);
          background: rgba(151, 183, 142, 0.1);
          box-shadow: 0 0 15px rgba(151, 183, 142, 0.1);
        }
        .group-card.my-group {
          border-color: var(--secondary);
          background: rgba(151, 183, 142, 0.07);
        }
        .group-card.full {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0, 0, 0, 0.3);
          border-style: dashed;
        }
        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.75rem;
        }
        .group-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--light);
        }
        .slots {
          font-size: 0.85rem;
          color: var(--secondary);
          font-weight: bold;
        }
        .group-description {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .signup-names {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }
        .signup-name-item {
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.35rem 0.65rem;
          border-radius: 0.5rem;
          color: var(--light);
        }
        .signup-name-item.is-current-user {
          background: rgba(151, 183, 142, 0.25);
          border: 1px solid var(--secondary);
        }
        .signup-name-text {
          font-weight: 600;
        }
        .signup-dragon-email {
          font-size: 0.72rem;
          color: #94a3b8;
          word-break: break-all;
          margin-top: 0.1rem;
        }
        .card-action-area {
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-table-action {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
          border: none;
        }
        .btn-table-join {
          background: var(--primary);
          color: white;
        }
        .btn-table-join:hover {
          background: var(--primary_light);
          transform: translateY(-1px);
        }
        .btn-table-login {
          background: var(--secondary);
          color: #1a221d;
        }
        .btn-table-login:hover {
          background: #add1a3;
          transform: translateY(-1px);
        }
        .btn-table-selected {
          background: rgba(151, 183, 142, 0.2);
          color: var(--secondary);
          border: 1px solid var(--secondary);
        }
        .btn-table-full, .btn-table-disabled {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .registered-badge-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--secondary);
          background: rgba(151, 183, 142, 0.15);
          border: 1px solid var(--secondary);
          padding: 0.45rem;
          border-radius: 0.5rem;
        }
        .no-signups {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.3);
          font-style: italic;
          margin: 0;
        }
        .full-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--primary);
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
        }
        .registered-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--secondary);
          color: #1a221d;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
        }
        .signup-form {
          background: rgba(0, 0, 0, 0.25);
          padding: 2rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 500px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease;
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .form-header h3 {
          margin: 0;
          color: var(--secondary);
        }
        .form-login-hint-btn {
          background: rgba(151, 183, 142, 0.15);
          color: var(--secondary);
          border: 1px solid rgba(151, 183, 142, 0.3);
          border-radius: 1rem;
          padding: 0.25rem 0.65rem;
          font-weight: 600;
          font-size: 0.78rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s;
        }
        .form-login-hint-btn:hover {
          background: rgba(151, 183, 142, 0.25);
          border-color: var(--secondary);
        }
        .account-tag {
          font-size: 0.75rem;
          color: var(--secondary);
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(151, 183, 142, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.4rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--light);
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--light);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          border-color: var(--secondary);
        }
        .submit-button {
          width: 100%;
          padding: 0.85rem;
          background: var(--primary);
          color: var(--light_light);
          border: none;
          border-radius: 0.75rem;
          font-family: var(--font-rockwell), serif;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-md);
        }
        .submit-button:hover:not(:disabled) {
          background: var(--primary_light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .privacy-notice {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.85rem;
          text-align: center;
          line-height: 1.4;
        }
        .privacy-notice :global(a) {
          color: var(--secondary);
          text-decoration: underline;
        }
        .error-message {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-weight: bold;
          border: 1px solid rgba(255, 107, 107, 0.2);
        }
        .success-message {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 1rem;
          border: 1px solid var(--secondary);
          animation: fadeIn 0.4s ease;
        }
        .success-message h3 {
          margin: 1.5rem 0 1rem;
          color: var(--secondary);
          font-size: 1.5rem;
        }
        .success-message p {
          color: var(--light_light);
          margin-bottom: 2rem;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
