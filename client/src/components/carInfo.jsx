const matchesCurrentUser = (entity, currentUserId) => {
    if (!entity || !currentUserId) return false;
    const entityId = entity._id ?? entity.id;
    return String(entityId) === String(currentUserId);
};

const STATUS_LABELS = {
    empty: "شاغر",
    reserved: "محجوز",
    occupied: "مشغول",
};

const CATEGORY_LABELS = {
    ceo: "★ موقف المدير العام",
    blocking: "⚠ هذا الموقف قد يحجب موقفًا آخر",
};

const CarInfo = ({ slot, onClose, onOccupy, onFree, currentUserId, disabled }) => {
    if (!slot) return null;

    const car = slot.currentCar;
    const isMine =
        matchesCurrentUser(car?.owner, currentUserId) ||
        matchesCurrentUser(slot.reservedFor, currentUserId);
    const categoryLabel = CATEGORY_LABELS[slot.category];

    return (
        <div className="slot-modal__backdrop">
            <div className="slot-modal__content">
                <h3 className="slot-modal__title">الموقف: {slot.slotNumber}</h3>
                <p className="slot-modal__meta">الحالة: {STATUS_LABELS[slot.status] || slot.status}</p>
                {categoryLabel && (
                    <p className="slot-modal__section slot-modal__category">{categoryLabel}</p>
                )}

                {car ? (
                    <>
                        <p className="slot-modal__section"><strong>السيارة:</strong> {car.model} ({car.color})</p>
                        <p className="slot-modal__section"><strong>اللوحة:</strong> {car.plate}</p>
                        <p className="slot-modal__section"><strong>المالك:</strong> {car.owner?.name}</p>
                        {car.owner?.Phone && (
                            <p className="slot-modal__section">
                                <strong>الهاتف:</strong> <a href={`tel:${car.owner.Phone}`}>{car.owner.Phone}</a>
                            </p>
                        )}
                    </>
                ) : slot.status === "reserved" && slot.reservedFor ? (
                    <p className="slot-modal__section"><strong>محجوز لـ:</strong> {slot.reservedFor.name}</p>
                ) : slot.status === "occupied" && slot.reservedFor ? (
                    <p className="slot-modal__section"><strong>مشغول بواسطة:</strong> {slot.reservedFor.name}</p>
                ) : (
                    <p className="slot-modal__section">هذا الموقف شاغر.</p>
                )}

                <div className="slot-actions">
                    {slot.status === "empty" && (
                        <button className="btn btn--primary" onClick={() => onOccupy(slot)} disabled={disabled}>
                            إشغال هذا الموقف
                        </button>
                    )}
                    {isMine && (
                        <button className="btn btn--danger" onClick={() => onFree(slot)} disabled={disabled}>
                            إخلاء موقفي
                        </button>
                    )}
                    <button className="btn btn--ghost" onClick={onClose}>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarInfo;
