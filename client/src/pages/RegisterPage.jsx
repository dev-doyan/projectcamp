import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout, {
  AuthButton,
  AuthError,
  AuthInput,
} from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await register(form);
      setSuccess(data.message || "Account created. Check your email to verify.");
      setForm({ name: "", username: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing projects with your team."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}
        <AuthInput
          label="Full name"
          id="name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
        />
        <AuthInput
          label="Username"
          id="username"
          name="username"
          required
          value={form.username}
          onChange={handleChange}
          placeholder="janedoe"
        />
        <AuthInput
          label="Email"
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <AuthInput
          label="Password"
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
        />
        <AuthButton loading={loading}>Create account</AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
