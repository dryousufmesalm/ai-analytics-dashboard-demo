import { addDays, formatISO, subDays } from "date-fns";
import type {
  Channel,
  Customer,
  Dataset,
  Order,
  Plan,
  Product,
  ProductCategory,
  Region,
} from "./types";
import { createSeededRandom, intBetween, pick } from "./seeded-random";

const REGIONS: Region[] = ["North America", "Europe", "APAC", "LATAM"];
const CHANNELS: Channel[] = ["web", "mobile", "marketplace"];
const PLANS: Plan[] = ["free", "pro", "enterprise"];
const CATEGORIES: ProductCategory[] = [
  "Analytics",
  "Automation",
  "Commerce",
  "Support",
];

const PRODUCT_NAMES: Record<ProductCategory, string[]> = {
  Analytics: ["Pulse BI", "Metric Forge", "Insight Lane"],
  Automation: ["Flow Pilot", "Task Weaver", "Trigger Stack"],
  Commerce: ["Cart Lift", "Checkout Pro", "Catalog Sync"],
  Support: ["Help Desk AI", "Ticket Router", "Chat Resolve"],
};

export function generateDataset(seed = 42): Dataset {
  const rand = createSeededRandom(seed);
  const end = new Date("2026-10-01T12:00:00.000Z");
  const start = subDays(end, 364);

  const products: Product[] = [];
  let productIndex = 0;
  for (const category of CATEGORIES) {
    for (const name of PRODUCT_NAMES[category]) {
      products.push({
        id: `prod-${++productIndex}`,
        name,
        category,
        unitPrice: intBetween(rand, 29, 499),
      });
    }
  }

  const customers: Customer[] = Array.from({ length: 320 }, (_, i) => {
    const signupOffset = intBetween(rand, 0, 400);
    return {
      id: `cust-${i + 1}`,
      name: `Customer ${i + 1}`,
      plan: pick(rand, PLANS),
      region: pick(rand, REGIONS),
      signupDate: formatISO(subDays(end, signupOffset), { representation: "date" }),
    };
  });

  const customerById = new Map(customers.map((c) => [c.id, c]));
  const orders: Order[] = [];

  for (let day = 0; day <= 364; day++) {
    const date = addDays(start, day);
    const dailyOrders = intBetween(rand, 8, 28);
    for (let o = 0; o < dailyOrders; o++) {
      const customer = pick(rand, customers);
      const product = pick(rand, products);
      const quantity = intBetween(rand, 1, 5);
      const planMultiplier =
        customer.plan === "enterprise" ? 1.35 : customer.plan === "pro" ? 1.15 : 1;
      const revenue = Math.round(
        product.unitPrice * quantity * planMultiplier * (0.85 + rand() * 0.3),
      );
      orders.push({
        id: `ord-${orders.length + 1}`,
        orderDate: formatISO(date, { representation: "date" }),
        customerId: customer.id,
        productId: product.id,
        quantity,
        revenue,
        region: customer.region,
        channel: pick(rand, CHANNELS),
        category: product.category,
      });
    }
  }

  // Tie-break: ensure each region appears in orders
  for (const region of REGIONS) {
    if (!orders.some((o) => o.region === region)) {
      const customer = customers.find((c) => c.region === region) ?? customers[0];
      const product = products[0];
      orders.push({
        id: `ord-${orders.length + 1}`,
        orderDate: formatISO(end, { representation: "date" }),
        customerId: customer.id,
        productId: product.id,
        quantity: 1,
        revenue: product.unitPrice,
        region,
        channel: "web",
        category: product.category,
      });
    }
  }

  return {
    products,
    customers: customers.filter((c) => customerById.has(c.id)),
    orders,
    generatedAt: end.toISOString(),
  };
}
