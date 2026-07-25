

export interface InfrastructureItem {
  id: string;
  type: "Bridge" | "Tunnel" | "Dam" | "Building";
  location: string;
  riskScore: number;
  status: string;
  lat: number;
  lng: number;
  name: string;
  age: string;
  recommendedAction: string;
  groundMovement: { year: string; displacement: number }[];
  riskFactors: { factor: string; value: number }[];
}

const bridgeRiskFactors = (gm: number, tl: number, ri: number, tv: number) => [
  { factor: "Ground Movement", value: gm },
  { factor: "Traffic Load", value: tl },
  { factor: "Rainfall Impact", value: ri },
  { factor: "Temp Variation", value: tv },
];

const tunnelRiskFactors = (gm: number, ri: number, tl: number, gp: number) => [
  { factor: "Ground Movement", value: gm },
  { factor: "Rainfall Impact", value: ri },
  { factor: "Traffic Load", value: tl },
  { factor: "Geological Pressure", value: gp },
];

const damRiskFactors = (rp: number, ri: number, gm: number, sa: number) => [
  { factor: "Reservoir Pressure", value: rp },
  { factor: "Rainfall Impact", value: ri },
  { factor: "Ground Movement", value: gm },
  { factor: "Structural Age", value: sa },
];

const buildingRiskFactors = (gm: number, ri: number, ts: number, sa: number) => [
  { factor: "Ground Movement", value: gm },
  { factor: "Rainfall Impact", value: ri },
  { factor: "Temperature Stress", value: ts },
  { factor: "Structural Age", value: sa },
];

