"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const cancelSignup = useMutation(api.signups.cancelSignup);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your cancellation...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid cancellation link. No token provided.");
      return;
    }

    const performCancellation = async () => {
      try {
        await cancelSignup({ cancelToken: token });
        setStatus("success");
        setMessage("Your registration has been successfully cancelled.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Something went wrong while cancelling your registration.");
      }
    };

    performCancellation();
  }, [token, cancelSignup]);

  return (
    <div className="cancel-container">
      {status === "loading" && (
        <div className="status-box">
          <Loader2 className="animate-spin" size={48} color="var(--secondary)" />
          <h2>Processing...</h2>
          <p>{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="status-box success">
          <CheckCircle2 size={48} color="var(--secondary)" />
          <h2>Registration Cancelled</h2>
          <p>{message}</p>
          <p>We&apos;re sorry you can&apos;t make it, but thank you for letting us know!</p>
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> Back to Homepage
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="status-box error">
          <XCircle size={48} color="var(--primary)" />
          <h2>Cancellation Failed</h2>
          <p>{message}</p>
          <p>If you believe this is an error, please contact us on Discord.</p>
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> Back to Homepage
          </Link>
        </div>
      )}

      <style jsx>{`
        .cancel-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          padding: 2rem;
        }
        .status-box {
          background: var(--dark);
          padding: 3rem;
          border-radius: 1rem;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .status-box.success {
          border-color: var(--secondary);
        }
        .status-box.error {
          border-color: var(--primary);
        }
        h2 {
          margin: 0;
          color: var(--light);
        }
        p {
          color: var(--light_light);
          margin: 0;
        }
        .back-link {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--secondary);
          font-weight: bold;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: var(--primary_light);
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

export default function CancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}
