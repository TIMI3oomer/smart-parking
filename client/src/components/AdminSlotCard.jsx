import { useState } from "react";
import "./slotCard.css";
import "./AdminSlotCard.css";

const AdminSlotCard = ({ slot, cars, isOpen, onToggle, onAssign, onReserve, onFree, onDelete }) => {
    const [selectedCarId, setSelectedCarId] = useState("");

    const isOccupied = slot.status === "occupied";
    const isReserved = slot.status === "reserved";
    const car = slot.currentCar;
    const statusClass = isOccupied ? "occupied" : isReserved ? "reserved" : "available";

    const handleAssign = () => {
        if (!selectedCarId) return;
        onAssign(slot, selectedCarId);
        setSelectedCarId("");
    };

    return (
        <div className="slot-wrapper">
            <button
                className={`slot-square ${statusClass} ${isOpen ? "pinned" : ""}`}
                onClick={() => onToggle(slot._id)}
                aria-label={`إدارة الموقف ${slot.slotNumber}`}
            >
                {slot.slotNumber}
            </button>

            {isOpen && (
                <div className="slot-popup admin-popup">
                    <div className="slot-popup-header">
                        <span>الموقف {slot.slotNumber}</span>
                        <button className="popup-close" onClick={() => onToggle(slot._id)}>
                            ×
                        </button>
                    </div>

                    {isOccupied && car ? (
                        <>
                            <p className="popup-line strong">{car.model} · {car.plate}</p>
                            <p className="popup-line muted">{car.owner?.name}</p>
                            <button className="popup-action" onClick={() => onFree(slot)}>
                                إخلاء الموقف
                            </button>
                        </>
                    ) : isReserved ? (
                        <>
                            <p className="popup-line strong">محجوز</p>
                            {slot.reservedFor?.name && (
                                <p className="popup-line muted">محجوز لـ: {slot.reservedFor.name}</p>
                            )}
                            <select
                                value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)}
                                className="popup-select"
                            >
                                <option value="">اختر سيارة...</option>
                                {cars.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.plate} — {c.model}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="popup-action"
                                onClick={handleAssign}
                                disabled={!selectedCarId}
                            >
                                تعيين السيارة
                            </button>
                            <button className="popup-action popup-action--free" onClick={() => onFree(slot)}>
                                إلغاء الحجز
                            </button>
                        </>
                    ) : (
                        <>
                            <select
                                value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)}
                                className="popup-select"
                            >
                                <option value="">اختر سيارة...</option>
                                {cars.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.plate} — {c.model}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="popup-action"
                                onClick={handleAssign}
                                disabled={!selectedCarId}
                            >
                                تعيين السيارة
                            </button>
                            <button className="popup-action popup-action--reserve" onClick={() => onReserve(slot)}>
                                حجز الموقف
                            </button>
                        </>
                    )}

                    <button className="popup-action popup-action--delete" onClick={() => onDelete(slot)}>
                        حذف الموقف
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminSlotCard;
