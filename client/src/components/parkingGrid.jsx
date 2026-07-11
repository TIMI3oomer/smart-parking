import SlotCard from"./slotCard"

const ParkingGrid =({slots,onSlotClick})=>{
    return (
        <div className="slot-grid">
            {slots.map((slot)=>(
                <SlotCard key={slot.id} slot={slot} onClick={onSlotClick} />
            ))}
        </div>
    );
};

export default ParkingGrid;