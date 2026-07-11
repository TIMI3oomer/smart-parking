const carInfo =({slot,onClose,onReserve , onFree,currentUserId})=>{
    if(!slot) return null ;

    const car = slot.currentUserId;
    const isMine = car?.owner?.id === currentUserId ; 

    return(
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3>Slot : {slot.slotNumber}</h3>
                <p>Status:{slot.status}</p>

                {car ? (
                    <>
                    <p><strong>Car:</strong>{car.type}({car.color})</p>
                    <p><strong>Plate:</strong>{car.plate}</p>
                    <p><strong>Owner:</strong>{car.owner?.name}</p>
                    <p><strong>Phone:</strong>{car.owner?.Phone}</p>
                    </>
                ): slot.reservedFor ?(
                    <p><strong>Reserved for :</strong>{slot.reservedFor.name}</p>
                ):(
                    <p>This slot is empty.</p>
                )}

                <div style={{marginTop:"1rem"}}>{
                    slot.status ==="empty" && (
                        <button onClick={()=> onReserve(slot)}>Reserve this slot</button>
                    )}
                    {isMine &&(
                        <button onClick={()=> onFree(slot)}>Free my slot</button>
                    )}
                    <button onClick={onClose} style={{marginLeft:"0.5rem"}}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const modalStyle = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    minWidth: "300px",
};

export default carInfo ; 