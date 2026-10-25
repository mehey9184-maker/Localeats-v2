export interface ClipDefinition {
  id: string;
  clipNumber: number;
  title: string;
  subtitle: string;
  filename: string;
  durationSeconds: number;
  fps: number;
  synthesiaPlacement: string;
  description: string;
  keyHighlights: string[];
}

export interface DemoOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shopName: string;
  shopAddress: string;
  itemName: string;
  itemDescription: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderType: 'collection';
  paymentMethod: string;
  status: 'pending' | 'preparing' | 'ready';
}

export interface RenderedClip {
  id: string;
  clipNumber: number;
  filename: string;
  blob: Blob;
  url: string;
  durationSeconds: number;
  sizeBytes: number;
  width: number;
  height: number;
  mimeType: string;
  timestamp: number;
}

export type StudioTab = 'studio' | 'readme' | 'inspect';
