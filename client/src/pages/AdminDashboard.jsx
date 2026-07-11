import { useEffect, useState } from "react";
import api from "../service/api";
import { useAuth } from "../context/authContext";
import ParkingGrid from "../components/parkingGrid";

const AdminDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [cars, setCars] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [newSlotNumber, setNewSlotNumber] = useState("");
    const [assignCarId, setAssignCarId] = useState("");
    const [error, setError] = useState("");
    const { user, logout } = useAuth();

    const fetchData = async () => {
        try {
            const [slotsRes, carsRes] = await Promise.all([
                api.get("/slot"),
                api.get("/cars"),
            ]);
            setSlots(slotsRes.data);
            setCars(carsRes.data);
        } catch {
            setError("Failed to load data");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [slotsRes, carsRes] = await Promise.all([
                    api.get("/slot"),
                    api.get("/cars"),
                ]);
                setSlots(slotsRes.data);
                setCars(carsRes.data);
            } catch {
                setError("Failed to load data");
            }
        };

        void loadData();
    }, []);

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post("/slot", { slotNumber: newSlotNumber });
            setNewSlotNumber("");
            void fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Could not create slot");
        }
    };

    const handleAssign = async () => {
        if (!assignCarId || !selectedSlot) return;
        try {
            await api.put(`/slot/${selectedSlot._id}/assign`, { carId: assignCarId });
            setSelectedSlot(null);
            setAssignCarId("");
            void fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Could not assign car");
        }
    };

    const handleFree = async (slot) => {
        try {
            await api.put(`/slot/${slot._id}/free`);
            setSelectedSlot(null);
            void fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Could not free slot");
        }
    };

    return (
        <div className="page-shell stack">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Admin Dashboard — {user?.name}</h2>
                    <p className="page-subtitle">Create slots, assign cars, and clear spaces.</p>
                </div>
                <button className="btn btn--ghost" onClick={logout}>Logout</button>
            </div>

            {error && <p className="page-error">{error}</p>}

            <form onSubmit={handleCreateSlot} className="slot-form panel panel--padded">
                <input
                    className="input"
                    placeholder="New slot number (e.g. A1)"
                    value={newSlotNumber}
                    onChange={(e) => setNewSlotNumber(e.target.value)}
                />
                <button className="btn btn--primary" type="submit">Create Slot</button>
            </form>

            <ParkingGrid slots={slots} onSlotClick={setSelectedSlot} />

            {selectedSlot && (
                <div className="panel panel--padded">
                    <h4 className="page-title" style={{ fontSize: "1.1rem" }}>Manage Slot {selectedSlot.slotNumber}</h4>

                    <select
                        className="select"
                        value={assignCarId}
                        onChange={(e) => setAssignCarId(e.target.value)}
                    >
                        <option value="">-- Select a car --</option>
                        {cars.map((car) => (
                            <option key={car._id} value={car._id}>
                                {car.plate} ({car.type})
                            </option>
                        ))}
                    </select>
                    <div className="slot-actions">
                        <button className="btn btn--primary" onClick={handleAssign}>Assign Car</button>
                        <button className="btn btn--danger" onClick={() => handleFree(selectedSlot)}>Free Slot</button>
                        <button className="btn btn--ghost" onClick={() => setSelectedSlot(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;