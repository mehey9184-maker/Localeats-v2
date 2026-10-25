import { Order } from "../types";
import { createInitialDemoOrder, DEMO_SHOP, INITIAL_DEMO_ORDER_ID } from "./demoData";

export type DemoRole = "customer" | "vendor";
export type DemoStep = 
  | "browse_vendors"
  | "view_menu"
  | "add_to_cart"
  | "cart_review"
  | "counter_pickup"
  | "order_submitted"
  | "vendor_terminal"
  | "order_preparing"
  | "order_ready";

interface DemoState {
  isActive: boolean;
  role: DemoRole;
  step: DemoStep;
  order: Order | null;
  history: string[];
}

const STORAGE_KEY_ACTIVE = "localeats_demo_active";
const STORAGE_KEY_ORDER = "localeats_demo_order";
const STORAGE_KEY_ROLE = "localeats_demo_role";

class DemoStore {
  private state: DemoState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const isUrlDemo = typeof window !== "undefined" && (
      window.location.search.includes("demo=true") || 
      window.location.search.includes("demo=1") ||
      window.location.search.includes("mode=demo")
    );

    const savedActive = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(STORAGE_KEY_ACTIVE) === "true" : false;
    const isActive = isUrlDemo || savedActive;

    let savedOrder: Order | null = null;
    if (typeof sessionStorage !== "undefined") {
      const orderJson = sessionStorage.getItem(STORAGE_KEY_ORDER);
      if (orderJson) {
        try {
          savedOrder = JSON.parse(orderJson);
        } catch (_) {}
      }
    }

    const savedRole = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(STORAGE_KEY_ROLE) : null) as DemoRole | null;

    this.state = {
      isActive,
      role: savedRole === "vendor" ? "vendor" : "customer",
      step: savedOrder ? (savedOrder.status === "ready" ? "order_ready" : savedOrder.status === "preparing" ? "order_preparing" : "order_submitted") : "browse_vendors",
      order: savedOrder,
      history: []
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("DemoStore notify error:", err);
      }
    });
  }

  public getState(): DemoState {
    return { ...this.state };
  }

  public setDemoMode(active: boolean) {
    this.state.isActive = active;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY_ACTIVE, active ? "true" : "false");
    }
    if (!active) {
      this.resetDemo();
    }
    this.notify();
  }

  public setRole(role: DemoRole) {
    this.state.role = role;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY_ROLE, role);
    }
    this.notify();
  }

  public setStep(step: DemoStep) {
    this.state.step = step;
    this.notify();
  }

  public submitDemoOrder(customOrder?: Partial<Order>): Order {
    const base = createInitialDemoOrder("pending");
    const newOrder: Order = {
      ...base,
      ...customOrder,
      id: customOrder?.id || INITIAL_DEMO_ORDER_ID,
      created_at: new Date().toISOString(),
      status: "pending",
      is_delivery: false,
      order_type: "collection",
      delivery_status: "pending"
    };

    this.state.order = newOrder;
    this.state.step = "order_submitted";
    this.state.history.push(`Order submitted at ${new Date().toLocaleTimeString()}`);

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(newOrder));
    }
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(status: "pending" | "preparing" | "ready" | "completed") {
    if (!this.state.order) {
      this.state.order = createInitialDemoOrder(status === "completed" ? "ready" : status);
    } else {
      this.state.order = {
        ...this.state.order,
        status: status,
        delivery_status: status === "ready" ? "ready" : status === "preparing" ? "preparing" : "pending",
        owner_message: status === "preparing" 
          ? "Soweto Kota King is grilling your patties and golden chips!" 
          : status === "ready" 
          ? "Your Executive Kota is wrapped and waiting at the counter!" 
          : undefined
      };
    }

    if (status === "preparing") {
      this.state.step = "order_preparing";
    } else if (status === "ready") {
      this.state.step = "order_ready";
    }

    this.state.history.push(`Status changed to ${status} at ${new Date().toLocaleTimeString()}`);

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(this.state.order));
    }
    this.notify();
  }

  public resetDemo() {
    this.state.order = null;
    this.state.role = "customer";
    this.state.step = "browse_vendors";
    this.state.history = [];
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY_ORDER);
      sessionStorage.removeItem(STORAGE_KEY_ROLE);
    }
    this.notify();
  }
}

export const demoStore = new DemoStore();
