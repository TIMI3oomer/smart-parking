import { useState } from "react";
import GarageFloorPlan from "./GarageFloorPlan";
import AdminSlotModal from "./AdminSlotModal";

const AdminParkingGrid = ({ slots, cars, onAssign, onReserve, onFree, disabled }) => {
    const [selectedSlot, setSelectedSlot] = useState(null);

    const liveSelectedSlot = selectedSlot
        ? slots.find((s) => s._id === selectedSlot._id) || null
        : null;

    return (
        <>
            <GarageFloorPlan
                slots={slots}
                emptyMessage="لا توجد مواقف بعد. شغّل seed:layout على السيرفر لإنشاء تخطيط الكراج مرة واحدة."
                onSlotClick={setSelectedSlot}
            />

            <AdminSlotModal
                slot={liveSelectedSlot}
                cars={cars}
                disabled={disabled}
                onClose={() => setSelectedSlot(null)}
                onAssign={(slot, carId) => onAssign(slot, carId)}
                onReserve={(slot) => onReserve(slot)}
                onFree={(slot) => {
                    onFree(slot);
                    setSelectedSlot(null);
                }}
            />
        </>
    );
};

export default AdminParkingGrid;
