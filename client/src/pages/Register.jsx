import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        carModel: "",
        carPlate: "",
        carColor: "",
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
            !form.password ||
            !form.carModel.trim() ||
            !form.carPlate.trim()
        ) {
            setError("يرجى تعبئة جميع الحقول، بما في ذلك بيانات السيارة (الطراز ورقم اللوحة)");
            return;
        }

        if (form.password.length < 8) {
            setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل");
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
                carModel: form.carModel,
                carPlate: form.carPlate,
                carColor: form.carColor,
            });

            navigate("/login");
        } catch (err) {
            setError(err?.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="panel panel--padded stack auth-card">
                <div className="auth-card__header">
                    <h2 className="page-title">إنشاء حساب</h2>
                    <p className="page-subtitle">أدخل بياناتك لإنشاء حساب جديد.</p>
                </div>

                {error && (
                    <p className="page-error" role="alert" aria-live="assertive">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="stack">
                    <div className="field-group">
                        <label htmlFor="name" className="field-label">الاسم</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            className="input"
                            placeholder="الاسم الكامل"
                            value={form.name}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="name"
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="email" className="field-label">البريد الإلكتروني</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="input"
                            placeholder="البريد الإلكتروني"
                            value={form.email}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="email"
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="phone" className="field-label">رقم الهاتف</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            className="input"
                            placeholder="رقم الهاتف"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password" className="field-label">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className="input"
                            placeholder="كلمة المرور"
                            value={form.password}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="new-password"
                            aria-describedby="password-hint"
                        />
                        <span id="password-hint" className="field-hint">8 أحرف على الأقل</span>
                    </div>

                    <div className="field-group">
                        <label htmlFor="confirmPassword" className="field-label">تأكيد كلمة المرور</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            className="input"
                            placeholder="تأكيد كلمة المرور"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" style={{ marginTop: "0.5rem" }}>
                            بيانات السيارة
                        </label>
                        <p className="field-hint">كل مستخدم لديه سيارة واحدة فقط مسجّلة في النظام.</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="carModel" className="field-label">طراز السيارة</label>
                        <input
                            id="carModel"
                            type="text"
                            name="carModel"
                            className="input"
                            placeholder="مثال: تويوتا كورولا"
                            value={form.carModel}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="carPlate" className="field-label">رقم اللوحة</label>
                        <input
                            id="carPlate"
                            type="text"
                            name="carPlate"
                            className="input"
                            placeholder="رقم لوحة السيارة"
                            value={form.carPlate}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="carColor" className="field-label">لون السيارة (اختياري)</label>
                        <input
                            id="carColor"
                            type="text"
                            name="carColor"
                            className="input"
                            placeholder="مثال: أبيض"
                            value={form.carColor}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                    </div>

                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                        {submitting ? "جارٍ إنشاء الحساب…" : "إنشاء حساب"}
                    </button>
                </form>

                <p className="auth-card__footer">
                    لديك حساب بالفعل؟{" "}
                    <Link to="/login" className="auth-card__link">تسجيل الدخول</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;