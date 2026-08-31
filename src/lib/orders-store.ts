import {
  createCustomerOrder,
  getAllOrders,
  getCustomerOrders,
  updateCustomerOrderStatus,
} from "./db/app-service";

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
  size: string;
  targetGroup: "Men";
};

export function getOrders(scope: "customer" | "all" = "customer"): Promise<Order[]> {
  return scope === "all" ? getAllOrders() : getCustomerOrders();
}

export async function placeOrder(orderData: Omit<Order, "id" | "date" | "status">): Promise<Order> {
  const result = await createCustomerOrder({
    data: {
      shippingName: orderData.shippingName,
      shippingAddress: orderData.shippingAddress,
      shippingPhone: orderData.shippingPhone,
      items: [orderData],
    },
  });
  if (!result.success) throw new Error("Order could not be created.");
  const orders = await getCustomerOrders();
  const created = orders.find((order) => order.id === result.orderId);
  if (!created) throw new Error("Order was created but could not be loaded.");
  return created;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  await updateCustomerOrderStatus({ data: { orderId, status } });
  return true;
}
