
export const GARAGE_VIEWBOX = "0 -80 830 920";

export const GARAGE_WALLS =
    "M60,760 L60,40 L345,40 L345,20 L580,20 L580,300 L700,300 L700,760 Z";

export const GARAGE_DIVIDERS = [
    { x1: 60, y1: 200, x2: 250, y2: 200 },
    { x1: 60, y1: 462, x2: 250, y2: 462 },
];

export const GARAGE_SLOTS = [
    { slotNumber: "A1", category: "normal", x: 75, y: 55, width: 118, height: 64, rotation:0 },
    { slotNumber: "A2", category: "normal", x: 75, y: 125, width: 118, height: 64, rotation: 0 },

    { slotNumber: "B1", category: "normal", x: 75, y: 220, width: 118, height: 64, rotation: 0 },
    { slotNumber: "B2", category: "normal", x: 75, y: 300, width: 118, height: 64, rotation: 0 },
    { slotNumber: "B3", category: "normal", x: 75, y: 380, width: 118, height: 64, rotation: 0 },

    { slotNumber: "C1", category: "normal", x: 75, y: 480, width: 118, height: 72, rotation: 0 },
    { slotNumber: "C2", category: "normal", x: 75, y: 570, width: 118, height: 72, rotation: 0 },
    { slotNumber: "C3", category: "normal", x: 75, y: 660, width: 118, height: 72, rotation: 0 },

    { slotNumber: "D1", category: "normal", x: 478, y: 30, width: 72, height: 118, rotation: 0 },
    { slotNumber: "D2", category: "normal", x: 478, y: 169, width: 72, height: 118, rotation: 0 },

    { slotNumber: "E1", category: "ceo", x: 580, y: 318, width: 118, height: 72, rotation: 0 },
    { slotNumber: "E2", category: "normal", x: 580, y: 420, width: 118, height: 72, rotation: 0 },
    
    { slotNumber: "F1", category: "blocking", x: 450, y: 320, width: 72, height: 118, rotation: 0 },
    { slotNumber: "F2", category: "normal", x: 450, y: 470, width: 72, height: 118, rotation: 0 },

    { slotNumber: "G1", category: "blocking", x: 380, y: 610, width: 72, height: 120, rotation: 0 },
    { slotNumber: "G2", category: "normal", x: 290, y: 610, width: 72, height: 120, rotation: 0 },
];
