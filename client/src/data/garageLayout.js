
export const GARAGE_VIEWBOX = "0 -90 820 1400";

export const GARAGE_WALLS = "M40,10 L40,1240 L765,1240 L765,10 Z";

export const GARAGE_DIVIDERS = [];

export const GARAGE_POLES = [
    { id: "pole-l-top", x: 124, y: 93, width: 32, height: 32 },

    // Between the 5 left-side groups (A-B, B-C, C-D, D-E)
    { id: "pole-l-0", x: 124, y: 318, width: 32, height: 32 },
    { id: "pole-l-1", x: 124, y: 543, width: 32, height: 32 },
    { id: "pole-l-2", x: 124, y: 768, width: 32, height: 32 },
    { id: "pole-l-3", x: 124, y: 993, width: 32, height: 32 },

    { id: "pole-r-0", x: 649, y: 318, width: 32, height: 32 },
    { id: "pole-r-1", x: 649, y: 543, width: 32, height: 32 },
    { id: "pole-r-2", x: 649, y: 768, width: 32, height: 32 },
    { id: "pole-r-3", x: 649, y: 993, width: 32, height: 32 },
];

export const GARAGE_SLOTS = [
    { slotNumber: "A0", category: "normal", x: 75, y: 30, width: 130, height: 55, rotation: 0 },

    { slotNumber: "A1", category: "normal", x: 75, y: 133, width: 130, height: 55, rotation: 0 },
    { slotNumber: "A2", category: "normal", x: 75, y: 194, width: 130, height: 55, rotation: 0 },
    { slotNumber: "A3", category: "normal", x: 75, y: 255, width: 130, height: 55, rotation: 0 },

    { slotNumber: "B1", category: "normal", x: 75, y: 358, width: 130, height: 55, rotation: 0 },
    { slotNumber: "B2", category: "normal", x: 75, y: 419, width: 130, height: 55, rotation: 0 },
    { slotNumber: "B3", category: "normal", x: 75, y: 480, width: 130, height: 55, rotation: 0 },

    { slotNumber: "C1", category: "normal", x: 75, y: 583, width: 130, height: 55, rotation: 0 },
    { slotNumber: "C2", category: "normal", x: 75, y: 644, width: 130, height: 55, rotation: 0 },
    { slotNumber: "C3", category: "normal", x: 75, y: 705, width: 130, height: 55, rotation: 0 },

    { slotNumber: "D1", category: "normal", x: 75, y: 808, width: 130, height: 55, rotation: 0 },
    { slotNumber: "D2", category: "normal", x: 75, y: 869, width: 130, height: 55, rotation: 0 },
    { slotNumber: "D3", category: "normal", x: 75, y: 930, width: 130, height: 55, rotation: 0 },

    { slotNumber: "E1", category: "normal", x: 75, y: 1033, width: 130, height: 55, rotation: 0 },
    { slotNumber: "E2", category: "normal", x: 75, y: 1094, width: 130, height: 55, rotation: 0 },
    { slotNumber: "E3", category: "normal", x: 75, y: 1155, width: 130, height: 55, rotation: 0 },

    // ---- RIGHT: J (top, nearest wall, J1 = ceo) down to F (bottom) ----
    { slotNumber: "J1", category: "ceo", x: 600, y: 358, width: 130, height: 55, rotation: 0 },
    { slotNumber: "J2", category: "normal", x: 600, y: 419, width: 130, height: 55, rotation: 0 },
    { slotNumber: "J3", category: "normal", x: 600, y: 480, width: 130, height: 55, rotation: 0 },

    { slotNumber: "I1", category: "normal", x: 600, y: 583, width: 130, height: 55, rotation: 0 },
    { slotNumber: "I2", category: "normal", x: 600, y: 644, width: 130, height: 55, rotation: 0 },
    { slotNumber: "I3", category: "normal", x: 600, y: 705, width: 130, height: 55, rotation: 0 },

    { slotNumber: "H1", category: "normal", x: 600, y: 808, width: 130, height: 55, rotation: 0 },
    { slotNumber: "H2", category: "normal", x: 600, y: 869, width: 130, height: 55, rotation: 0 },
    { slotNumber: "H3", category: "normal", x: 600, y: 930, width: 130, height: 55, rotation: 0 },

    { slotNumber: "G1", category: "normal", x: 600, y: 1033, width: 130, height: 55, rotation: 0 },
    { slotNumber: "G2", category: "normal", x: 600, y: 1094, width: 130, height: 55, rotation: 0 },
    { slotNumber: "G3", category: "normal", x: 600, y: 1155, width: 130, height: 55, rotation: 0 },

    { slotNumber: "F1", category: "normal", x: 600, y: 1033, width: 130, height: 55, rotation: 0 },
    { slotNumber: "F2", category: "normal", x: 600, y: 1094, width: 130, height: 55, rotation: 0 },
    { slotNumber: "F3", category: "normal", x: 600, y: 1155, width: 130, height: 55, rotation: 0 },

    // ---- MIDDLE: 3 cars stacked, shifted down clear of the ceo's row ----
    { slotNumber: "M1", category: "normal", x: 478, y: 252, width: 84, height: 80, rotation: 0 },
    { slotNumber: "M2", category: "normal", x: 478, y: 340, width: 84, height: 80, rotation: 0 },
    { slotNumber: "M3", category: "normal", x: 478, y: 428, width: 84, height: 80, rotation: 0 },

    // ---- BLOCKING column: aligned with I/H/G/F, stops before J (the ceo) ----
    { slotNumber: "BL1", category: "blocking", x: 350, y: 255, width: 80, height: 177, rotation: 0 },
    { slotNumber: "BL2", category: "blocking", x: 350, y: 480, width: 80, height: 177, rotation: 0 },
    { slotNumber: "BL3", category: "blocking", x: 350, y: 705, width: 80, height: 177, rotation: 0 },
    { slotNumber: "BL4", category: "blocking", x: 350, y: 930, width: 80, height: 177, rotation: 0 },
];