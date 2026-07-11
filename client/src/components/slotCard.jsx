const SlotCard = ({ slot, onClick }) => {
    return (
        <div
            onClick={() => onClick(slot)}
            className={`slot-card slot-card--${slot.status || "empty"}`}
        >
            <strong className="slot-card__number">{slot.slotNumber}</strong>
            <p className="slot-card__status">
                {slot.status}
            </p>
        </div>
    );
};

export default SlotCard ;