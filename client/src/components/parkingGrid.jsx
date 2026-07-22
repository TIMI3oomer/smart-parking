import SlotCard from "./slotCard";
import "./parkingGrid.css";

const ParkingGrid = ({ slots, onSlotClick }) => {
    if (!slots || slots.length === 0) {
        return <p className="page-subtitle">لا توجد مواقف سيارات بعد.</p>;
    }

    const sortedSlots = [...slots].sort((a, b) =>
        (a.slotNumber || "").localeCompare(b.slotNumber || "", undefined, { numeric: true })
    );

    return (
        <div className="slot-grid">
            {sortedSlots.map((slot) => (
                <SlotCard key={slot._id} slot={slot} onClick={onSlotClick} />
            ))}
        </div>
    );
};

export default ParkingGrid;
