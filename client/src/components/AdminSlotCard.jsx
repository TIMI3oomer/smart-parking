import { useState } from "react";
import "./slotCard.css";
import "./AdminSlotCard.css";

const CATEGORY_META = {
    ceo: { label: "موقف المدير العام", badgeClass: "badge--ceo" },
    blocking: { label: "قد يحجب موقفًا آخر", badgeClass: "badge--blocking" },
};

const AdminSlotCard = ({ slot, cars, isOpen, onToggle, onAssign, onReserve, onFree, onDelete, onSetCategory }) => {
    const [selectedCarId, setSelectedCarId] = useState("");

    const isOccupied = slot.status === "occupied";
    const isReserved = slot.status === "reserved";
    const car = slot.currentCar;
    const statusClass = isOccupied ? "occupied" : isReserved ? "reserved" : "available";
    const category = slot.category || "normal";
    const categoryMeta = CATEGORY_META[category];

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
                {categoryMeta && (
                    <span className={`slot-badge ${categoryMeta.badgeClass}`} aria-hidden="true">
                        {category === "ceo" ? "★" : "⚠"}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="slot-popup admin-popup">
                    <div className="slot-popup-header">
                        <span>الموقف {slot.slotNumber}</span>
                        <button className="popup-close" onClick={() => onToggle(slot._id)}>
                            ×
                        </button>
                    </div>

                    {categoryMeta && (
                        <p className={`popup-line popup-tag ${categoryMeta.badgeClass}`}>
                            {categoryMeta.label}
                        </p>
                    )}

                    {isOccupied && car ? (
                        <>
                            <p className="popup-line strong">{car.model} · {car.plate}</p>
                            <p className="popup-line muted">{car.owner?.name}</p>
                            {car.owner?.Phone && (
                                <a className="popup-line popup-call" href={`tel:${car.owner.Phone}`}>
                                    📞 اتصال: {car.owner.Phone}
                                </a>
                            )}
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

                    <label className="popup-line popup-category-label" htmlFor={`category-${slot._id}`}>
                        نوع الموقف
                    </label>
                    <select
                        id={`category-${slot._id}`}
                        className="popup-select"
                        value={category}
                        onChange={(e) => onSetCategory(slot, e.target.value)}
                    >
                        <option value="normal">عادي</option>
                        <option value="ceo">موقف المدير العام</option>
                        <option value="blocking">قد يحجب موقفًا آخر</option>
                    </select>

                    <button className="popup-action popup-action--delete" onClick={() => onDelete(slot)}>
                        حذف الموقف
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminSlotCard;
