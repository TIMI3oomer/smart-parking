import { useMemo } from "react";
import SlotCard from "./slotCard";
import "./parkingGrid.css";
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
            .map(([floorNumber, floorSlots]) => {
                const bySection = new Map();
                for (const slot of floorSlots) {
                    const sectionName = slot.section?.trim() || "Main Area";
                    if (!bySection.has(sectionName)) bySection.set(sectionName, []);
                    bySection.get(sectionName).push(slot);
                }

                return {
                    floorNumber,
                    sections: [...bySection.entries()]
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([sectionName, sectionSlots]) => ({
                            sectionName,
                            slots: sectionSlots.sort((a, b) =>
                                (a.slotNumber || "").localeCompare(b.slotNumber || "", undefined, { numeric: true })
                            ),
                        })),
                };
            });
    }, [slots]);

    if (!slots || slots.length === 0) {
        return <p className="page-subtitle">No parking slots yet.</p>;
    }

    return (
        <div className="garage">
            {floors.map(({ floorNumber, sections }) => (
                <section key={floorNumber} className="garage-floor" aria-label={`Floor ${floorNumber}`}>
                    <div className="garage-floor__sign">
                        <span className="garage-floor__badge">P{floorNumber}</span>
                        <span className="garage-floor__label">Floor {floorNumber}</span>
                    </div>
                    <div className="garage-sections">
                        {sections.map(({ sectionName, slots: sectionSlots }) => (
                            <div key={sectionName} className="garage-section">
                                <h3 className="garage-section__label">{sectionName}</h3>
                                <div className="slot-grid">
                                    {sectionSlots.map((slot) => (
                                        <SlotCard key={slot._id} slot={slot} onClick={onSlotClick} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default ParkingGrid;
