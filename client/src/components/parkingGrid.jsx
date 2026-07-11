import SlotCard from"./slotCard"

const ParkingGrid =({slots,onSlotClick})=>{
    return (
        <div 
        style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",
            gap:"1rem"
        }}
        >
            {slots.map((slot)=>(
                <SlotCard key={slot.id} slot={slot} onClick={onSlotClick} />
            ))}
        </div>
    );
};

export default ParkingGrid;