const initialAssets: InfrastructureItem[] = [
  // === Bridges ===
  {
    id: "BR-JK-001", type: "Bridge", location: "Reasi, Jammu & Kashmir", riskScore: 88, status: "Critical",
    lat: 33.1478, lng: 75.3325, name: "Chenab Rail Bridge", age: "3 years",
    recommendedAction: "URGENT: High seismic zone — continuous structural health monitoring required. Inspect arch bearings within 7 days.",
    groundMovement: [
      { year: "2019", displacement: 1.8 }, { year: "2020", displacement: 2.9 }, { year: "2021", displacement: 4.1 },
      { year: "2022", displacement: 5.5 }, { year: "2023", displacement: 7.0 }, { year: "2024", displacement: 8.6 }, { year: "2025", displacement: 9.8 },
    ],
    riskFactors: bridgeRiskFactors(85, 45, 70, 62),
  },
  {
    id: "BR-MH-001", type: "Bridge", location: "Mumbai, Maharashtra", riskScore: 62, status: "Warning",
    lat: 19.0176, lng: 72.8562, name: "Bandra–Worli Sea Link", age: "16 years",
    recommendedAction: "Monitor cable tension under monsoon wind loads. Schedule underwater pier inspection.",
    groundMovement: [
      { year: "2019", displacement: 1.2 }, { year: "2020", displacement: 1.8 }, { year: "2021", displacement: 2.5 },
      { year: "2022", displacement: 3.0 }, { year: "2023", displacement: 3.8 }, { year: "2024", displacement: 4.5 }, { year: "2025", displacement: 5.2 },
    ],
    riskFactors: bridgeRiskFactors(38, 78, 65, 40),
  },
  {
    id: "BR-WB-001", type: "Bridge", location: "Kolkata, West Bengal", riskScore: 58, status: "Warning",
    lat: 22.5850, lng: 88.3468, name: "Howrah Bridge", age: "81 years",
    recommendedAction: "Corrosion monitoring critical due to age. Restrict heavy vehicle passage during peak hours.",
    groundMovement: [
      { year: "2019", displacement: 1.0 }, { year: "2020", displacement: 1.4 }, { year: "2021", displacement: 2.0 },
      { year: "2022", displacement: 2.6 }, { year: "2023", displacement: 3.2 }, { year: "2024", displacement: 4.0 }, { year: "2025", displacement: 4.6 },
    ],
    riskFactors: bridgeRiskFactors(30, 90, 55, 45),
  },
  {
    id: "BR-AP-001", type: "Bridge", location: "Rajahmundry, Andhra Pradesh", riskScore: 76, status: "Critical",
    lat: 16.9891, lng: 81.7787, name: "Godavari Rail Bridge", age: "97 years",
    recommendedAction: "URGENT: Structural age exceeds safe limits. Full load-bearing assessment required immediately.",
    groundMovement: [
      { year: "2019", displacement: 2.0 }, { year: "2020", displacement: 2.8 }, { year: "2021", displacement: 3.5 },
      { year: "2022", displacement: 4.2 }, { year: "2023", displacement: 5.6 }, { year: "2024", displacement: 6.9 }, { year: "2025", displacement: 8.1 },
    ],
    riskFactors: bridgeRiskFactors(72, 82, 60, 55),
  },
  // === Tunnels ===
  {
    id: "TN-HP-001", type: "Tunnel", location: "Rohtang, Himachal Pradesh", riskScore: 28, status: "Stable",
    lat: 32.3234, lng: 77.1947, name: "Atal Tunnel", age: "5 years",
    recommendedAction: "Structure in excellent condition. Next inspection in 6 months.",
    groundMovement: [
      { year: "2019", displacement: 0.0 }, { year: "2020", displacement: 0.0 }, { year: "2021", displacement: 0.2 },
      { year: "2022", displacement: 0.3 }, { year: "2023", displacement: 0.4 }, { year: "2024", displacement: 0.5 }, { year: "2025", displacement: 0.6 },
    ],
    riskFactors: tunnelRiskFactors(18, 20, 35, 15),
  },
  {
    id: "TN-JK-001", type: "Tunnel", location: "Banihal, Jammu & Kashmir", riskScore: 52, status: "Warning",
    lat: 33.4312, lng: 75.0900, name: "Pir Panjal Tunnel", age: "11 years",
    recommendedAction: "Monitor geological pressure in Section C. Schedule quarterly seepage inspection.",
    groundMovement: [
      { year: "2019", displacement: 0.8 }, { year: "2020", displacement: 1.2 }, { year: "2021", displacement: 1.7 },
      { year: "2022", displacement: 2.1 }, { year: "2023", displacement: 2.6 }, { year: "2024", displacement: 3.1 }, { year: "2025", displacement: 3.5 },
    ],
    riskFactors: tunnelRiskFactors(45, 50, 40, 68),
  },
  {
    id: "TN-JK-002", type: "Tunnel", location: "Ramban, Jammu & Kashmir", riskScore: 65, status: "Warning",
    lat: 33.2391, lng: 75.2325, name: "Nashri Tunnel", age: "8 years",
    recommendedAction: "Landslide-prone zone — reinforce drainage and anchor systems. Inspect lining cracks.",
    groundMovement: [
      { year: "2019", displacement: 1.0 }, { year: "2020", displacement: 1.6 }, { year: "2021", displacement: 2.3 },
      { year: "2022", displacement: 3.0 }, { year: "2023", displacement: 3.8 }, { year: "2024", displacement: 4.4 }, { year: "2025", displacement: 5.0 },
    ],
    riskFactors: tunnelRiskFactors(60, 58, 50, 72),
  },
  // === Dams ===
  {
    id: "DM-UK-001", type: "Dam", location: "Tehri, Uttarakhand", riskScore: 35, status: "Stable",
    lat: 30.3780, lng: 78.4800, name: "Tehri Dam", age: "18 years",
    recommendedAction: "All parameters nominal. Continue seasonal water level monitoring.",
    groundMovement: [
      { year: "2019", displacement: 0.4 }, { year: "2020", displacement: 0.6 }, { year: "2021", displacement: 0.9 },
      { year: "2022", displacement: 1.1 }, { year: "2023", displacement: 1.3 }, { year: "2024", displacement: 1.5 }, { year: "2025", displacement: 1.7 },
    ],
    riskFactors: damRiskFactors(30, 45, 22, 25),
  },
  {
    id: "DM-GJ-001", type: "Dam", location: "Kevadia, Gujarat", riskScore: 42, status: "Stable",
    lat: 21.8380, lng: 73.7190, name: "Sardar Sarovar Dam", age: "58 years",
    recommendedAction: "Monitor spillway gate mechanisms. Routine silt level assessment due.",
    groundMovement: [
      { year: "2019", displacement: 0.5 }, { year: "2020", displacement: 0.8 }, { year: "2021", displacement: 1.1 },
      { year: "2022", displacement: 1.4 }, { year: "2023", displacement: 1.7 }, { year: "2024", displacement: 2.0 }, { year: "2025", displacement: 2.3 },
    ],
    riskFactors: damRiskFactors(40, 50, 28, 60),
  },
  {
    id: "DM-OD-001", type: "Dam", location: "Sambalpur, Odisha", riskScore: 78, status: "Critical",
    lat: 21.5185, lng: 83.8694, name: "Hirakud Dam", age: "67 years",
    recommendedAction: "URGENT: Structural age and monsoon pressure — full dam safety review required within 30 days.",
    groundMovement: [
      { year: "2019", displacement: 1.5 }, { year: "2020", displacement: 2.2 }, { year: "2021", displacement: 3.0 },
      { year: "2022", displacement: 3.9 }, { year: "2023", displacement: 5.0 }, { year: "2024", displacement: 6.2 }, { year: "2025", displacement: 7.5 },
    ],
    riskFactors: damRiskFactors(80, 75, 65, 85),
  },
  {
    id: "DM-HP-001", type: "Dam", location: "Bilaspur, Himachal Pradesh", riskScore: 55, status: "Warning",
    lat: 31.3350, lng: 76.7550, name: "Bhakra Nangal Dam", age: "61 years",
    recommendedAction: "Aging infrastructure — schedule comprehensive seepage and stress analysis.",
    groundMovement: [
      { year: "2019", displacement: 0.7 }, { year: "2020", displacement: 1.0 }, { year: "2021", displacement: 1.4 },
      { year: "2022", displacement: 1.9 }, { year: "2023", displacement: 2.4 }, { year: "2024", displacement: 2.9 }, { year: "2025", displacement: 3.3 },
    ],
    riskFactors: damRiskFactors(55, 60, 40, 70),
  },
  // === Buildings ===
  {
    id: "BL-MH-001", type: "Building", location: "Mumbai, Maharashtra", riskScore: 22, status: "Stable",
    lat: 18.9733, lng: 72.8281, name: "Antilia Tower", age: "15 years",
    recommendedAction: "All systems nominal. Next facade inspection in 12 months.",
    groundMovement: [
      { year: "2019", displacement: 0.1 }, { year: "2020", displacement: 0.2 }, { year: "2021", displacement: 0.3 },
      { year: "2022", displacement: 0.3 }, { year: "2023", displacement: 0.4 }, { year: "2024", displacement: 0.4 }, { year: "2025", displacement: 0.5 },
    ],
    riskFactors: buildingRiskFactors(12, 18, 15, 20),
  },
  {
    id: "BL-HR-001", type: "Building", location: "Gurugram, Haryana", riskScore: 32, status: "Stable",
    lat: 28.4950, lng: 77.0890, name: "DLF CyberHub Tower", age: "12 years",
    recommendedAction: "Structure stable. Continue periodic facade and HVAC system inspections.",
    groundMovement: [
      { year: "2019", displacement: 0.2 }, { year: "2020", displacement: 0.3 }, { year: "2021", displacement: 0.4 },
      { year: "2022", displacement: 0.5 }, { year: "2023", displacement: 0.6 }, { year: "2024", displacement: 0.7 }, { year: "2025", displacement: 0.8 },
    ],
    riskFactors: buildingRiskFactors(20, 25, 22, 18),
  },
  {
    id: "BL-KA-001", type: "Building", location: "Bengaluru, Karnataka", riskScore: 38, status: "Stable",
    lat: 12.9716, lng: 77.5946, name: "UB City Tower", age: "9 years",
    recommendedAction: "Structure stable. Monitor rainfall runoff impact on foundation during monsoon.",
    groundMovement: [
      { year: "2019", displacement: 0.3 }, { year: "2020", displacement: 0.5 }, { year: "2021", displacement: 0.7 },
      { year: "2022", displacement: 0.9 }, { year: "2023", displacement: 1.1 }, { year: "2024", displacement: 1.3 }, { year: "2025", displacement: 1.5 },
    ],
    riskFactors: buildingRiskFactors(25, 40, 30, 18),
  },
  {
    id: "BL-WB-001", type: "Building", location: "Kolkata, West Bengal", riskScore: 60, status: "Warning",
    lat: 22.5726, lng: 88.4350, name: "World Trade Center Kolkata", age: "20 years",
    recommendedAction: "Subsidence risk in alluvial soil. Schedule ground-penetrating radar survey.",
    groundMovement: [
      { year: "2019", displacement: 0.8 }, { year: "2020", displacement: 1.3 }, { year: "2021", displacement: 1.9 },
      { year: "2022", displacement: 2.5 }, { year: "2023", displacement: 3.2 }, { year: "2024", displacement: 3.9 }, { year: "2025", displacement: 4.5 },
    ],
    riskFactors: buildingRiskFactors(55, 62, 48, 42),
  },
  // === Delhi-NCR ===
  {
    id: "BL-UP-001", type: "Building", location: "Noida, Uttar Pradesh", riskScore: 28, status: "Stable",
    lat: 28.5670, lng: 77.3210, name: "Supernova Spira Tower", age: "4 years",
    recommendedAction: "All systems nominal. Continue standard monitoring schedule.",
    groundMovement: [
      { year: "2019", displacement: 0.0 }, { year: "2020", displacement: 0.0 }, { year: "2021", displacement: 0.1 },
      { year: "2022", displacement: 0.2 }, { year: "2023", displacement: 0.3 }, { year: "2024", displacement: 0.3 }, { year: "2025", displacement: 0.4 },
    ],
    riskFactors: buildingRiskFactors(15, 20, 18, 10),
  },
  // === Delhi-NCR Expansion ===
  {
    id: "BR-DL-005", type: "Bridge", location: "Delhi", riskScore: 58, status: "Warning",
    lat: 28.7266, lng: 77.2375, name: "Signature Bridge", age: "6 years",
    recommendedAction: "Monitor cable stay tension under seasonal wind loads. Schedule bi-annual structural review.",
    groundMovement: [
      { year: "2019", displacement: 0.5 }, { year: "2020", displacement: 0.9 }, { year: "2021", displacement: 1.4 },
      { year: "2022", displacement: 1.9 }, { year: "2023", displacement: 2.5 }, { year: "2024", displacement: 3.1 }, { year: "2025", displacement: 3.7 },
    ],
    riskFactors: bridgeRiskFactors(42, 65, 50, 55),
  },
  {
    id: "BR-UP-006", type: "Bridge", location: "Noida–Agra Corridor", riskScore: 54, status: "Warning",
    lat: 28.4089, lng: 77.5040, name: "Yamuna Expressway Bridge Segment", age: "12 years",
    recommendedAction: "Heavy freight traffic observed. Inspect expansion joints and bearing pads quarterly.",
    groundMovement: [
      { year: "2019", displacement: 0.4 }, { year: "2020", displacement: 0.7 }, { year: "2021", displacement: 1.1 },
      { year: "2022", displacement: 1.5 }, { year: "2023", displacement: 2.0 }, { year: "2024", displacement: 2.6 }, { year: "2025", displacement: 3.1 },
    ],
    riskFactors: bridgeRiskFactors(35, 72, 45, 48),
  },
  {
    id: "BR-DL-007", type: "Bridge", location: "Delhi", riskScore: 38, status: "Stable",
    lat: 28.6629, lng: 77.2611, name: "Old Yamuna Bridge", age: "158 years",
    recommendedAction: "Heritage structure — continue annual corrosion and load monitoring. Restrict heavy vehicles.",
    groundMovement: [
      { year: "2019", displacement: 0.3 }, { year: "2020", displacement: 0.4 }, { year: "2021", displacement: 0.6 },
      { year: "2022", displacement: 0.8 }, { year: "2023", displacement: 1.0 }, { year: "2024", displacement: 1.2 }, { year: "2025", displacement: 1.4 },
    ],
    riskFactors: bridgeRiskFactors(22, 55, 30, 35),
  },
  {
    id: "TN-DL-004", type: "Tunnel", location: "New Delhi", riskScore: 52, status: "Warning",
    lat: 28.6130, lng: 77.2420, name: "Pragati Maidan Tunnel", age: "2 years",
    recommendedAction: "Monitor waterproofing integrity during monsoon. Check ventilation system performance quarterly.",
    groundMovement: [
      { year: "2019", displacement: 0.0 }, { year: "2020", displacement: 0.0 }, { year: "2021", displacement: 0.0 },
      { year: "2022", displacement: 0.1 }, { year: "2023", displacement: 0.2 }, { year: "2024", displacement: 0.4 }, { year: "2025", displacement: 0.6 },
    ],
    riskFactors: tunnelRiskFactors(35, 48, 55, 30),
  },
  {
    id: "TN-DL-005", type: "Tunnel", location: "Central Delhi", riskScore: 30, status: "Stable",
    lat: 28.6304, lng: 77.2177, name: "Delhi Metro Underground Tunnel", age: "22 years",
    recommendedAction: "All parameters nominal. Continue regular vibration and seepage monitoring.",
    groundMovement: [
      { year: "2019", displacement: 0.1 }, { year: "2020", displacement: 0.2 }, { year: "2021", displacement: 0.3 },
      { year: "2022", displacement: 0.3 }, { year: "2023", displacement: 0.4 }, { year: "2024", displacement: 0.5 }, { year: "2025", displacement: 0.5 },
    ],
    riskFactors: tunnelRiskFactors(18, 22, 40, 20),
  },
  {
    id: "DM-HR-004", type: "Dam", location: "Yamunanagar, Haryana", riskScore: 55, status: "Warning",
    lat: 30.3295, lng: 77.3047, name: "Hathnikund Barrage", age: "25 years",
    recommendedAction: "Monitor sluice gate mechanisms. Schedule silt level and flow capacity assessment before monsoon.",
    groundMovement: [
      { year: "2019", displacement: 0.6 }, { year: "2020", displacement: 0.9 }, { year: "2021", displacement: 1.3 },
      { year: "2022", displacement: 1.7 }, { year: "2023", displacement: 2.2 }, { year: "2024", displacement: 2.7 }, { year: "2025", displacement: 3.1 },
    ],
    riskFactors: damRiskFactors(50, 58, 35, 45),
  },
  {
    id: "DM-DL-005", type: "Dam", location: "Delhi–Noida Border", riskScore: 52, status: "Warning",
    lat: 28.5450, lng: 77.3050, name: "Okhla Barrage", age: "38 years",
    recommendedAction: "Aging barrage — monitor water flow regulation and structural stress during peak discharge.",
    groundMovement: [
      { year: "2019", displacement: 0.5 }, { year: "2020", displacement: 0.8 }, { year: "2021", displacement: 1.1 },
      { year: "2022", displacement: 1.5 }, { year: "2023", displacement: 1.9 }, { year: "2024", displacement: 2.3 }, { year: "2025", displacement: 2.7 },
    ],
    riskFactors: damRiskFactors(48, 55, 30, 52),
  },
  {
    id: "BL-DL-004", type: "Building", location: "New Delhi", riskScore: 25, status: "Stable",
    lat: 28.6213, lng: 77.2381, name: "Supreme Court of India", age: "66 years",
    recommendedAction: "Heritage structure in good condition. Continue annual facade and foundation inspection.",
    groundMovement: [
      { year: "2019", displacement: 0.1 }, { year: "2020", displacement: 0.2 }, { year: "2021", displacement: 0.2 },
      { year: "2022", displacement: 0.3 }, { year: "2023", displacement: 0.3 }, { year: "2024", displacement: 0.4 }, { year: "2025", displacement: 0.4 },
    ],
    riskFactors: buildingRiskFactors(14, 15, 18, 22),
  },
  {
    id: "BL-DL-005", type: "Building", location: "New Delhi", riskScore: 22, status: "Stable",
    lat: 28.6143, lng: 77.1996, name: "Rashtrapati Bhavan", age: "95 years",
    recommendedAction: "Heritage monument — all systems nominal. Continue heritage preservation monitoring.",
    groundMovement: [
      { year: "2019", displacement: 0.1 }, { year: "2020", displacement: 0.1 }, { year: "2021", displacement: 0.2 },
      { year: "2022", displacement: 0.2 }, { year: "2023", displacement: 0.3 }, { year: "2024", displacement: 0.3 }, { year: "2025", displacement: 0.3 },
    ],
    riskFactors: buildingRiskFactors(10, 12, 15, 20),
  },
  {
    id: "BL-UP-006", type: "Building", location: "Greater Noida, Uttar Pradesh", riskScore: 50, status: "Warning",
    lat: 28.6129, lng: 77.3910, name: "Gaur City Mall Tower", age: "8 years",
    recommendedAction: "Monitor foundation settlement in alluvial soil. Schedule annual structural audit.",
    groundMovement: [
      { year: "2019", displacement: 0.3 }, { year: "2020", displacement: 0.5 }, { year: "2021", displacement: 0.8 },
      { year: "2022", displacement: 1.1 }, { year: "2023", displacement: 1.5 }, { year: "2024", displacement: 1.9 }, { year: "2025", displacement: 2.3 },
    ],
    riskFactors: buildingRiskFactors(38, 45, 35, 28),
  },
];

