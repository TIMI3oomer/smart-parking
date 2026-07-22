const CarIcon = () => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
        <path
            d="M5 16.5V11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11v5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <rect x="3.5" y="11" width="17" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="7.5" cy="17.5" r="1.6" fill="currentColor" />
        <circle cx="16.5" cy="17.5" r="1.6" fill="currentColor" />
    </svg>
);

const ReservedIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EmptyIcon = () => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
        <text x="12" y="17" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor" fontFamily="inherit">
            P
        </text>
    </svg>
);

const STATUS_META = {
    empty: { label: "شاغر", icon: EmptyIcon },
    reserved: { label: "محجوز", icon: ReservedIcon },
    occupied: { label: "مشغول", icon: CarIcon },
};

const SlotCard = ({ slot, onClick }) => {
    const status = slot.status || "empty";
    const meta = STATUS_META[status] || STATUS_META.empty;
    const Icon = meta.icon;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(slot)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(slot);
                }
            }}
            className={`bay bay--${status}`}
            aria-label={`الموقف ${slot.slotNumber}، ${meta.label}`}
        >
            <span className="bay__line bay__line--left" aria-hidden="true" />
            <span className="bay__line bay__line--right" aria-hidden="true" />

            <span className="bay__number">{slot.slotNumber}</span>
            <span className="bay__icon">
                <Icon />
            </span>
            <span className="bay__status">{meta.label}</span>
        </div>
    );
};

export default SlotCard;