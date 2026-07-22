import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone:"",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.phone.trim() ||
            !form.password
        ) {
            setError("يرجى تعبئة جميع الحقول");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("كلمتا المرور غير متطابقتين");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
            });

            navigate("/login");
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center px-6">
            <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-2xl ring-1 ring-white/10">

                <h2 className="text-center text-3xl font-bold text-white mb-8">
                    إنشاء حساب
                </h2>

                {error && (
                    <div className="mb-4 rounded bg-red-500/10 p-3 text-red-400 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <input
                        type="text"
                        name="name"
                        placeholder="الاسم"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-md bg-white/5 px-4 py-3 text-white outline outline-1 outline-white/10 focus:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="البريد الإلكتروني"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-md bg-white/5 px-4 py-3 text-white outline outline-1 outline-white/10 focus:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                    />
                    <input 
                    type="phone"
                    name="phone"
                    placeholder="رقم الهاتف"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-md bg-white/5 px-4 py-3 text-white outline outline-1 outline-white/10 focus:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="كلمة المرور"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-md bg-white/5 px-4 py-3 text-white outline outline-1 outline-white/10 focus:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="تأكيد كلمة المرور"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-md bg-white/5 px-4 py-3 text-white outline outline-1 outline-white/10 focus:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                    />

                    <button
                        disabled={submitting}
                        className="w-full rounded-md bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 transition duration-200"
                    >
                        {submitting ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    لديك حساب بالفعل؟{" "}
                    <Link
                        to="/login"
                        className="text-indigo-400 hover:text-indigo-300"
                    >
                        تسجيل الدخول
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Register;