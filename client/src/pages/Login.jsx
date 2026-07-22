import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"

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
    <div className="flex min-h-screen flex-col justify-center bg-gray-900 px-6 py-12 lg:px-8" dir="rtl">
        <div className="mx-auto w-full max-w-sm">
            <h2 className="mt-8 text-center text-3xl font-bold tracking-tight text-white">
                تسجيل الدخول
            </h2>
        </div>

        <div className="mt-10 mx-auto w-full max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <p
                        role="alert"
                        className="rounded-md border border-red-500 bg-red-500/10 p-3 text-center text-sm text-red-400"
                    >
                        {error}
                    </p>
                )}

                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-100"
                    >
                        البريد الإلكتروني
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                        autoComplete="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500 disabled:opacity-50 transition duration-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-gray-100"
                    >
                        كلمة المرور
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={submitting}
                        autoComplete="current-password"
                        placeholder="أدخل كلمة المرور"
                        className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500 disabled:opacity-50 transition duration-200"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                >
                    {submitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
                ليس لديك حساب؟{" "}
                <Link
                    to="/register"
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                    إنشاء حساب
                </Link>
            </p>
        </div>
    </div>
);
};

export default Login;
