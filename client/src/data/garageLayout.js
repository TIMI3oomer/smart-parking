
export const GARAGE_VIEWBOX = "0 -80 830 930";

export const GARAGE_WALLS =
    "M60,760 L60,15 L350,15 L350,-35 L580,-35 L580,180 L700,180 L700,760 Z";

export const GARAGE_DIVIDERS = [
    { x1: 60, y1: 200, x2: 250, y2: 200 },
    { x1: 60, y1: 462, x2: 250, y2: 462 },
    { x1: 530, y1: 462, x2: 700, y2: 462 }
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

    { slotNumber: "D1", category: "normal", x: 478, y: -20, width: 72, height: 88, rotation: 0 },
    { slotNumber: "D2", category: "normal", x: 478, y: 90, width: 72, height: 88, rotation: 0 },

    { slotNumber: "E1", category: "ceo", x: 580, y: 188, width: 118, height: 72, rotation: 0 },
    { slotNumber: "E2", category: "normal", x: 580, y: 273, width: 118, height: 72, rotation: 0 },
    { slotNumber: "E3", category: "normal", x: 580, y: 360, width: 118, height: 72, rotation: 0 },

    { slotNumber: "F1", category: "blocking", x: 450, y: 320, width: 72, height: 118, rotation: 0 },
    { slotNumber: "F2", category: "blocking", x: 450, y: 470, width: 72, height: 118, rotation: 0 },
    { slotNumber: "F3", category: "blocking", x: 450, y: 860, width: 72, height: 118, rotation: 0 },

    { slotNumber: "G1", category: "normal", x: 580, y: 480, width: 118, height: 72, rotation: 0 },
    { slotNumber: "G2", category: "normal", x: 580, y: 560, width: 118, height: 72, rotation: 0 },
    { slotNumber: "G3", category: "normal", x: 580, y: 640, width: 118, height: 72, rotation: 0 },
    { slotNumber: "G4", category: "normal", x: 580, y: 720, width: 118, height: 72, rotation: 0 },
];