const defaultAlertMessages: Record<string, string> = {
  "Chenab Rail Bridge": "High seismic activity detected — structural displacement exceeds safety threshold",
  "Godavari Rail Bridge": "Structural age 97 years — load-bearing capacity at critical threshold",
  "Hirakud Dam": "Reservoir pressure anomaly — dam safety review overdue, monsoon load increasing",
  "Bandra–Worli Sea Link": "Cable tension anomaly during monsoon wind loads — inspection recommended",
  "Nashri Tunnel": "Geological pressure rising in landslide-prone section — drainage reinforcement needed",
  "Howrah Bridge": "Corrosion rate accelerating — heavy vehicle load stress approaching limits",
  "Signature Bridge": "Cable stay tension variance detected — seasonal wind load monitoring advised",
  "Pragati Maidan Tunnel": "Minor waterproofing seepage reported — monsoon preparedness check recommended",
};

// ─── Work Orders ──────────────────────────────────────────────────────────────

export type WorkOrderStatus = "Open" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
export type WorkOrderPriority = "Low" | "Medium" | "High" | "Critical";
export type WorkOrderType = "Inspection" | "Preventive Maintenance" | "Emergency Repair";

export interface WorkOrder {
  id: string;                        // e.g. "WO-2026-001"
  title: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  infrastructureId: string;          // links to InfrastructureItem.id
  alertId?: number;                  // optional link to Alert.id
  assignedTeam: string;
  dueDate: string;                   // ISO date string
  createdAt: string;                 // ISO date string
  estimatedCost: number;             // in INR lakhs
}

