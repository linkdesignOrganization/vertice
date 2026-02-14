export type LoginRole = 'MASTER' | 'OPERADOR';
export type ActorType = 'VENDEDOR' | 'INTERNO' | LoginRole;

export type QuoteStatus =
  | 'Borrador'
  | 'En revisión'
  | 'Aprobada'
  | 'Enviada'
  | 'Aceptada'
  | 'Rechazada'
  | 'Expirada'
  | 'Convertida a pedido';

export type OrderStatus = 'Borrador' | 'Aprobado' | 'En preparación' | 'Despachado' | 'Entregado' | 'Cerrado';
export type ShipmentStatus = 'Pendiente' | 'Transportista' | 'Recogida';
export type TransferStatus = 'Programada' | 'En traslado' | 'Recibida';
export type ReturnStatus = 'Solicitado' | 'Nota de crédito';

export type SkuFamily =
  | 'EPP'
  | 'Caídas'
  | 'Instrumentos'
  | 'Señalización'
  | 'Derrames/Químicos'
  | 'Consumibles mantenimiento';

export interface User {
  id: string;
  username: string;
  password: string;
  loginRole?: LoginRole;
  actorType: ActorType;
  displayName: string;
  active: boolean;
}

export interface Customer {
  id: string;
  legalName: string;
  contactName: string;
  companyEmail: string;
  contactPosition: string;
  sellerId: string;
  priceList: 'Retail' | 'Empresa' | 'Mayorista';
  paymentTerm: 'Contado' | 'Net 15' | 'Net 30';
  taxPct: number;
}

export interface Carrier {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'BODEGA' | 'TIENDA';
}

export interface Sku {
  id: string;
  code: string;
  family: SkuFamily;
  name: string;
  estimatedCostUSD: number;
  salePriceUSD: number;
  minStock: number;
}

export interface StockByLocation {
  id: string;
  skuId: string;
  locationId: string;
  qtyOnHand: number;
  qtyReserved: number;
}

export interface QuoteLine {
  id: string;
  quoteId: string;
  skuId: string;
  qty: number;
  unitPriceUSD: number;
  discountPct: number;
  lineMarginPct: number;
  requiresApproval: boolean;
}

export interface Quote {
  id: string;
  customerId: string;
  sellerId: string;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string;
  estimatedMarginPct: number;
  subtotalUSD: number;
  taxUSD: number;
  totalUSD: number;
  convertedOrderId?: string;
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  label: string;
  timestamp: string;
}

export interface Order {
  id: string;
  sourceQuoteId?: string;
  customerId: string;
  responsibleId: string;
  status: OrderStatus;
  createdAt: string;
  promisedAt: string;
  invoiceSimulatedAt?: string;
  subtotalUSD: number;
  taxUSD: number;
  totalUSD: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrierId: string;
  status: ShipmentStatus;
  deliveredByName?: string;
  podSignatureDataUrl?: string;
  podGuidePhotoDataUrl?: string;
}

export interface Transfer {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  status: TransferStatus;
  skuId: string;
  qty: number;
  createdAt: string;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  status: ReturnStatus;
  reason: string;
  createdAt: string;
  creditNoteNumber?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  fromState?: string;
  toState?: string;
  summary: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  customers: Customer[];
  carriers: Carrier[];
  locations: Location[];
  skus: Sku[];
  stock: StockByLocation[];
  quotes: Quote[];
  quoteLines: QuoteLine[];
  orders: Order[];
  orderTimeline: OrderTimelineEvent[];
  shipments: Shipment[];
  transfers: Transfer[];
  returns: ReturnRecord[];
  audit: AuditEvent[];
}
