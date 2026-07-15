const matchesCurrentUser = (entity, currentUserId) => {
    if (!entity || !currentUserId) return false;
    const entityId = entity._id ?? entity.id;
    return String(entityId) === String(currentUserId);
};

const CarInfo = ({ slot, onClose, onReserve, onFree, currentUserId }) => {
    if (!slot) return null;

    const car = slot.currentCar;
    const isMine =
        matchesCurrentUser(car?.owner, currentUserId) ||
        matchesCurrentUser(slot.reservedFor, currentUserId);

    return (
        <div className="slot-modal__backdrop">
            <div className="slot-modal__content">
                <h3 className="slot-modal__title">Slot: {slot.slotNumber}</h3>
                <p className="slot-modal__meta">Status: {slot.status}</p>

                {car ? (
                    <>
                        <p className="slot-modal__section"><strong>Car:</strong> {car.type} ({car.color})</p>
                        <p className="slot-modal__section"><strong>Plate:</strong> {car.plate}</p>
                        <p className="slot-modal__section"><strong>Owner:</strong> {car.owner?.name}</p>
                        <p className="slot-modal__section"><strong>Phone:</strong> {car.owner?.Phone}</p>
                    </>
                ) : slot.reservedFor ? (
                    <p className="slot-modal__section"><strong>Reserved for:</strong> {slot.reservedFor.name}</p>
                ) : (
                    <p className="slot-modal__section">This slot is empty.</p>
                )}

                <div className="slot-actions">
                    {slot.status === "empty" && (
                        <button className="btn btn--primary" onClick={() => onReserve(slot)}>
                            Reserve this slot
                        </button>
                    )}
                    {isMine && (
                        <button className="btn btn--danger" onClick={() => onFree(slot)}>
                            Free my slot
                        </button>
                    )}
                    <button className="btn btn--ghost" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarInfo;