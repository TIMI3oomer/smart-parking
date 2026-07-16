import { useMemo } from "react";
import SlotCard from "./SlotCard";

const ParkingGrid = ({ slots, onSlotClick }) => {
    const floors = useMemo(() => {
        const byFloor = new Map();

        for (const slot of slots || []) {
            const floorNumber = Number.isInteger(slot.floor) && slot.floor >= 1 ? slot.floor : 1;
            if (!byFloor.has(floorNumber)) byFloor.set(floorNumber, []);
            byFloor.get(floorNumber).push(slot);
        }

        return [...byFloor.entries()]
            .sort(([a], [b]) => a - b)
            .map(([floorNumber, floorSlots]) => ({
                floorNumber,
                slots: floorSlots.sort((a, b) =>
                    (a.slotNumber || "").localeCompare(b.slotNumber || "", undefined, { numeric: true })
                ),
            }));
    }, [slots]);

    if (!slots || slots.length === 0) {
        return <p className="page-subtitle">No parking slots yet.</p>;
    }

    return (
        <div className="garage">
            {floors.map(({ floorNumber, slots: floorSlots }) => (
                <section key={floorNumber} className="garage-floor" aria-label={`Floor ${floorNumber}`}>
                    <div className="garage-floor__sign">
                        <span className="garage-floor__badge">P{floorNumber}</span>
                        <span className="garage-floor__label">Floor {floorNumber}</span>
                    </div>
                    <div className="slot-grid">
                        {floorSlots.map((slot) => (
                            <SlotCard key={slot._id} slot={slot} onClick={onSlotClick} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default ParkingGrid;
