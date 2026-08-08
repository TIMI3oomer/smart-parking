import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { useAuth } from "../context/authContext";
import AdminParkingGrid from "../components/AdminParkingGrid";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

// Slots list refetch interval so every admin sees assign/occupy/free actions
// made by anyone else without needing to manually reload the page.
const LIVE_REFRESH_MS = 4000;

const createPersonInitialState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    carModel: "",
    carPlate: "",
    carColor: "",
};

const AdminDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [cars, setCars] = useState([]);
    const [users, setUsers] = useState([]);
    const [newPerson, setNewPerson] = useState(createPersonInitialState);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: "user" | "car", entity }
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.role === "admin";
    const currentUserId = user?._id ?? user?.id;
    const isFetchingRef = useRef(false);

    const fetchData = useCallback(async ({ silent } = {}) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
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
            if (!silent) {
                setError(getErrorMessage(err, "تعذر تحميل البيانات"));
            }
        } finally {
            if (!silent) setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    // Live refresh: poll in the background so reservations/occupancy made by
    // other users show up here without a manual reload.
    useEffect(() => {
        const interval = setInterval(() => {
            void fetchData({ silent: true });
        }, LIVE_REFRESH_MS);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleCreatePerson = async (e) => {
        e.preventDefault();

        const payload = {
            name: newPerson.name.trim(),
            email: newPerson.email.trim(),
            password: newPerson.password,
            phone: newPerson.phone.trim(),
            carModel: newPerson.carModel.trim(),
            carPlate: newPerson.carPlate.trim(),
            carColor: newPerson.carColor.trim(),
        };

        if (
            !payload.name ||
            !payload.email ||
            !payload.password ||
            !payload.phone ||
            !payload.carModel ||
            !payload.carPlate
        ) {
            setError("جميع الحقول مطلوبة، بما في ذلك بيانات السيارة (الطراز واللوحة)");
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
            setNewPerson(createPersonInitialState);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر إنشاء المستخدم"));
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

    const confirmDeleteCar = async () => {
        const car = deleteTarget?.entity;
        if (!car) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/cars/${car._id}`);
            setDeleteTarget(null);
            await fetchData();
        } catch (err) {
            setError(getErrorMessage(err, "تعذر حذف السيارة"));
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteUser = async () => {
        const person = deleteTarget?.entity;
        if (!person) return;

        setSubmitting(true);
        setError("");
        try {
            await api.delete(`/users/${person._id}`);
            setDeleteTarget(null);
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
                onFree={handleFree}
                disabled={submitting}
            />

            <div className="admin-actions panel panel--padded">
                <div className="admin-actions__form">
                    <h3 className="page-title" style={{ fontSize: "1.1rem" }}>إضافة موظف وسيارته</h3>
                    <p className="page-subtitle">كل موظف يمتلك سيارة واحدة فقط، لذا تُنشأان معًا دفعة واحدة.</p>

                    <form onSubmit={handleCreatePerson} className="admin-form-grid">
                        <div className="field-group">
                            <label htmlFor="user-name" className="field-label">الاسم الكامل</label>
                            <input id="user-name" className="input" value={newPerson.name}
                                onChange={(e) => setNewPerson((c) => ({ ...c, name: e.target.value }))}
                                disabled={submitting} />
                        </div>
                        <div className="field-group">
                            <label htmlFor="user-email" className="field-label">البريد الإلكتروني</label>
                            <input id="user-email" className="input" type="email" value={newPerson.email}
                                onChange={(e) => setNewPerson((c) => ({ ...c, email: e.target.value }))}
                                disabled={submitting} />
                        </div>
                        <div className="field-group">
                            <label htmlFor="user-password" className="field-label">كلمة المرور</label>
                            <input id="user-password" className="input" type="password" value={newPerson.password}
                                onChange={(e) => setNewPerson((c) => ({ ...c, password: e.target.value }))}
                                disabled={submitting} aria-describedby="user-password-hint" />
                            <span id="user-password-hint" className="field-hint field-hint--floating">8 أحرف على الأقل</span>
                        </div>
                        <div className="field-group">
                            <label htmlFor="user-phone" className="field-label">رقم الهاتف</label>
                            <input id="user-phone" className="input" value={newPerson.phone}
                                onChange={(e) => setNewPerson((c) => ({ ...c, phone: e.target.value }))}
                                disabled={submitting} />
                        </div>
                        <div className="field-group">
                            <label htmlFor="car-model" className="field-label">طراز السيارة</label>
                            <input id="car-model" className="input" value={newPerson.carModel}
                                onChange={(e) => setNewPerson((c) => ({ ...c, carModel: e.target.value }))}
                                disabled={submitting} />
                        </div>
                        <div className="field-group">
                            <label htmlFor="car-plate" className="field-label">رقم اللوحة</label>
                            <input id="car-plate" className="input" value={newPerson.carPlate}
                                onChange={(e) => setNewPerson((c) => ({ ...c, carPlate: e.target.value }))}
                                disabled={submitting} />
                        </div>
                        <div className="field-group">
                            <label htmlFor="car-color" className="field-label">لون السيارة (اختياري)</label>
                            <input id="car-color" className="input" value={newPerson.carColor}
                                onChange={(e) => setNewPerson((c) => ({ ...c, carColor: e.target.value }))}
                                disabled={submitting} />
                        </div>
                        <button className="btn btn--primary" type="submit" disabled={submitting}>
                            {submitting ? "جارٍ الإنشاء…" : "إنشاء الموظف والسيارة"}
                        </button>
                    </form>
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
                                    onClick={() => setDeleteTarget({ type: "car", entity: car })}
                                    disabled={submitting}>
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
                                        <strong>{person.name}</strong> — {person.phone}
                                        {person.role === "admin" ? " · مشرف" : ""}
                                        {isSelf ? " (أنت)" : ""}
                                    </span>
                                    <button type="button" className="btn btn--danger"
                                        onClick={() => setDeleteTarget({ type: "user", entity: person })}
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

            {deleteTarget?.type === "car" && (
                <ConfirmDeleteModal
                    title={`حذف السيارة ${deleteTarget.entity.plate}`}
                    description="لا يمكن التراجع عن هذا الإجراء."
                    expectedValue={deleteTarget.entity.plate}
                    confirmLabel="حذف السيارة"
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDeleteCar}
                    disabled={submitting}
                />
            )}

            {deleteTarget?.type === "user" && (
                <ConfirmDeleteModal
                    title={`حذف حساب ${deleteTarget.entity.name}`}
                    description="سيتم حذف سيارته المسجلة أيضًا. لا يمكن التراجع عن هذا الإجراء."
                    expectedValue={deleteTarget.entity.phone}
                    confirmLabel="حذف المستخدم وسيارته"
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDeleteUser}
                    disabled={submitting}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
