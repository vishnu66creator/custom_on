export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled";

export type Order = {
  id: string;
  customerName: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  date: string;
  status: OrderStatus;
  productName: string;
  shirtColor: string;
  shirtColorName: string;
  customText: string;
  customTextColor: string;
  customTextFont: string;
  customTextSize: number;
  customImage: string | null;
  totalPrice: number;
};

const STORAGE_KEY = "customon:orders";

// Add some default initial mock orders so the dashboard looks loaded and alive upon first view!
const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-9481",
    customerName: "Jane Miller",
    shippingName: "Jane Miller",
    shippingAddress: "492 Oak Lane, San Francisco, CA 94102",
    shippingPhone: "555-0192",
    date: "2026-06-29T14:32:00.000Z",
    status: "Processing",
    productName: "Boxy Fit Heavyweight Tee",
    shirtColor: "#0A0A0A",
    shirtColorName: "Black",
    customText: "CREATIVE SPIRIT",
    customTextColor: "#FF5F1F",
    customTextFont: "'Plus Jakarta Sans', sans-serif",
    customTextSize: 32,
    customImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%230A0A0A" /><circle cx="50" cy="50" r="42" fill="none" stroke="%23FF5F1F" stroke-width="2" /><path d="M 25,50 A 25,25 0 0,1 75,50 Z" fill="%23FF5F1F" /><line x1="22" y1="54" x2="78" y2="54" stroke="%230A0A0A" stroke-width="2" /><line x1="25" y1="58" x2="75" y2="58" stroke="%230A0A0A" stroke-width="2" /><line x1="30" y1="62" x2="70" y2="62" stroke="%230A0A0A" stroke-width="2" /><path d="M 28,68 Q 39,64 50,68 T 72,68" fill="none" stroke="%23FF5F1F" stroke-width="2" /><path d="M 32,74 Q 41,70 50,74 T 68,74" fill="none" stroke="%23FF5F1F" stroke-width="2" /><text x="50" y="32" fill="%23FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="1">CALIFORNIA</text><text x="50" y="85" fill="%23FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" font-weight="bold" text-anchor="middle" letter-spacing="2">WEST COAST</text></svg>`,
    totalPrice: 28
  },
  {
    id: "ORD-8271",
    customerName: "Liam Carter",
    shippingName: "Liam Carter",
    shippingAddress: "128 Pine St, Seattle, WA 98101",
    shippingPhone: "555-4820",
    date: "2026-06-28T09:15:00.000Z",
    status: "Pending",
    productName: "The Essential Hoodie",
    shirtColor: "#FFFFFF",
    shirtColorName: "White",
    customText: "OUTDOOR VIBES",
    customTextColor: "#0A0A0A",
    customTextFont: "Georgia, serif",
    customTextSize: 42,
    customImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="50,28 72,68 28,68" fill="none" stroke="%230A0A0A" stroke-width="2" /><polygon points="62,42 78,68 46,68" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><circle cx="38" cy="38" r="6" fill="%23FF5F1F" /><line x1="33" y1="68" x2="33" y2="58" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="30,59 36,59 33,53" fill="%230A0A0A" /><line x1="67" y1="68" x2="67" y2="60" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="65,61 69,61 67,56" fill="%230A0A0A" /><line x1="20" y1="68" x2="80" y2="68" stroke="%230A0A0A" stroke-width="2" /><text x="50" y="80" fill="%230A0A0A" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="2">WILDERNESS</text></svg>`,
    totalPrice: 45
  }
];

export function getOrders(): Order[] {
  if (typeof window === "undefined") return DEFAULT_ORDERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with default mock orders if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load orders from localStorage", e);
    return DEFAULT_ORDERS;
  }
}

export function placeOrder(orderData: Omit<Order, "id" | "date" | "status">): Order {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${randomNum}`,
    date: new Date().toISOString(),
    status: "Pending"
  };

  if (typeof window !== "undefined") {
    try {
      const current = getOrders();
      const updated = [newOrder, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save order to localStorage", e);
    }
  }

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getOrders();
    const index = current.findIndex((o) => o.id === orderId);
    if (index === -1) return false;

    current[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (e) {
    console.error("Failed to update order status in localStorage", e);
    return false;
  }
}
