import { Shop, MenuItem, Order } from "../types";

export const DEMO_SHOP: Shop = {
  id: "shop-soweto-01",
  name: "Soweto Kota King (Vilakazi)",
  description: "Award-winning legendary gourmet Kotas, chips, atchar and township grills.",
  location: "8287 Vilakazi St, Orlando West, Soweto",
  address: "8287 Vilakazi St, Orlando West, Soweto",
  category: "Kota",
  rating: 4.9,
  reviewCount: 328,
  prepTime: "10-15 min",
  isOpen: true,
  opening_time: "08:00",
  closing_time: "22:00",
  phone: "+27 11 936 1024",
  latitude: -26.2378,
  longitude: 27.9056,
  logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400",
  images: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800"
  ],
  cash_trust_enabled: true,
  allow_external_riders: false,
  auto_look_for_rider: false,
  menu: [
    {
      id: "item-sk-01",
      name: "The Executive Kota (Full House)",
      price: 85.00,
      displayPrice: "R85.00",
      description: "Quarter loaf loaded with golden slap chips, Russian sausage, spiced beef patty, fried egg, double cheese, polony & special atchar.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
      category: "Kotas",
      is_available: true,
      customizations: [
        {
          id: "extra-cheese",
          name: "Extra Cheddar Slice",
          price: 10.00
        },
        {
          id: "extra-atchar",
          name: "Hot Mango Atchar",
          price: 5.00
        }
      ]
    },
    {
      id: "item-sk-02",
      name: "Vilakazi Classic Kota",
      price: 55.00,
      displayPrice: "R55.00",
      description: "Fresh quarter bread with crispy slap chips, smoked Vienna, polony, melted cheddar and mild mango atchar.",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600",
      category: "Kotas",
      is_available: true,
      customizations: []
    }
  ]
};

export const DEMO_CUSTOMER = {
  name: "Thabo Mokoena",
  phone: "+27 82 555 0192",
  email: "thabo.mokoena@localmail.co.za",
  address: "Vilakazi Street, Orlando West, Soweto",
  city: "Johannesburg"
};

export const INITIAL_DEMO_ORDER_ID = "DEMO-KOTA-8092";

export function createInitialDemoOrder(status: "pending" | "preparing" | "ready" = "pending"): Order {
  return {
    id: INITIAL_DEMO_ORDER_ID,
    user_id: "demo-customer-thabo",
    shop_id: DEMO_SHOP.id,
    customer_name: DEMO_CUSTOMER.name,
    phone: DEMO_CUSTOMER.phone,
    email: DEMO_CUSTOMER.email,
    city: DEMO_CUSTOMER.city,
    address: DEMO_SHOP.address,
    country: "South Africa",
    product_name: "The Executive Kota (Full House)",
    product_variant: "Quarter Loaf • Slap Chips • Russian • Beef Patty • Egg • Double Cheese",
    quantity: 1,
    price: 85.00,
    total_price: 85.00,
    total_amount: 85.00,
    items: [
      {
        id: "item-sk-01",
        name: "The Executive Kota (Full House)",
        price: 85.00,
        quantity: 1,
        shopId: DEMO_SHOP.id,
        specialInstructions: "Extra crispy slap chips and mild atchar please!"
      }
    ],
    notes: "Extra crispy slap chips and mild atchar please! Will pay cash at counter.",
    delivery_instructions: "Counter Collection @ Soweto Kota King (Vilakazi)",
    status: status,
    is_delivery: false,
    order_type: "collection",
    delivery_status: status === "ready" ? "ready" : status === "preparing" ? "preparing" : "pending",
    payment_method: "cash",
    created_at: new Date().toISOString(),
    special_instructions: "Collection order for promotional video demonstration"
  };
}
