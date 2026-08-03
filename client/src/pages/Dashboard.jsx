import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { useAuth } from "../context/authContext";
import ParkingGrid from "../components/parkingGrid";
import CarInfo from "../components/carInfo";

// How often to silently refetch slot state in the background, so a
// reservation/occupancy made by someone else shows up here without the user
// needing to manually reload the page.
const LIVE_REFRESH_MS = 4000;

const Dashboard = () => {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === "admin";
    const isFetchingRef = useRef(false);

    const loadSlots = useCallback(async ({ silent } = {}) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const res = await api.get("/slot");
            setSlots(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch {
            if (!silent) setError("تعذر تحميل مواقف السيارات");
        } finally {
            if (!silent) setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        void loadSlots();
    }, [loadSlots]);

    useEffect(() => {
        const interval = setInterval(() => {
            void loadSlots({ silent: true });
        }, LIVE_REFRESH_MS);
        return () => clearInterval(interval);
    }, [loadSlots]);

    const handleOccupy = async (slot) => {
        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/occupy`);
            setSelectedSlot(null);
            await loadSlots();
        } catch (err) {
            setError(err.response?.data?.message || "تعذر إشغال الموقف");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFree = async (slot) => {
        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/free`);
            setSelectedSlot(null);
            await loadSlots();
        } catch (err) {
            setError(err.response?.data?.message || "تعذر إخلاء الموقف");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-shell">
                <p>جارٍ التحميل…</p>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h2 className="page-title">أهلًا، {user?.name}</h2>
                    <p className="page-subtitle">تابع مواقف السيارات المحجوزة والمشغولة.</p>
                </div>
                <div className="btn-row">
                    {isAdmin && (
                        <button className="btn btn--ghost" onClick={() => navigate("/admin")}>
                            لوحة تحكم المشرف
                        </button>
                    )}
                    <button className="btn btn--logout" onClick={logout}>تسجيل الخروج</button>
                </div>
            </div>
            {error && <p className="page-error" role="alert">{error}</p>}
            <ParkingGrid slots={slots} onSlotClick={setSelectedSlot} />

            <CarInfo
                slot={selectedSlot}
                onClose={() => setSelectedSlot(null)}
                onOccupy={handleOccupy}
                onFree={handleFree}
                currentUserId={user?._id ?? user?.id}
                disabled={submitting}
            />
        </div>
    );
};

export default Dashboard;
