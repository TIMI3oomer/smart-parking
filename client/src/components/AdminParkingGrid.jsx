import { useState } from "react";
import AdminSlotCard from "./AdminSlotCard";
import "./parkingGrid.css";

const AdminParkingGrid = ({ slots, cars, onAssign, onReserve, onFree, onDelete }) => {
    const [openId, setOpenId] = useState(null);

    const handleToggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    if (!slots || slots.length === 0) {
        return <p className="page-subtitle">لا توجد مواقف بعد.</p>;
    }

    return (
        <div className="parking-grid">
            {slots.map((slot) => (
                <AdminSlotCard
                    key={slot._id}
                    slot={slot}
                    cars={cars}
                    isOpen={openId === slot._id}
                    onToggle={handleToggle}
                    onAssign={(s, carId) => {
                        onAssign(s, carId);
                        setOpenId(null);
                    }}
                    onReserve={(s) => {
                        onReserve(s);
                        setOpenId(null);
                    }}
                    onFree={(s) => {
                        onFree(s);
                        setOpenId(null);
                    }}
                    onDelete={(s) => {
                        onDelete(s);
                        setOpenId(null);
                    }}
                />
            ))}
        </div>
    );
};

export default AdminParkingGrid;
