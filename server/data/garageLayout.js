// Backend/seed list of slot numbers + categories, matching client/src/data/garageLayout.js geometry.
module.exports = [
    // LEFT column: A0 (single car) then A-E, 5 groups of 3
    { slotNumber: "A0", category: "normal" },
    { slotNumber: "A1", category: "normal" },
    { slotNumber: "A2", category: "normal" },
    { slotNumber: "A3", category: "normal" },
    { slotNumber: "B1", category: "normal" },
    { slotNumber: "B2", category: "normal" },
    { slotNumber: "B3", category: "normal" },
    { slotNumber: "C1", category: "normal" },
    { slotNumber: "C2", category: "normal" },
    { slotNumber: "C3", category: "normal" },
    { slotNumber: "D1", category: "normal" },
    { slotNumber: "D2", category: "normal" },
    { slotNumber: "D3", category: "normal" },
    { slotNumber: "E1", category: "normal" },
    { slotNumber: "E2", category: "normal" },
    { slotNumber: "E3", category: "normal" },

    // RIGHT column: J (top, nearest wall) down to F (bottom), 5 groups of 3. J1 = CEO
    { slotNumber: "J1", category: "ceo" },
    { slotNumber: "J2", category: "normal" },
    { slotNumber: "J3", category: "normal" },
    { slotNumber: "I1", category: "normal" },
    { slotNumber: "I2", category: "normal" },
    { slotNumber: "I3", category: "normal" },
    { slotNumber: "H1", category: "normal" },
    { slotNumber: "H2", category: "normal" },
    { slotNumber: "H3", category: "normal" },
    { slotNumber: "G1", category: "normal" },
    { slotNumber: "G2", category: "normal" },
    { slotNumber: "G3", category: "normal" },
    { slotNumber: "F1", category: "normal" },
    { slotNumber: "F2", category: "normal" },
    { slotNumber: "F3", category: "normal" },

    // MIDDLE column: 3 cars stacked vertically, shifted down clear of the ceo row
    { slotNumber: "M1", category: "normal" },
    { slotNumber: "M2", category: "normal" },
    { slotNumber: "M3", category: "normal" },

    // BLOCKING column: aligned with I/H/G/F, stops before J so the ceo can't be blocked
    { slotNumber: "BL1", category: "blocking" },
    { slotNumber: "BL2", category: "blocking" },
    { slotNumber: "BL3", category: "blocking" },
    { slotNumber: "BL4", category: "blocking" },
];