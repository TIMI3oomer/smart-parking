import {
    GARAGE_VIEWBOX,
    GARAGE_WALL_PATHS,
    GARAGE_DIVIDERS,
    GARAGE_POLES,
    GARAGE_SLOTS,
} from "../data/garageLayout";
import "./GarageFloorPlan.css";

const STATUS_CLASS = {
    empty: "bay--empty",
    reserved: "bay--reserved",
    occupied: "bay--occupied",
};

const STATUS_LABEL = {
    empty: "شاغر",
    reserved: "محجوز",
    occupied: "مشغول",
};

const CATEGORY_BADGE = { ceo: "★", blocking: "⚠" };

const CarIcon = ({ x, y, width, height }) => {
    const bodyWidth = width * 0.62;
    const bodyHeight = height * 0.8;
    const bodyX = x + (width - bodyWidth) / 2;
    const bodyY = y + (height - bodyHeight) / 2;

    return (
        <g className="garage-plan__car" aria-hidden="true">
            <rect
                x={bodyX} y={bodyY} width={bodyWidth} height={bodyHeight}
                rx={bodyWidth * 0.3}
                className="garage-plan__car-body"
            />
            <rect
                x={bodyX + bodyWidth * 0.16} y={bodyY + bodyHeight * 0.12}
                width={bodyWidth * 0.68} height={bodyHeight * 0.24}
                rx={bodyWidth * 0.12}
                className="garage-plan__car-glass"
            />
            <rect
                x={bodyX + bodyWidth * 0.16} y={bodyY + bodyHeight * 0.62}
                width={bodyWidth * 0.68} height={bodyHeight * 0.16}
                rx={bodyWidth * 0.08}
                className="garage-plan__car-glass"
            />
        </g>
    );
};

const Pole = ({ x, y, width, height }) => (
    <g className="garage-plan__pole-group" aria-hidden="true">
        <rect x={x} y={y} width={width} height={height} rx="2" className="garage-plan__pole" />
        <line x1={x} y1={y} x2={x + width} y2={y + height} className="garage-plan__pole-hatch" />
        <line x1={x + width} y1={y} x2={x} y2={y + height} className="garage-plan__pole-hatch" />
    </g>
);

const GarageFloorPlan = ({ slots, onSlotClick, emptyMessage }) => {
    if (!slots || slots.length === 0) {
        return <p className="page-subtitle">{emptyMessage}</p>;
    }

    const bySlotNumber = new Map(slots.map((s) => [s.slotNumber, s]));

    return (
        <div className="garage-plan-wrapper">
            <svg
                viewBox={GARAGE_VIEWBOX}
                className="garage-plan"
                role="img"
                aria-label="مخطط الكراج من الأعلى"
                preserveAspectRatio="xMidYMid meet"
            >
                {GARAGE_WALL_PATHS.map((d, index) => (
                    <path
                        key={`${index}-${d}`}
                        d={d}
                        className="garage-plan__wall"
                        fill="none"
                        aria-hidden="true"
                    />
                ))}

                {GARAGE_DIVIDERS.map((d) => (
                    <line
                        key={`${d.x1}-${d.y1}-${d.x2}-${d.y2}`}
                        x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
                        className="garage-plan__divider"
                    />
                ))}

                {GARAGE_POLES.map((p) => (
                    <Pole key={p.id} x={p.x} y={p.y} width={p.width} height={p.height} />
                ))}

                {GARAGE_SLOTS.map((geo) => {
                    const slot = bySlotNumber.get(geo.slotNumber);
                    if (!slot) return null;

                    const status = slot.status || "empty";
                    const cx = geo.x + geo.width / 2;
                    const cy = geo.y + geo.height / 2;
                    const badge = CATEGORY_BADGE[slot.category];

                    return (
                        <g
                            key={geo.slotNumber}
                            transform={`rotate(${geo.rotation || 0} ${cx} ${cy})`}
                            className={`garage-plan__slot ${STATUS_CLASS[status] || ""}`}
                            onClick={() => onSlotClick(slot)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSlotClick(slot);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`الموقف ${geo.slotNumber} — ${STATUS_LABEL[status] || status}`}
                        >
                            <rect
                                x={geo.x} y={geo.y} width={geo.width} height={geo.height}
                                rx="8" className="garage-plan__rect"
                            />
                            <line
                                x1={geo.x + 6} y1={geo.y + geo.height * 0.14}
                                x2={geo.x + 6} y2={geo.y + geo.height * 0.86}
                                className="garage-plan__paint"
                            />
                            <line
                                x1={geo.x + geo.width - 6} y1={geo.y + geo.height * 0.14}
                                x2={geo.x + geo.width - 6} y2={geo.y + geo.height * 0.86}
                                className="garage-plan__paint"
                            />
                            <text x={cx} y={geo.y + 16} textAnchor="middle" className="garage-plan__number">
                                {geo.slotNumber}
                            </text>
                            {status === "occupied" ? (
                                <CarIcon x={geo.x} y={geo.y} width={geo.width} height={geo.height} />
                            ) : (
                                // Rendered as real HTML (via foreignObject) instead of
                                // SVG <text>. Safari's SVG text renderer doesn't reliably
                                // run full Arabic letter-shaping (joining initial/medial/
                                // final forms), which made شاغر/محجوز/مشغول render
                                // garbled on iPhone. HTML text layout always shapes and
                                // orders Arabic correctly, so we use that instead.
                                <foreignObject
                                    x={geo.x}
                                    y={cy - 11}
                                    width={geo.width}
                                    height={22}
                                    style={{ pointerEvents: "none", overflow: "visible" }}
                                >
                                    <div
                                        xmlns="http://www.w3.org/1999/xhtml"
                                        className="garage-plan__status-html"
                                    >
                                        {STATUS_LABEL[status] || status}
                                    </div>
                                </foreignObject>
                            )}
                            {badge && (
                                <>
                                    <circle
                                        cx={geo.x + geo.width - 8} cy={geo.y + 10} r="10"
                                        className={`garage-plan__badge garage-plan__badge--${slot.category}`}
                                    />
                                    <text
                                        x={geo.x + geo.width - 8} y={geo.y + 13.5} textAnchor="middle"
                                        className="garage-plan__badge-icon"
                                    >
                                        {badge}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}

                <g className="garage-plan__marker garage-plan__marker--in">
                    <rect x="322" y="-72" width="160" height="34" rx="17" />
                    <foreignObject x="322" y="-72" width="160" height="34" style={{ pointerEvents: "none", overflow: "visible" }}>
                        <div xmlns="http://www.w3.org/1999/xhtml" className="garage-plan__marker-html">
                            ⬇ مدخل
                        </div>
                    </foreignObject>
                </g>
            </svg>
        </div>
    );
};

export default GarageFloorPlan;