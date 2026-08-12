import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verify() {
      try {
        const response = await fetch(`/api/v1/auth/verify-email/${token}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.mssg || "Verification failed");
        }

        setStatus("success");
        setMessage(data.mssg || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    verify();
  }, [token]);

  return (
    <AuthLayout title="Email verification" subtitle="One last step before you sign in.">
      <div
        className={`rounded-2xl px-5 py-4 text-sm ${
          status === "success"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : status === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-slate-200 bg-slate-50 text-slate-600"
        }`}
      >
        {message}
      </div>

      {status !== "loading" && (
        <Link
          to="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Go to sign in
        </Link>
      )}
    </AuthLayout>
  );
}
