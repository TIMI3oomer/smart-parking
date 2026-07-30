import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            setError("أدخل بريدك الإلكتروني وكلمة المرور");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const loggedInUser = await login(trimmedEmail, password);
            navigate(loggedInUser?.role === "admin" ? "/admin" : "/dashboard");
        } catch (err) {
            setError(err?.response?.data?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="panel panel--padded stack auth-card">
                <div className="auth-card__header">
                    <h2 className="page-title">تسجيل الدخول</h2>
                    <p className="page-subtitle">مرحبًا بعودتك — أدخل بياناتك للمتابعة.</p>
                </div>

                {error && (
                    <p className="page-error" role="alert" aria-live="assertive">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="stack">
                    <div className="field-group">
                        <label htmlFor="email" className="field-label">البريد الإلكتروني</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                            autoComplete="email"
                            placeholder="أدخل بريدك الإلكتروني"
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password" className="field-label">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={submitting}
                            autoComplete="current-password"
                            placeholder="أدخل كلمة المرور"
                        />
                    </div>

                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                        {submitting ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
                    </button>
                </form>

                <p className="auth-card__footer">
                    ليس لديك حساب؟{" "}
                    <Link to="/register" className="auth-card__link">إنشاء حساب</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;