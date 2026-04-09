"use client";

import { useState, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { User, Mail, CheckCircle2, Loader2 } from "lucide-react";

interface SignupSystemProps {
  eventSlug: string;
  eventTitle: string;
  groups: {
    name: string;
    maxSlots: number;
  }[];
}

export default function SignupSystem({
  eventSlug,
  eventTitle,
  groups,
}: SignupSystemProps) {
  const signups = useQuery(api.signups.getEventSignups, { eventSlug });
  const signupMutation = useMutation(api.signups.signup);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!groups || groups.length === 0) return null;

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
        name: formData.name,
        email: formData.email,
        maxSlots: group.maxSlots,
      });
      setSuccess(true);
      setFormData({ name: "", email: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-system">
      <h2>Sign Up</h2>
      <div className="groups-grid">
        {groups.map((group) => {
          const groupSignups = signups?.filter((s) => s.groupName === group.name) || [];
          const isFull = groupSignups.length >= group.maxSlots;

          return (
            <div
              key={group.name}
              className={`group-card ${selectedGroup === group.name ? "selected" : ""} ${isFull ? "full" : ""}`}
              onClick={() => !isFull && setSelectedGroup(group.name)}
            >
              <div className="group-header">
                <h3>{group.name}</h3>
                <span className="slots">
                  {groupSignups.length} / {group.maxSlots} slots
                </span>
              </div>
              <div className="signup-names">
                {groupSignups.map((s, i) => (
                  <span key={i} className="signup-name">
                    {s.name}
                  </span>
                ))}
                {groupSignups.length === 0 && <p className="no-signups">Be the first to join!</p>}
              </div>
              {isFull && <div className="full-badge">FULL</div>}
            </div>
          );
        })}
      </div>

      {selectedGroup && !success && (
        <form className="signup-form" onSubmit={handleSubmit}>
          <h3>Register for {selectedGroup}</h3>
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
              "Confirm Registration"
            )}
          </button>
        </form>
      )}

      {success && (
        <div className="success-message">
          <CheckCircle2 size={48} color="var(--secondary)" />
          <h3>Registration Successful!</h3>
          <p>
            You&apos;ve been signed up for <strong>{selectedGroup}</strong>. A confirmation email has
            been sent to your inbox.
          </p>
          <button onClick={() => setSuccess(false)} className="submit-button">
            Sign up someone else
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
        .signup-system h2 {
          text-align: left;
          margin-top: 0;
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
        .group-card.full {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0, 0, 0, 0.3);
          border-style: dashed;
        }
        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .group-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--light);
        }
        .slots {
          font-size: 0.85rem;
          font-weight: bold;
          color: var(--secondary);
        }
        .signup-names {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .signup-name {
          background: rgba(255, 255, 255, 0.1);
          color: var(--light_light);
          padding: 0.2rem 0.6rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .no-signups {
          font-style: italic;
          color: rgba(242, 211, 180, 0.4);
          margin: 0;
        }
        .full-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: var(--primary);
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: bold;
          box-shadow: var(--shadow-md);
        }
        .signup-form {
          background: rgba(0, 0, 0, 0.2);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .signup-form h3 {
          margin-top: 0;
          color: var(--primary_light);
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
          font-weight: bold;
          color: var(--light);
        }
        .form-group input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: var(--darker);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: var(--light_light);
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--secondary);
        }
        .submit-button {
          width: 100%;
          padding: 1rem;
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
