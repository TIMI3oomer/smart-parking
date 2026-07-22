import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

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
        } catch {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-shell stack">
            <form onSubmit={handleSubmit} className="panel panel--padded stack">
                <h2 className="page-title">تسجيل الدخول</h2>
                {error && <p className="page-error" role="alert">{error}</p>}
                <input
                    className="input"
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    autoComplete="email"
                />
                <input
                    className="input"
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    autoComplete="current-password"
                />
                <button className="btn btn--primary" type="submit" disabled={submitting}>
                    {submitting ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
                </button>
            </form>
        </div>
    );
};

export default Login;
