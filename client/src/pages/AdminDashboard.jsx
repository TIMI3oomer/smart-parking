import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { useAuth } from "../context/authContext";
import AdminParkingGrid from "../components/AdminParkingGrid";

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const createUserInitialState = { name: "", email: "", password: "", Phone: "" };
const createCarInitialState = { model: "", plate: "", color: "", owner: "" };

const AdminDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [cars, setCars] = useState([]);
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState(createUserInitialState);
    const [newCar, setNewCar] = useState(createCarInitialState);
    const [activeCreateForm, setActiveCreateForm] = useState("user");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.role === "admin";
    const currentUserId = user?._id ?? user?.id;

    const fetchData = useCallback(async () => {
        try {
            const [slotsRes, carsRes, usersRes] = await Promise.all([
                api.get("/slot"),
                api.get("/cars"),
                api.get("/users"),
            ]);
            setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
            setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setError("");
        } catch (err) {
            setError(getErrorMessage(err, "تعذر تحميل البيانات"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleCreateUser = async (e) => {
        e.preventDefault();

        const payload = {
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            password: newUser.password,
            Phone: newUser.Phone.trim(),
        };

        if (!payload.name || !payload.email || !payload.password || !payload.Phone) {
            setError("جميع حقول المستخدم مطلوبة");
            return;
        }
        if (payload.password.length < 8) {
            setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await api.post("/users", payload);
            setNewUser(createUserInitialState);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر إنشاء المستخدم"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateCar = async (e) => {
        e.preventDefault();

        const payload = {
            model: newCar.model.trim(),
            plate: newCar.plate.trim(),
            color: newCar.color.trim(),
            owner: newCar.owner,
        };

        if (!payload.model || !payload.plate || !payload.owner) {
            setError("الطراز ورقم اللوحة والمالك حقول مطلوبة");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            await api.post("/cars", payload);
            setNewCar(createCarInitialState);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر إنشاء السيارة"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssign = async (slot, carId) => {
        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/assign`, { carId });
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر تعيين السيارة"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReserve = async (slot) => {
        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/reserve`);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر حجز الموقف"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleFree = async (slot) => {
        if (!window.confirm(`هل تريد إخلاء الموقف ${slot.slotNumber}؟ سيتم إزالة السيارة أو الحجز المرتبط به.`)) return;

        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/free`);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر إخلاء الموقف"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCar = async (car) => {
        if (!window.confirm(`حذف السيارة ${car.plate}؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/cars/${car._id}`);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر حذف السيارة"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (person) => {
        if (person._id === currentUserId) {
            setError("لا يمكنك حذف حسابك الخاص");
            return;
        }
        if (!window.confirm(`حذف حساب ${person.name}؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/users/${person._id}`);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر حذف المستخدم"));
        } finally {
            setSubmitting(false);
        }
    };

    const parkedCarIds = useMemo(
        () => new Set(slots.filter((s) => s.currentCar).map((s) => s.currentCar._id)),
        [slots]
    );
    const availableCars = cars.filter((car) => !parkedCarIds.has(car._id));

    const createFormTitle = activeCreateForm === "user" ? "إضافة مستخدم" : "إضافة سيارة";

    if (!isAdmin) {
        return (
            <div className="page-shell stack">
                <p className="page-error">ليس لديك صلاحية لعرض هذه الصفحة.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-shell stack">
                <p>جارٍ تحميل لوحة التحكم…</p>
            </div>
        );
    }

    return (
        <div className="page-shell stack">
            <div className="page-header">
                <div>
                    <h2 className="page-title">لوحة تحكم المشرف — {user?.name}</h2>
                    <p className="page-subtitle">تعيين السيارات وإدارة الحجوزات — تخطيط الكراج نفسه ثابت.</p>
                </div>
                <div className="btn-row">
                    <button className="btn btn--ghost" onClick={() => navigate("/dashboard")}>
                        عرض لوحة المستخدم العادي
                    </button>
                    <button className="btn btn--logout" onClick={logout}>تسجيل الخروج</button>
                </div>
            </div>

            {error && (
                <p className="page-error" role="alert" aria-live="assertive">
                    {error}
                </p>
            )}

            <AdminParkingGrid
                slots={slots}
                cars={availableCars}
                onAssign={handleAssign}
                onReserve={handleReserve}
                onFree={handleFree}
                disabled={submitting}
            />

            <div className="admin-actions panel panel--padded">
                <div className="admin-actions__buttons" role="tablist" aria-label="ما تريد إضافته">
                    <button type="button" role="tab" aria-selected={activeCreateForm === "user"}
                        className={`btn ${activeCreateForm === "user" ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => setActiveCreateForm("user")}>
                        إضافة مستخدم
                    </button>
                    <button type="button" role="tab" aria-selected={activeCreateForm === "car"}
                        className={`btn ${activeCreateForm === "car" ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => setActiveCreateForm("car")}>
                        إضافة سيارة
                    </button>
                </div>

                <div className="admin-actions__form">
                    <h3 className="page-title" style={{ fontSize: "1.1rem" }}>{createFormTitle}</h3>

                    {activeCreateForm === "user" && (
                        <form onSubmit={handleCreateUser} className="admin-form-grid">
                            <div className="field-group">
                                <label htmlFor="user-name" className="field-label">الاسم الكامل</label>
                                <input id="user-name" className="input" value={newUser.name}
                                    onChange={(e) => setNewUser((c) => ({ ...c, name: e.target.value }))}
                                    disabled={submitting} />
                            </div>
                            <div className="field-group">
                                <label htmlFor="user-email" className="field-label">البريد الإلكتروني</label>
                                <input id="user-email" className="input" type="email" value={newUser.email}
                                    onChange={(e) => setNewUser((c) => ({ ...c, email: e.target.value }))}
                                    disabled={submitting} />
                            </div>
                            <div className="field-group">
                                <label htmlFor="user-password" className="field-label">كلمة المرور</label>
                                <input id="user-password" className="input" type="password" value={newUser.password}
                                    onChange={(e) => setNewUser((c) => ({ ...c, password: e.target.value }))}
                                    disabled={submitting} aria-describedby="user-password-hint" />
                                <span id="user-password-hint" className="field-hint">8 أحرف على الأقل</span>
                            </div>
                            <div className="field-group">
                                <label htmlFor="user-phone" className="field-label">رقم الهاتف</label>
                                <input id="user-phone" className="input" value={newUser.Phone}
                                    onChange={(e) => setNewUser((c) => ({ ...c, Phone: e.target.value }))}
                                    disabled={submitting} />
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={submitting}>
                                {submitting ? "جارٍ الإنشاء…" : "إنشاء المستخدم"}
                            </button>
                        </form>
                    )}

                    {activeCreateForm === "car" && (
                        <form onSubmit={handleCreateCar} className="admin-form-grid">
                            <div className="field-group">
                                <label htmlFor="car-model" className="field-label">نوع السيارة</label>
                                <input id="car-model" className="input" value={newCar.model}
                                    onChange={(e) => setNewCar((c) => ({ ...c, model: e.target.value }))}
                                    disabled={submitting} />
                            </div>
                            <div className="field-group">
                                <label htmlFor="car-plate" className="field-label">رقم اللوحة</label>
                                <input id="car-plate" className="input" value={newCar.plate}
                                    onChange={(e) => setNewCar((c) => ({ ...c, plate: e.target.value }))}
                                    disabled={submitting} />
                            </div>
                            <div className="field-group">
                                <label htmlFor="car-color" className="field-label">اللون</label>
                                <input id="car-color" className="input" value={newCar.color}
                                    onChange={(e) => setNewCar((c) => ({ ...c, color: e.target.value }))}
                                    disabled={submitting} />
                            </div>
                            <div className="field-group">
                                <label htmlFor="car-owner" className="field-label">المالك</label>
                                <select id="car-owner" className="select" value={newCar.owner}
                                    onChange={(e) => setNewCar((c) => ({ ...c, owner: e.target.value }))}
                                    disabled={submitting}>
                                    <option value="">اختر المالك</option>
                                    {users.map((person) => (
                                        <option key={person._id} value={person._id}>
                                            {person.name} ({person.Phone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={submitting}>
                                {submitting ? "جارٍ الإنشاء…" : "إنشاء السيارة"}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="panel panel--padded stack">
                <h3 className="page-title" style={{ fontSize: "1.1rem" }}>السيارات</h3>
                {cars.length === 0 ? (
                    <p className="page-subtitle">لا توجد سيارات بعد.</p>
                ) : (
                    <ul className="manage-list">
                        {cars.map((car) => (
                            <li key={car._id} className="manage-list__row">
                                <span className="manage-list__info">
                                    <strong>{car.plate}</strong> — {car.model}
                                    {car.color ? ` (${car.color})` : ""}
                                    {car.owner?.name ? ` · المالك: ${car.owner.name}` : ""}
                                </span>
                                <button type="button" className="btn btn--danger"
                                    onClick={() => handleDeleteCar(car)} disabled={submitting}>
                                    حذف
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="panel panel--padded stack">
                <h3 className="page-title" style={{ fontSize: "1.1rem" }}>المستخدمون</h3>
                {users.length === 0 ? (
                    <p className="page-subtitle">لا يوجد مستخدمون بعد.</p>
                ) : (
                    <ul className="manage-list">
                        {users.map((person) => {
                            const isSelf = person._id === currentUserId;
                            return (
                                <li key={person._id} className="manage-list__row">
                                    <span className="manage-list__info">
                                        <strong>{person.name}</strong> — {person.Phone}
                                        {person.role === "admin" ? " · مشرف" : ""}
                                        {isSelf ? " (أنت)" : ""}
                                    </span>
                                    <button type="button" className="btn btn--danger"
                                        onClick={() => handleDeleteUser(person)}
                                        disabled={submitting || isSelf}
                                        title={isSelf ? "لا يمكنك حذف حسابك الخاص" : undefined}>
                                        حذف
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
