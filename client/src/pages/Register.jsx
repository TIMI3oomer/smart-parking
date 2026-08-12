import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../service/api";

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
    const [info, setInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [phoneCode, setPhoneCode] = useState("");
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [codeRequested, setCodeRequested] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });

        if (name === "phone") {
            setPhoneVerified(false);
            setCodeRequested(false);
            setPhoneCode("");
            setInfo("");
        }
    };

    const handleSendPhoneCode = async () => {
        const phone = form.phone.trim();
        if (!phone) {
            setError("يرجى إدخال رقم الهاتف أولًا");
            return;
        }

        setSendingCode(true);
        setError("");
        setInfo("");

        try {
            const res = await api.post("/auth/register/request-phone-verification", { phone });
            setCodeRequested(true);
            if (res.data?.devCode) {
                setInfo(`تم إرسال الرمز. (بيئة تطوير) رمز التحقق: ${res.data.devCode}`);
            } else {
                setInfo("تم إرسال رمز التحقق عبر رسالة نصية.");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "تعذر إرسال رمز التحقق");
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyPhoneCode = async () => {
        const phone = form.phone.trim();
        const code = phoneCode.trim();

        if (!phone || !code) {
            setError("يرجى إدخال رقم الهاتف ورمز التحقق");
            return;
        }

        setVerifyingCode(true);
        setError("");
        setInfo("");

        try {
            await api.post("/auth/register/verify-phone", { phone, code });
            setPhoneVerified(true);
            setInfo("تم التحقق من رقم الهاتف بنجاح.");
        } catch (err) {
            setPhoneVerified(false);
            setError(err?.response?.data?.message || "فشل التحقق من رمز الهاتف");
        } finally {
            setVerifyingCode(false);
        }
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

        if (!phoneVerified) {
            setError("يرجى التحقق من رقم الهاتف قبل إنشاء الحساب");
            return;
        }

        setSubmitting(true);
        setError("");
        setInfo("");

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
                {info && (
                    <p className="page-subtitle" role="status" aria-live="polite">
                        {info}
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
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={handleSendPhoneCode}
                                disabled={submitting || sendingCode || verifyingCode || phoneVerified}
                            >
                                {sendingCode ? "جارٍ إرسال الرمز…" : "إرسال رمز التحقق"}
                            </button>
                            {phoneVerified && (
                                <span className="field-hint" style={{ color: "green", alignSelf: "center" }}>
                                    تم التحقق من الرقم
                                </span>
                            )}
                        </div>
                    </div>

                    {codeRequested && !phoneVerified && (
                        <div className="field-group">
                            <label htmlFor="phoneCode" className="field-label">رمز التحقق</label>
                            <input
                                id="phoneCode"
                                type="text"
                                name="phoneCode"
                                className="input"
                                placeholder="أدخل رمز التحقق المرسل"
                                value={phoneCode}
                                onChange={(e) => setPhoneCode(e.target.value)}
                                disabled={submitting || verifyingCode}
                            />
                            <button
                                type="button"
                                className="btn"
                                onClick={handleVerifyPhoneCode}
                                disabled={submitting || verifyingCode || !phoneCode.trim()}
                                style={{ marginTop: "0.5rem" }}
                            >
                                {verifyingCode ? "جارٍ التحقق…" : "تأكيد رمز التحقق"}
                            </button>
                        </div>
                    )}

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