export const TEAMS = [
  "Bridge Maintenance Team",
  "Dam Safety Division",
  "Tunnel Inspection Unit",
  "Structural Assessment Cell",
  "Emergency Response Squad",
  "Geotechnical Survey Team",
] as const;

const defaultWorkOrders: WorkOrder[] = [
  {
    id: "WO-2026-001",
    title: "Seismic Bearing Inspection – Chenab Rail Bridge",
    description: "Inspect arch bearings and seismic isolators following displacement spike. Cross-check with continuous SHM data logs.",
    type: "Emergency Repair",
    status: "In Progress",
    priority: "Critical",
    infrastructureId: "BR-JK-001",
    alertId: 1,
    assignedTeam: "Bridge Maintenance Team",
    dueDate: "2026-07-25",
    createdAt: "2026-07-18",
    estimatedCost: 42.5,
  },
  {
    id: "WO-2026-002",
    title: "Full Load-Bearing Assessment – Godavari Rail Bridge",
    description: "Complete structural assessment of 97-year-old bridge. Evaluate load-bearing capacity and recommend decommissioning schedule if required.",
    type: "Inspection",
    status: "Assigned",
    priority: "Critical",
    infrastructureId: "BR-AP-001",
    alertId: 2,
    assignedTeam: "Structural Assessment Cell",
    dueDate: "2026-07-28",
    createdAt: "2026-07-19",
    estimatedCost: 88.0,
  },
  {
    id: "WO-2026-003",
    title: "Dam Safety Review – Hirakud Dam",
    description: "Conduct full dam safety audit including reservoir pressure analysis and structural stress mapping. Monsoon load approaching design limits.",
    type: "Inspection",
    status: "Open",
    priority: "Critical",
    infrastructureId: "DM-OD-001",
    alertId: 3,
    assignedTeam: "Dam Safety Division",
    dueDate: "2026-08-01",
    createdAt: "2026-07-20",
    estimatedCost: 125.0,
  },
  {
    id: "WO-2026-004",
    title: "Cable Tension Monitoring – Bandra–Worli Sea Link",
    description: "Deploy tension monitoring sensors on main cable stays. Calibrate under monsoon wind load conditions. Schedule underwater pier inspection.",
    type: "Preventive Maintenance",
    status: "Assigned",
    priority: "High",
    infrastructureId: "BR-MH-001",
    alertId: 4,
    assignedTeam: "Bridge Maintenance Team",
    dueDate: "2026-08-05",
    createdAt: "2026-07-20",
    estimatedCost: 31.2,
  },
  {
    id: "WO-2026-005",
    title: "Drainage Reinforcement – Nashri Tunnel Section C",
    description: "Reinforce drainage channels and anchor systems in Section C. Inspect lining cracks and apply epoxy grouting. Landslide risk zone.",
    type: "Emergency Repair",
    status: "In Progress",
    priority: "High",
    infrastructureId: "TN-JK-002",
    alertId: 5,
    assignedTeam: "Tunnel Inspection Unit",
    dueDate: "2026-07-30",
    createdAt: "2026-07-17",
    estimatedCost: 56.8,
  },
  {
    id: "WO-2026-006",
    title: "Corrosion Survey – Howrah Bridge",
    description: "Ultrasonic thickness gauging across primary steel members. Assess corrosion rate and recommend protective coating application schedule.",
    type: "Inspection",
    status: "Open",
    priority: "High",
    infrastructureId: "BR-WB-001",
    alertId: 6,
    assignedTeam: "Structural Assessment Cell",
    dueDate: "2026-08-10",
    createdAt: "2026-07-20",
    estimatedCost: 18.5,
  },
  {
    id: "WO-2026-007",
    title: "Quarterly Geological Pressure Check – Pir Panjal Tunnel",
    description: "Routine quarterly inspection of geological pressure indicators in all tunnel sections. Special focus on Section C seepage patterns.",
    type: "Preventive Maintenance",
    status: "Completed",
    priority: "Medium",
    infrastructureId: "TN-JK-001",
    assignedTeam: "Tunnel Inspection Unit",
    dueDate: "2026-07-15",
    createdAt: "2026-07-01",
    estimatedCost: 9.4,
  },
  {
    id: "WO-2026-008",
    title: "Spillway Gate Mechanism Service – Sardar Sarovar Dam",
    description: "Lubricate and test all spillway gate actuators. Measure silt accumulation at intake channels and clear debris before monsoon peak.",
    type: "Preventive Maintenance",
    status: "Completed",
    priority: "Medium",
    infrastructureId: "DM-GJ-001",
    assignedTeam: "Dam Safety Division",
    dueDate: "2026-07-10",
    createdAt: "2026-06-25",
    estimatedCost: 14.0,
  },
  {
    id: "WO-2026-009",
    title: "Waterproofing Seepage Repair – Pragati Maidan Tunnel",
    description: "Locate and seal waterproofing membrane breaches identified during monsoon monitoring. Test ventilation system performance post-repair.",
    type: "Preventive Maintenance",
    status: "Open",
    priority: "Medium",
    infrastructureId: "TN-DL-004",
    alertId: 8,
    assignedTeam: "Tunnel Inspection Unit",
    dueDate: "2026-08-12",
    createdAt: "2026-07-20",
    estimatedCost: 22.7,
  },
  {
    id: "WO-2026-010",
    title: "Cable Stay Tension Variance Review – Signature Bridge",
    description: "Annual structural review focusing on cable stay tension readings. Cross-reference with seasonal wind load data from last 12 months.",
    type: "Inspection",
    status: "Open",
    priority: "Medium",
    infrastructureId: "BR-DL-005",
    alertId: 7,
    assignedTeam: "Bridge Maintenance Team",
    dueDate: "2026-08-15",
    createdAt: "2026-07-20",
    estimatedCost: 11.5,
  },
  {
    id: "WO-2026-011",
    title: "Seepage & Stress Analysis – Bhakra Nangal Dam",
    description: "Comprehensive seepage and stress evaluation for aging dam infrastructure. Install new piezometer array in downstream slope.",
    type: "Inspection",
    status: "Assigned",
    priority: "Medium",
    infrastructureId: "DM-HP-001",
    assignedTeam: "Geotechnical Survey Team",
    dueDate: "2026-08-20",
    createdAt: "2026-07-19",
    estimatedCost: 33.6,
  },
  {
    id: "WO-2026-012",
    title: "Expansion Joint Inspection – Yamuna Expressway Bridge",
    description: "Quarterly inspection of all expansion joints and bearing pads. Document settlement progression and flagging any misalignment.",
    type: "Preventive Maintenance",
    status: "Completed",
    priority: "Low",
    infrastructureId: "BR-UP-006",
    assignedTeam: "Bridge Maintenance Team",
    dueDate: "2026-07-05",
    createdAt: "2026-06-20",
    estimatedCost: 6.2,
  },
];

