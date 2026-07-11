const statusColors = {
    empty: "#c8e6c9",
    occupied: "#ffcdd2",
    reserved: "#fff9c4",
};

const SlotCard = ({ slot, onClick }) => {
    return (
        <div
            onClick={() => onClick(slot)}
            style={{
                background: statusColors[slot.status] || "#eee",
                border: "1px solid #999",
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
                textAlign: "center",
            }}
        >
            <strong>{slot.slotNumber}</strong>
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem" }}>
                {slot.status}
            </p>
        </div>
    );
};

export default SlotCard ;