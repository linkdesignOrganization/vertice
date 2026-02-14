import {
  AppState,
  AuditEvent,
  Carrier,
  Customer,
  Location,
  Order,
  OrderTimelineEvent,
  Quote,
  QuoteLine,
  ReturnRecord,
  Shipment,
  Sku,
  StockByLocation,
  Transfer,
  User
} from '../models/entities';

const families = ['EPP', 'Caídas', 'Instrumentos', 'Señalización', 'Derrames/Químicos', 'Consumibles mantenimiento'] as const;

const discountLimits: Record<string, number> = {
  EPP: 12,
  Caídas: 10,
  Instrumentos: 8,
  Señalización: 15,
  'Derrames/Químicos': 14,
  'Consumibles mantenimiento': 18
};

const priceLists: Customer['priceList'][] = ['Retail', 'Empresa', 'Mayorista'];
const paymentTerms: Customer['paymentTerm'][] = ['Contado', 'Net 15', 'Net 30'];
const contactPositions = ['Jefe de Compras', 'Encargado de Bodega', 'Coordinador de Seguridad', 'Supervisor de Operaciones', 'Analista de Abastecimiento'];
const spanishContactNames = [
  'Carlos Jimenez', 'Maria Fernanda Rojas', 'Jose Luis Vargas', 'Andrea Solano', 'David Chacon', 'Sofia Mendez', 'Luis Diego Mora', 'Valeria Araya',
  'Esteban Salas', 'Paula Cordero', 'Juan Pablo Urena', 'Daniela Nunez', 'Sergio Camacho', 'Natalia Alfaro', 'Ricardo Villalobos', 'Camila Calderon',
  'Diego Quesada', 'Gabriela Montero', 'Alejandro Herrera', 'Karla Pineda', 'Fernando Chaves', 'Laura Porras', 'Adrian Soto', 'Melissa Acuna',
  'Oscar Barrantes', 'Jimena Castillo', 'Marco Brenes', 'Patricia Segura', 'Ruben Aguilar', 'Carolina Cespedes', 'Gerardo Leiva', 'Vanessa Matarrita',
  'Pablo Rivas', 'Monica Valverde', 'Ivan Gonzalez', 'Lisbeth Madrigal', 'Roberto Solis', 'Diana Rojas', 'Mauricio Alvarado', 'Daniela Arias',
  'Jorge Ugalde', 'Silvia Murillo', 'Kenneth Jimenez', 'Yessenia Campos', 'Bryan Ramirez', 'Ana Lucia Paniagua', 'Miguel Fallas', 'Claudia Montoya',
  'Ronald Granados', 'Katherine Viquez', 'Gustavo Carvajal', 'Priscila Chinchilla', 'Raul Navarro', 'Veronica Arce', 'Hector Varela', 'Noelia Arias',
  'Allan Coto', 'Mariana Chavarria', 'Wilbert Mora', 'Fiorella Salazar', 'Enrique Esquivel', 'Paola Leiton', 'Erick Angulo', 'Yadira Vega',
  'Julio Alvarado'
];
const companyNames = [
  'Proveedora Industrial Andina', 'Seguridad Integral Pacifico', 'Distribuidora Tecnica Centro', 'Suministros de Proteccion Heredia', 'Equipos Industriales del Norte',
  'Soluciones Operativas del Este', 'Abastecimiento Tecnico Cartago', 'Comercializadora Segura Alajuela', 'Sistemas de Seguridad Metropolitana', 'Logistica Industrial Avance',
  'Insumos Tecnicos Nacionales', 'Proteccion y Riesgo Controlado', 'Distribuciones Altura Segura', 'Servicios Industriales Brunca', 'Suministros Tecnicos Atlantico',
  'Seguridad Empresarial Central', 'Abasto Profesional de Costa Rica', 'Equipos de Seguridad del Valle', 'Comercial Tactica Industrial', 'Red de Insumos del Pacifico',
  'Proveedora Integral de Occidente', 'Soluciones de Campo y Planta', 'Central de Equipos EPP', 'Linea Segura Corporativa', 'Insumos de Operacion Continua',
  'Punto Industrial San Jose', 'Cobertura Tecnica Empresarial', 'Gestion de Seguridad y Stock', 'Servicios de Proteccion Total', 'Centro Logistico de Equipos',
  'Distribuidora de Seguridad Costa', 'Tecnica de Abastecimiento Empresarial', 'Surtidora de EPP y Alturas', 'Operaciones Industriales del Sur', 'Proveduria Tecnica del Norte',
  'Seguridad Comercial de Cartago', 'Insumos Integrales de Bodega', 'Soporte Industrial Alianza', 'Proveedora Delta Industrial', 'Abasto Seguro del Caribe',
  'Comercial de Proteccion Activa', 'Equipamiento Tecnico Regional', 'Seguridad de Planta y Campo', 'Surtidora Ejecutiva Industrial', 'Distribucion Segura del Centro',
  'Proveeduria Avanzada de Seguridad', 'Soluciones Industriales Prisma', 'Punto de Abasto y Proteccion', 'Gestion Integral de Insumos', 'Sistemas y Seguridad Logistica',
  'Estrategia Industrial de Compras', 'Red de Equipos y Proteccion', 'Cobertura Empresarial Tecnica', 'Suministros Profesionales de Planta', 'Canal Seguro Industrial',
  'Comercial Atlas de Seguridad', 'Operadora de Insumos Industriales', 'Surtido Tecnico del Valle Central', 'Plataforma de Seguridad Aplicada', 'Proveedora Horizonte Industrial',
  'Distribuidora Union de Equipos', 'Abastecimiento Seguro Nacional', 'Soluciones de Seguridad Vanguardia', 'Red Integral de Proteccion', 'Equipos y Seguridad Empresarial'
];
const productNames = [
  'Casco dieléctrico clase E',
  'Arnés de cuerpo completo 5 puntos',
  'Línea de vida retráctil 6 m',
  'Eslinga doble con absorbedor',
  'Bloque retráctil para trabajo en altura',
  'Detector multigás portátil',
  'Luxómetro digital industrial',
  'Termómetro infrarrojo de seguridad',
  'Medidor de ruido sonómetro',
  'Multímetro TRMS industrial',
  'Cono de seguridad reflectivo 70 cm',
  'Cinta demarcadora amarillo/negro',
  'Señal de salida de emergencia fotoluminiscente',
  'Baliza LED recargable de advertencia',
  'Cadena plástica de señalización',
  'Kit absorbente para derrames industriales',
  'Almohadilla absorbente universal',
  'Barrera absorbente para hidrocarburos',
  'Neutralizador de químicos derramados',
  'Contenedor para residuos peligrosos',
  'Guantes nitrilo resistentes a químicos',
  'Guantes anticorte nivel 5',
  'Lentes de seguridad antiempañante',
  'Respirador media cara con filtros',
  'Protector auditivo tipo copa',
  'Botas de seguridad punta de acero',
  'Chaleco reflectivo alta visibilidad',
  'Rodillera industrial ergonómica',
  'Faja lumbar de soporte',
  'Mascarilla N95 certificada'
];