export const infrastructureList: InfrastructureItem[] = [];
export const initialWorkOrders: WorkOrder[] = [];

export interface Alert {
  id: number;
  infrastructure: string;
  level: "Critical" | "Warning";
  message: string;
}

export const GENERIC_ALERT_MESSAGES: Record<string, Record<"Critical" | "Warning", string>> = {
  Bridge: {
    Critical: "Immediate structural inspection required — critical risk threshold exceeded.",
    Warning: "Elevated risk detected — structural inspection recommended.",
  },
  Tunnel: {
    Critical: "Immediate tunnel safety inspection required — critical conditions detected.",
    Warning: "Elevated risk detected — tunnel condition monitoring advised.",
  },
  Dam: {
    Critical: "Urgent dam safety review required — critical risk parameters exceeded.",
    Warning: "Elevated risk detected — dam safety monitoring recommended.",
  },
  Building: {
    Critical: "Immediate structural assessment required — critical risk level detected.",
    Warning: "Elevated risk detected — building structural review advised.",
  },
};

export function resolveAlertLevel(asset: InfrastructureItem): "Critical" | "Warning" | null {
  const byScore: "Critical" | "Warning" | null =
    asset.riskScore >= 85 ? "Critical" : asset.riskScore >= 70 ? "Warning" : null;

  const byStatus: "Critical" | "Warning" | null =
    asset.status === "Critical" ? "Critical" : asset.status === "Warning" ? "Warning" : null;

  if (byScore === "Critical" || byStatus === "Critical") return "Critical";
  if (byScore === "Warning" || byStatus === "Warning") return "Warning";
  return null;
}

