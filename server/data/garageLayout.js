// Backend/seed list of slot numbers + categories, matching garageLayout.js geometry.
// NOTE: original filename was garageLayout.js — rename this to garageLayout.js
// in your backend/seed folder (kept a distinct name here to avoid clobbering
// the frontend geometry file of the same name).
module.exports = [
    // LEFT column: A-E, 5 groups of 3
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

    // RIGHT column: F-J (bottom -> top), 5 groups of 3. J1 = CEO (closest to the wall)
    { slotNumber: "F1", category: "normal" },
    { slotNumber: "F2", category: "normal" },
    { slotNumber: "F3", category: "normal" },
    { slotNumber: "G1", category: "normal" },
    { slotNumber: "G2", category: "normal" },
    { slotNumber: "G3", category: "normal" },
    { slotNumber: "H1", category: "normal" },
    { slotNumber: "H2", category: "normal" },
    { slotNumber: "H3", category: "normal" },
    { slotNumber: "I1", category: "normal" },
    { slotNumber: "I2", category: "normal" },
    { slotNumber: "I3", category: "normal" },
    { slotNumber: "J1", category: "ceo" },
    { slotNumber: "J2", category: "normal" },
    { slotNumber: "J3", category: "normal" },

    // MIDDLE alcove: 3 cars stacked vertically
    { slotNumber: "M1", category: "normal" },
    { slotNumber: "M2", category: "normal" },
    { slotNumber: "M3", category: "normal" },

    // BLOCKING row: stops before the CEO group (J), so J1 can never be blocked
    { slotNumber: "BL1", category: "blocking" },
    { slotNumber: "BL2", category: "blocking" },
    { slotNumber: "BL3", category: "blocking" },
    { slotNumber: "BL4", category: "blocking" },
];