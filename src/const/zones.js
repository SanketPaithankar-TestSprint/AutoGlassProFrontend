// Zones for car glass diagram
const ZONES = [
    {
        id: "windshield",
        label: "Windshield",
        code: "DW",
        pos: "N/A",
        side: "N/A",
        path: "M85,140 C85,140 110,120 150,120 C190,120 215,140 215,140 L225,175 C225,175 190,185 150,185 C110,185 75,175 75,175 L85,140 Z"
    },
    {
        id: "back_glass",
        label: "Back Glass",
        code: "DB",
        pos: "N/A",
        side: "N/A",
        path: "M80,405 C80,405 110,395 150,395 C190,395 220,405 220,405 L210,445 C210,445 180,455 150,455 C120,455 90,445 90,445 L80,405 Z"
    },
    // ...LEFT SIDE...
    { id: "l_fq", label: "Front Quarter (left)", code: "DQ", pos: "N/A", side: "Left", path: "M68,170 L72,185 L52,185 C51,180 55,175 68,170 Z" },
    { id: "l_fv", label: "Front Vent (left)", code: "DV", pos: "Front", side: "Left", path: "M72,188 L72,210 L52,210 L52,188 Z" },
    { id: "l_fd", label: "Front Door (left)", code: "DD", pos: "Front", side: "Left", path: "M72,213 L72,270 L50,270 C48,250 48,230 52,213 Z" },
    { id: "l_md", label: "Middle Door (left)", code: "DD", pos: "Middle", side: "Left", path: "M72,273 L72,295 L50,295 L50,273 Z" },
    { id: "l_rd", label: "Rear Door (left)", code: "DD", pos: "Rear", side: "Left", path: "M72,298 L72,355 L52,355 C50,335 50,315 50,298 Z" },
    { id: "l_rv", label: "Rear Vent (left)", code: "DV", pos: "Rear", side: "Left", path: "M72,358 L72,380 L54,380 L52,358 Z" },
    { id: "l_rq", label: "Rear Quarter (left)", code: "DQ", pos: "N/A", side: "Left", path: "M72,383 L68,400 C58,395 55,390 54,383 Z" },
    // ...RIGHT SIDE...
    { id: "r_fq", label: "Front Quarter (right)", code: "DQ", pos: "N/A", side: "Right", path: "M232,170 L228,185 L248,185 C249,180 245,175 232,170 Z" },
    { id: "r_fv", label: "Front Vent (right)", code: "DV", pos: "Front", side: "Right", path: "M228,188 L228,210 L248,210 L248,188 Z" },
    { id: "r_fd", label: "Front Door (right)", code: "DD", pos: "Front", side: "Right", path: "M228,213 L228,270 L250,270 C252,250 252,230 248,213 Z" },
    { id: "r_md", label: "Middle Door (right)", code: "DD", pos: "Middle", side: "Right", path: "M228,273 L228,295 L250,295 L250,273 Z" },
    { id: "r_rd", label: "Rear Door (right)", code: "DD", pos: "Rear", side: "Right", path: "M228,298 L228,355 L248,355 C250,335 250,315 250,298 Z" },
    { id: "r_rv", label: "Rear Vent (right)", code: "DV", pos: "Rear", side: "Right", path: "M228,358 L228,380 L246,380 L248,358 Z" },
    { id: "r_rq", label: "Rear Quarter (right)", code: "DQ", pos: "N/A", side: "Right", path: "M228,383 L232,400 C242,395 245,390 246,383 Z" }
];

export default ZONES;
