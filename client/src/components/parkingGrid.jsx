import GarageFloorPlan from "./GarageFloorPlan";

const ParkingGrid = ({ slots, onSlotClick }) => (
    <GarageFloorPlan
        slots={slots}
        emptyMessage="لا توجد مواقف سيارات بعد."
        onSlotClick={onSlotClick}
    />
);

export default ParkingGrid;
