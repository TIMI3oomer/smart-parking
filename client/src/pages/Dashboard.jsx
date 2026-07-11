import { useEffect,useState } from "react";
import api from "../service/api"
import { useAuth } from "../context/authContext";
import ParkingGrid from "../components/parkingGrid";
import CarInfo from "../components/carInfo";

const Dashboard = () => {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [error, setError] = useState("");
    const { user, logout } = useAuth();

    useEffect(() => {
        const loadSlots = async () => {
            try {
                const res = await api.get("/slot");
                setSlots(res.data);
            } catch {
                setError("Failed to load parking slots");
            }
        };

        void loadSlots();
    }, []);

    const handleReserve = async (slot) => {
        try {
            await api.put(`/slot/${slot._id}`, {
                status: "reserved",
                reservedFor: user?._id,
            });
            setSelectedSlot(null);
            void (async () => {
                const res = await api.get("/slot");
                setSlots(res.data);
            })();
        } catch (err) {
            setError(err.response?.data?.message || "Could not reserve slot");
        }
    };

    const handleFree = async (slot) => {
        try {
            await api.put(`/slot/${slot._id}/free`);
            setSelectedSlot(null);
            void (async () => {
                const res = await api.get("/slot");
                setSlots(res.data);
            })();
        } catch (err) {
            setError(err.response?.data?.message || "Could not free slot");
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Welcome, {user?.name}</h2>
                    <p className="page-subtitle">Monitor your reserved and occupied parking slots.</p>
                </div>
                <button className="btn btn--ghost" onClick={logout}>Logout</button>
            </div>
            {error && <p className="page-error">{error}</p>}
            <ParkingGrid slots={slots} onSlotClick={setSelectedSlot}/>

            <CarInfo
                slot={selectedSlot}
                onClose={() => setSelectedSlot(null)}
                onReserve={handleReserve}
                onFree={handleFree}
                currentUserId={user?.id}
            />
        </div>
    );
};

export default Dashboard;
