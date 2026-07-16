import { useCallback, useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "../context/authContext";
import ParkingGrid from "../components/parkingGrid";
import CarInfo from "../components/carInfo";

const Dashboard = () => {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user, logout } = useAuth();

    const loadSlots = useCallback(async () => {
        try {
            const res = await api.get("/slot");
            setSlots(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch {
            setError("Failed to load parking slots");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSlots();
    }, [loadSlots]);

    const handleReserve = async (slot) => {
        setSubmitting(true);
        setError("");
        try {
            await api.put(`/slot/${slot._id}/reserve`);
            setSelectedSlot(null);
            await loadSlots();
        } catch (err) {
            setError(err.response?.data?.message || "Could not reserve slot");
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
            setError(err.response?.data?.message || "Could not free slot");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-shell">
                <p>Loading…</p>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Welcome, {user?.name}</h2>
                    <p className="page-subtitle">Monitor your reserved and occupied parking slots.</p>
                </div>
                <button className="btn btn--ghost" onClick={logout}>Logout</button>
            </div>
            {error && <p className="page-error" role="alert">{error}</p>}
            <ParkingGrid slots={slots} onSlotClick={setSelectedSlot} />

            <CarInfo
                slot={selectedSlot}
                onClose={() => setSelectedSlot(null)}
                onReserve={handleReserve}
                onFree={handleFree}
                currentUserId={user?._id ?? user?.id}
                disabled={submitting}
            />
        </div>
    );
};

export default Dashboard;
