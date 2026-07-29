import { useState } from "react";

const STATUS_LABELS = {
    empty: "شاغر",
    reserved: "محجوز",
    occupied: "مشغول",
};

const CATEGORY_LABELS = {
    ceo: "★ موقف المدير العام",
    blocking: "⚠ هذا الموقف قد يحجب موقفًا آخر",
};
const AdminSlotModal = ({ slot, cars, onClose, onAssign, onReserve, onFree, disabled }) => {
    const [selectedCarId, setSelectedCarId] = useState("");

    if (!slot) return null;

    const status = slot.status || "empty";
    const isOccupied = status === "occupied";
    const isReserved = status === "reserved";
    const car = slot.currentCar;
    const categoryLabel = CATEGORY_LABELS[slot.category];

    const handleAssign = () => {
        if (!selectedCarId) return;
        onAssign(slot, selectedCarId);
        setSelectedCarId("");
    };

    return (
        <div className="slot-modal__backdrop">
            <div className="slot-modal__content">
                <h3 className="slot-modal__title">الموقف: {slot.slotNumber}</h3>
                <p className="slot-modal__meta">الحالة: {STATUS_LABELS[status] || status}</p>
                {categoryLabel && (
                    <p className="slot-modal__section slot-modal__category">{categoryLabel}</p>
                )}

                {isOccupied && car ? (
                    <>
                        <p className="slot-modal__section"><strong>السيارة:</strong> {car.model} ({car.color})</p>
                        <p className="slot-modal__section"><strong>اللوحة:</strong> {car.plate}</p>
                        <p className="slot-modal__section"><strong>المالك:</strong> {car.owner?.name}</p>
                        {car.owner?.Phone && (
                            <p className="slot-modal__section">
                                <strong>الهاتف:</strong> <a href={`tel:${car.owner.Phone}`}>{car.owner.Phone}</a>
                            </p>
                        )}
                        <div className="slot-actions">
                            <button className="btn btn--danger" onClick={() => onFree(slot)} disabled={disabled}>
                                إخلاء الموقف
                            </button>
                        </div>
                    </>
                ) : isReserved ? (
                    <>
                        {slot.reservedFor?.name && (
                            <p className="slot-modal__section"><strong>محجوز لـ:</strong> {slot.reservedFor.name}</p>
                        )}
                        <div className="field-group">
                            <label htmlFor="assign-car" className="field-label">تعيين سيارة لهذا الموقف</label>
                            <select
                                id="assign-car" className="select" value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)} disabled={disabled}
                            >
                                <option value="">اختر سيارة...</option>
                                {cars.map((c) => (
                                    <option key={c._id} value={c._id}>{c.plate} — {c.model}</option>
                                ))}
                            </select>
                        </div>
                        <div className="slot-actions">
                            <button className="btn btn--primary" onClick={handleAssign} disabled={disabled || !selectedCarId}>
                                تعيين السيارة
                            </button>
                            <button className="btn btn--danger" onClick={() => onFree(slot)} disabled={disabled}>
                                إلغاء الحجز
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="slot-modal__section">هذا الموقف شاغر.</p>
                        <div className="field-group">
                            <label htmlFor="assign-car" className="field-label">تعيين سيارة لهذا الموقف</label>
                            <select
                                id="assign-car" className="select" value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)} disabled={disabled}
                            >
                                <option value="">اختر سيارة...</option>
                                {cars.map((c) => (
                                    <option key={c._id} value={c._id}>{c.plate} — {c.model}</option>
                                ))}
                            </select>
                        </div>
                        <div className="slot-actions">
                            <button className="btn btn--primary" onClick={handleAssign} disabled={disabled || !selectedCarId}>
                                تعيين السيارة
                            </button>
                            <button className="btn btn--ghost" onClick={() => onReserve(slot)} disabled={disabled}>
                                حجز الموقف
                            </button>
                        </div>
                    </>
                )}

                <div className="slot-actions">
                    <button className="btn btn--ghost" onClick={onClose}>إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default AdminSlotModal;