export function resolveAlertMessage(asset: InfrastructureItem, level: "Critical" | "Warning"): string {
  return (
    defaultAlertMessages[asset.name] ??
    GENERIC_ALERT_MESSAGES[asset.type]?.[level] ??
    `${level} risk conditions detected — inspection recommended.`
  );
}

export function deriveAlerts(assets: InfrastructureItem[]): Alert[] {
  let counter = 1;
  const result: Alert[] = [];
  const activeWorkOrders = typeof window !== "undefined" ? getStoredWorkOrders() : [];

  for (const asset of assets) {
    const level = resolveAlertLevel(asset);
    if (!level) continue;

    // Treat Work Orders with status Open, Assigned, or In Progress as active.
    // If an active Work Order exists for that asset, do not display the alert.
    const hasActiveWO = activeWorkOrders.some(
      (wo) =>
        wo.infrastructureId === asset.id &&
        (wo.status === "Open" || wo.status === "Assigned" || wo.status === "In Progress")
    );
    if (hasActiveWO) continue;

    result.push({
      id: counter++,
      infrastructure: asset.name,
      level,
      message: resolveAlertMessage(asset, level),
    });
  }
  return result;
}


export const getStoredAssets = (): InfrastructureItem[] => {
  if (typeof window === "undefined" || !window.localStorage) {
    return initialAssets;
  }
  const stored = localStorage.getItem("infrascan_assets");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse assets", e);
    }
  }
  try {
    localStorage.setItem("infrascan_assets", JSON.stringify(initialAssets));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
  return initialAssets;
};

export const saveStoredAssets = (assets: InfrastructureItem[]) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem("infrascan_assets", JSON.stringify(assets));
    
    // Sync infrastructureList reference
    infrastructureList.length = 0;
    infrastructureList.push(...assets);
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
};

export const getStoredWorkOrders = (): WorkOrder[] => {
  if (typeof window === "undefined" || !window.localStorage) {
    return defaultWorkOrders;
  }
  const stored = localStorage.getItem("infrascan_work_orders");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse work orders", e);
    }
  }
  try {
    localStorage.setItem("infrascan_work_orders", JSON.stringify(defaultWorkOrders));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
  return defaultWorkOrders;
};

export const saveStoredWorkOrders = (orders: WorkOrder[]) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem("infrascan_work_orders", JSON.stringify(orders));
    
    // Sync initialWorkOrders reference
    initialWorkOrders.length = 0;
    initialWorkOrders.push(...orders);
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
};

// Initialize once when module loads in browser
if (typeof window !== "undefined") {
  const loadedAssets = getStoredAssets();
  infrastructureList.push(...loadedAssets);
  initialWorkOrders.push(...getStoredWorkOrders());
} else {
  infrastructureList.push(...initialAssets);
  initialWorkOrders.push(...defaultWorkOrders);
}



