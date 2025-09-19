import { PartOrder } from '../types';

export const seedData: PartOrder[] = [
  {
    id: "po_001",
    orderNumber: "ORD-001",
    storeName: "Downtown Brake Supply",
    storeLocation: "Austin, TX",
    createdAt: 1695019200000,
    status: "READY_FOR_PICKUP",
    items: [
      { 
        id: "poi_1", 
        partNumber: "BP-1234", 
        name: "Brake Pads Front", 
        units: 1, 
        status: "READY_FOR_PICKUP", 
        orderId: "po_001", 
        jobId: "j1" 
      },
      { 
        id: "poi_2", 
        partNumber: "RT-8899", 
        name: "Rotor Left", 
        units: 1, 
        status: "READY_FOR_PICKUP", 
        orderId: "po_001", 
        jobId: "j1" 
      }
    ]
  },
  {
    id: "po_002",
    orderNumber: "ORD-002",
    storeName: "Central Auto Parts",
    storeLocation: "Houston, TX",
    createdAt: 1695105600000,
    status: "READY_FOR_PICKUP",
    items: [
      { 
        id: "poi_3", 
        partNumber: "BP-5678", 
        name: "Brake Pads Rear", 
        units: 2, 
        status: "READY_FOR_PICKUP", 
        orderId: "po_002", 
        jobId: "j2" 
      },
      { 
        id: "poi_4", 
        partNumber: "CL-9900", 
        name: "Brake Caliper", 
        units: 1, 
        status: "READY_FOR_PICKUP", 
        orderId: "po_002", 
        jobId: "j2" 
      }
    ]
  },
  {
    id: "po_003",
    orderNumber: "ORD-003",
    storeName: "Downtown Brake Supply",
    storeLocation: "Austin, TX",
    createdAt: 1695105600000,
    status: "PICKED_UP",
    items: [
      { 
        id: "poi_5", 
        partNumber: "BP-9999", 
        name: "Brake Pads Premium", 
        units: 1, 
        status: "PICKED_UP", 
        orderId: "po_003", 
        jobId: "j3" 
      }
    ]
  },
  {
    id: "po_004",
    orderNumber: "ORD-004",
    storeName: "Eastside Brake Parts",
    storeLocation: "Austin, TX",
    createdAt: 1695192000000,
    status: "READY_FOR_RETURN",
    items: [
      { 
        id: "poi_6", 
        partNumber: "RT-9900", 
        name: "Rotor Right", 
        units: 1, 
        status: "READY_FOR_RETURN", 
        orderId: "po_004", 
        jobId: "j4" 
      },
      { 
        id: "poi_7", 
        partNumber: "BP-1111", 
        name: "Brake Pads Standard", 
        units: 2, 
        status: "PICKED_UP", 
        orderId: "po_004", 
        jobId: "j4" 
      }
    ]
  },
  {
    id: "po_005",
    orderNumber: "ORD-005",
    storeName: "Northside Auto Supply",
    storeLocation: "Dallas, TX",
    createdAt: 1695278400000,
    status: "RETURNED",
    items: [
      { 
        id: "poi_8", 
        partNumber: "FL-5555", 
        name: "Brake Fluid DOT4", 
        units: 1, 
        status: "RETURNED", 
        orderId: "po_005", 
        jobId: "j5" 
      }
    ]
  }
];