function pad(n: number): string {
  return n.toString().padStart(4, '0');
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mailHandle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function randomDateInCurrentMonthIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const maxDay = Math.max(1, now.getDate());
  const day = randomInt(1, maxDay);
  const hour = randomInt(7, 20);
  const minute = randomInt(0, 59);
  const second = randomInt(0, 59);
  const date = new Date(year, month, day, hour, minute, second, 0);

  if (date.getTime() > now.getTime()) {
    date.setTime(now.getTime() - randomInt(5, 180) * 60 * 1000);
  }

  return date.toISOString();
}

export function createSeedState(): AppState {
  const users: User[] = [
    { id: 'U-0001', username: 'master', password: 'master', loginRole: 'MASTER', actorType: 'MASTER', displayName: 'Usuario Gerencia', active: true },
    { id: 'U-0002', username: 'operador', password: 'master', loginRole: 'OPERADOR', actorType: 'OPERADOR', displayName: 'Usuario Operador', active: true }
  ];

  for (let i = 3; i <= 12; i += 1) {
    users.push({ id: `U-${pad(i)}`, username: `vendedor${i - 2}`, password: 'N/A', actorType: 'VENDEDOR', displayName: `Vendedor ${i - 2}`, active: true });
  }
  for (let i = 13; i <= 20; i += 1) {
    users.push({ id: `U-${pad(i)}`, username: `interno${i - 12}`, password: 'N/A', actorType: 'INTERNO', displayName: `Interno ${i - 12}`, active: true });
  }

  const sellers = users.filter((u) => u.actorType === 'VENDEDOR');

  const customers: Customer[] = Array.from({ length: 65 }, (_, i) => {
    const legalName = companyNames[i];
    const emailDomain = mailHandle(legalName);
    const topDomain = i % 2 === 0 ? 'com' : 'cr';
    return {
      id: `C-${pad(i + 1)}`,
      legalName,
      contactName: spanishContactNames[i],
      companyEmail: `compras@${emailDomain}.${topDomain}`,
      contactPosition: contactPositions[i % contactPositions.length],
      sellerId: sellers[i % sellers.length].id,
      priceList: priceLists[i % priceLists.length],
      paymentTerm: paymentTerms[i % paymentTerms.length],
      taxPct: 13
    };
  });

  const carriers: Carrier[] = [
    { id: 'CAR-0001', name: 'Transportes Tico 1' },
    { id: 'CAR-0002', name: 'Ruta Segura 2' },
    { id: 'CAR-0003', name: 'Logística Centro 3' }
  ];

  const locations: Location[] = [
    { id: 'LOC-001', name: 'Centro Logístico San José', type: 'BODEGA' },
    { id: 'LOC-002', name: 'Bodega Secundaria Alajuela', type: 'BODEGA' },
    { id: 'LOC-003', name: 'Tienda San José', type: 'TIENDA' },
    { id: 'LOC-004', name: 'Tienda Cartago', type: 'TIENDA' },
    { id: 'LOC-005', name: 'Tienda Alajuela', type: 'TIENDA' },
    { id: 'LOC-006', name: 'Tienda Heredia', type: 'TIENDA' }
  ];

  const skus: Sku[] = Array.from({ length: 300 }, (_, i) => {
    const family = families[i % families.length];
    const cost = randomInt(8, 250);
    const sale = Math.round(cost * (1.25 + (i % 4) * 0.1));
    const baseName = productNames[i % productNames.length];
    return {
      id: `SKU-${pad(i + 1)}`,
      code: `VSI-${pad(i + 1)}`,
      family,
      name: `${baseName} ${Math.floor(i / productNames.length) + 1}`,
      estimatedCostUSD: cost,
      salePriceUSD: sale,
      minStock: randomInt(15, 60)
    };
  });

  const stock: StockByLocation[] = [];
  skus.forEach((sku, idx) => {
    const spreadCount = 2 + (idx % 4);
    const shuffledLocations = [...locations].sort((a, b) => (a.id + sku.id).localeCompare(b.id + sku.code));
    const activeLocationIds = new Set(shuffledLocations.slice(0, spreadCount).map((l) => l.id));

    locations.forEach((location) => {
      const isActive = activeLocationIds.has(location.id);
      const qtyOnHand = isActive ? randomInt(8, 180) : 0;
      const qtyReserved = qtyOnHand > 0 ? randomInt(0, Math.min(20, qtyOnHand)) : 0;
      stock.push({
        id: `STK-${location.id}-${sku.id}`,
        skuId: sku.id,
        locationId: location.id,
        qtyOnHand,
        qtyReserved
      });
    });
  });

  const quotes: Quote[] = [];
  const quoteLines: QuoteLine[] = [];
  const quoteStatuses: Quote['status'][] = [
    'Borrador',
    'En revisión',
    'Aprobada',
    'Enviada',
    'Aceptada',
    'Rechazada',
    'Expirada',
    'Convertida a pedido'
  ];
  const currentYear = new Date().getFullYear();

  for (let i = 1; i <= 6; i += 1) {
    const customer = customers[(i - 1) % customers.length];
    const status = quoteStatuses[(i - 1) % 4];
    const createdAt = randomDateInCurrentMonthIso();
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 30);
    const quoteId = `Q-${currentYear}-${pad(i)}`;

    let subtotal = 0;
    const linesCount = randomInt(2, 5);
    for (let l = 0; l < linesCount; l += 1) {
      const sku = skus[(i * 7 + l * 11) % skus.length];
      const qty = randomInt(1, 10);
      const max = discountLimits[sku.family];
      const discountPct = randomInt(0, max + 5);
      const requiresApproval = discountPct > max;
      const lineNet = qty * sku.salePriceUSD * (1 - discountPct / 100);
      subtotal += lineNet;
      quoteLines.push({
        id: `QL-${quoteId}-${l + 1}`,
        quoteId,
        skuId: sku.id,
        qty,
        unitPriceUSD: sku.salePriceUSD,
        discountPct,
        lineMarginPct: Math.round(((lineNet / qty - sku.estimatedCostUSD) / (lineNet / qty)) * 100),
        requiresApproval
      });
    }

    const taxUSD = subtotal * 0.13;
    quotes.push({
      id: quoteId,
      customerId: customer.id,
      sellerId: customer.sellerId,
      status,
      createdAt,
      expiresAt: expiresAt.toISOString(),
      estimatedMarginPct: randomInt(8, 35),
      subtotalUSD: Math.round(subtotal),
      taxUSD: Math.round(taxUSD),
      totalUSD: Math.round(subtotal + taxUSD)
    });
  }

  const orders: Order[] = [];
  const orderTimeline: OrderTimelineEvent[] = [];
  const orderStatuses: Order['status'][] = ['Borrador', 'Aprobado', 'En preparación', 'Despachado', 'Entregado', 'Cerrado'];

  for (let i = 1; i <= 165; i += 1) {
    const customer = customers[(i + 5) % customers.length];
    const createdAt = daysAgo(randomInt(1, 280));
    const promisedDate = new Date(createdAt);
    promisedDate.setDate(promisedDate.getDate() + randomInt(2, 14));

    const active = i <= 45;
    const status = active ? orderStatuses[i % 4] : orderStatuses[2 + (i % 4)];
    const orderId = `SO-2026-${pad(i)}`;
    const subtotal = randomInt(250, 4000);
    const tax = Math.round(subtotal * 0.13);
    const invoiceSimulatedAt = status === 'Despachado' || status === 'Entregado' || status === 'Cerrado' ? daysAgo(randomInt(0, 40)) : undefined;

    orders.push({
      id: orderId,
      customerId: customer.id,
      responsibleId: customer.sellerId,
      status,
      createdAt,
      promisedAt: promisedDate.toISOString(),
      invoiceSimulatedAt,
      subtotalUSD: subtotal,
      taxUSD: tax,
      totalUSD: subtotal + tax
    });

    orderTimeline.push({ id: `T-${orderId}-1`, orderId, label: 'Pedido creado', timestamp: createdAt });
    orderTimeline.push({ id: `T-${orderId}-2`, orderId, label: `Estado actualizado: ${status}`, timestamp: daysAgo(randomInt(0, 120)) });
    if (invoiceSimulatedAt) {
      orderTimeline.push({ id: `T-${orderId}-3`, orderId, label: 'Facturación emitida (simulada)', timestamp: invoiceSimulatedAt });
    }
  }

  const shipments: Shipment[] = [];
  for (let i = 1; i <= 140; i += 1) {
    const active = i <= 35;
    const statuses: Shipment['status'][] = ['Pendiente', 'Transportista', 'Recogida'];
    const status = active ? statuses[i % statuses.length] : 'Recogida';
    shipments.push({
      id: `SH-2026-${pad(i)}`,
      orderId: orders[i % orders.length].id,
      carrierId: carriers[i % carriers.length].id,
      status,
      deliveredByName: status === 'Transportista' || status === 'Recogida' ? `Responsable ${i}` : undefined,
      podSignatureDataUrl: status === 'Transportista' || status === 'Recogida' ? 'data:image/png;base64,simulada' : undefined,
      podGuidePhotoDataUrl: status === 'Transportista' || status === 'Recogida' ? 'data:image/png;base64,simulada' : undefined
    });
  }

  const transfers: Transfer[] = [];
  for (let i = 1; i <= 60; i += 1) {
    const status: Transfer['status'] = i <= 10 ? (['Programada', 'En traslado', 'Recibida'][i % 3] as Transfer['status']) : 'Recibida';
    transfers.push({
      id: `TR-2026-${pad(i)}`,
      fromLocationId: locations[i % locations.length].id,
      toLocationId: locations[(i + 1) % locations.length].id,
      status,
      skuId: skus[i % skus.length].id,
      qty: randomInt(2, 20),
      createdAt: daysAgo(randomInt(1, 180))
    });
  }

  const returns: ReturnRecord[] = [];
  for (let i = 1; i <= 25; i += 1) {
    const status: ReturnRecord['status'] = i <= 5 ? (i % 2 === 0 ? 'Solicitado' : 'Nota de crédito') : 'Nota de crédito';
    returns.push({
      id: `RT-2026-${pad(i)}`,
      orderId: orders[(i * 3) % orders.length].id,
      status,
      reason: `Motivo ${i}`,
      createdAt: daysAgo(randomInt(1, 120)),
      creditNoteNumber: status === 'Nota de crédito' ? `NC-2026-${pad(i)}` : undefined
    });
  }

  const audit: AuditEvent[] = [];
  for (let i = 1; i <= 2200; i += 1) {
    const entityType = ['Quote', 'Order', 'Shipment', 'Transfer', 'Return'][i % 5];
    const entityId =
      entityType === 'Quote'
        ? quotes[i % quotes.length].id
        : entityType === 'Order'
          ? orders[i % orders.length].id
          : entityType === 'Shipment'
            ? shipments[i % shipments.length].id
            : entityType === 'Transfer'
              ? transfers[i % transfers.length].id
              : returns[i % returns.length].id;

    audit.push({
      id: `AUD-${pad(i)}`,
      timestamp: daysAgo(randomInt(0, 320)),
      userId: users[i % users.length].id,
      entityType,
      entityId,
      action: 'UPDATE',
      summary: `Evento de auditoría #${i}`
    });
  }

  return {
    users,
    currentUser: null,
    customers,
    carriers,
    locations,
    skus,
    stock,
    quotes,
    quoteLines,
    orders,
    orderTimeline,
    shipments,
    transfers,
    returns,
    audit
  };
}
