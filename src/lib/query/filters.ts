import { isAfter, isBefore, parseISO } from "date-fns";
import type { Customer, Order } from "../data/types";
import type { QueryFilters } from "./types";

export function filterOrders(
  orders: Order[],
  customers: Customer[],
  filters?: QueryFilters,
): Order[] {
  if (!filters) return orders;

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const planSet = filters.plans?.length ? new Set(filters.plans) : null;

  return orders.filter((order) => {
    if (filters.regions?.length && !filters.regions.includes(order.region)) {
      return false;
    }
    if (
      filters.categories?.length &&
      !filters.categories.includes(order.category)
    ) {
      return false;
    }
    if (filters.channels?.length && !filters.channels.includes(order.channel)) {
      return false;
    }
    if (planSet) {
      const plan = customerMap.get(order.customerId)?.plan;
      if (!plan || !planSet.has(plan)) return false;
    }
    if (filters.dateFrom) {
      const from = parseISO(filters.dateFrom);
      if (isBefore(parseISO(order.orderDate), from)) return false;
    }
    if (filters.dateTo) {
      const to = parseISO(filters.dateTo);
      if (isAfter(parseISO(order.orderDate), to)) return false;
    }
    return true;
  });
}
