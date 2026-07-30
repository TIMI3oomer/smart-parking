// Frontend geometry data for the garage floor plan (ESM).
//
// Layout:
//   LEFT column (x=75):  5 groups of 3 slots, separated by pillars  -> A,B,C,D,E
//   RIGHT column (x=580): 5 groups of 3 slots, separated by pillars -> F,G,H,I,J
//                          (bottom -> top; J is closest to the wall, J1 = CEO slot)
//   MIDDLE alcove (x=478, past the top wall notch): 3 cars stacked vertically -> M1..M3
//   BLOCKING row (x=450): 4 slots running alongside F,G,H,I, stopping before the
//                          CEO group (J) so the CEO slot can never be blocked -> BL1..BL4

export const GARAGE_VIEWBOX = "0 -90 800 1050";

// Outer wall: main box (left column + right column), with a notch at the top
// for the middle alcove (M1-M3), matching the taller 15-slot columns.
export const GARAGE_WALLS =
    "M60,940 L60,15 L350,15 L350,-60 L580,-60 L580,190 L700,190 L700,940 Z";

// Structural pillars between each 3-car group, on both columns.
// Same y-positions on both sides since the columns share identical vertical spacing.
const POLE_Y = [190, 366, 542, 718]; // gap start for each of the 4 inter-group gaps
const POLE_HEIGHT = 26;

export const GARAGE_POLES = [
    ...POLE_Y.map((y, i) => ({ id: `pole-l-${i}`, x: 120, y, width: 28, height: POLE_HEIGHT })),
    ...POLE_Y.map((y, i) => ({ id: `pole-r-${i}`, x: 625, y, width: 28, height: POLE_HEIGHT })),
];

export const GARAGE_DIVIDERS = [
    { x1: 350, y1: 190, x2: 580, y2: 190 },
];

const groupSlots = (prefix, x, yStart, category = "normal") => {
    const width = 118;
    const height = 48;
    const gap = 3;
    return [0, 1, 2].map((i) => ({
        slotNumber: `${prefix}${i + 1}`,
        category,
        x,
        y: yStart + i * (height + gap),
        width,
        height,
        rotation: 0,
    }));
};

export const GARAGE_SLOTS = [
    // LEFT column: A (top) -> E (bottom), 5 groups of 3
    ...groupSlots("A", 75, 40),
    ...groupSlots("B", 75, 216),
    ...groupSlots("C", 75, 392),
    ...groupSlots("D", 75, 568),
    ...groupSlots("E", 75, 744),

    // RIGHT column: F (bottom) -> J (top, nearest wall), 5 groups of 3
    ...groupSlots("F", 580, 744),
    ...groupSlots("G", 580, 568),
    ...groupSlots("H", 580, 392),
    ...groupSlots("I", 580, 216),
    ...groupSlots("J", 580, 40).map((s) =>
        s.slotNumber === "J1" ? { ...s, category: "ceo" } : s
    ),

    // MIDDLE alcove: 3 cars stacked vertically, past the top wall notch
    { slotNumber: "M1", category: "normal", x: 478, y: -50, width: 72, height: 72, rotation: 0 },
    { slotNumber: "M2", category: "normal", x: 478, y: 26, width: 72, height: 72, rotation: 0 },
    { slotNumber: "M3", category: "normal", x: 478, y: 102, width: 72, height: 72, rotation: 0 },

    // BLOCKING row: aligned with F,G,H,I groups, stops before J (the CEO group)
    { slotNumber: "BL1", category: "blocking", x: 450, y: 216, width: 72, height: 150, rotation: 0 },
    { slotNumber: "BL2", category: "blocking", x: 450, y: 392, width: 72, height: 150, rotation: 0 },
    { slotNumber: "BL3", category: "blocking", x: 450, y: 568, width: 72, height: 150, rotation: 0 },
    { slotNumber: "BL4", category: "blocking", x: 450, y: 744, width: 72, height: 150, rotation: 0 },
];