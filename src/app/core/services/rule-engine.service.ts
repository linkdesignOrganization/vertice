import { Injectable } from '@angular/core';
import { Order, OrderStatus, Shipment, ShipmentStatus, Transfer, TransferStatus } from '../models/entities';
import { AuditService } from './audit.service';
import { SessionStoreService } from './session-store.service';
import { UiFeedbackService } from './ui-feedback.service';

@Injectable({ providedIn: 'root' })
export class RuleEngineService {
  constructor(
    private readonly store: SessionStoreService,
    private readonly audit: AuditService,
    private readonly feedback: UiFeedbackService
  ) {}

  acceptQuoteCreateOrder(quoteId: string): void {
    const state = this.store.snapshot;
    const quote = state.quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    const orderId = `SO-2026-${String(state.orders.length + 1).padStart(4, '0')}`;
    const order: Order = {
      id: orderId,
      sourceQuoteId: quote.id,
      customerId: quote.customerId,
      responsibleId: quote.sellerId,
      status: 'Aprobado',
      createdAt: new Date().toISOString(),
      promisedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      subtotalUSD: quote.subtotalUSD,
      taxUSD: quote.taxUSD,
      totalUSD: quote.totalUSD
    };

    this.store.updateState((s) => ({
      ...s,
      quotes: s.quotes.map((q) =>
        q.id === quote.id
          ? {
              ...q,
              status: 'Convertida a pedido',
              convertedOrderId: orderId
            }
          : q
      ),
      orders: [order, ...s.orders],
      orderTimeline: [
        {
          id: `T-${Date.now()}`,
          orderId,
          label: 'Pedido creado automáticamente por cotización aceptada',
          timestamp: new Date().toISOString()
        },
        ...s.orderTimeline
      ]
    }));

    this.audit.add({ entityType: 'Quote', entityId: quote.id, action: 'CONVERT', fromState: 'Aceptada', toState: 'Convertida a pedido', summary: `Cotización ${quote.id} convertida a ${orderId}` });
    this.feedback.push(`Cotización ${quote.id} convertida a pedido ${orderId}`, 'Cotizaciones', 'success');
  }

  updateOrderStatus(orderId: string, nextStatus: OrderStatus): void {
    const order = this.store.snapshot.orders.find((o) => o.id === orderId);
    if (!order) return;
    const timestamp = new Date().toISOString();

    this.store.updateState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus, invoiceSimulatedAt: nextStatus === 'Despachado' ? timestamp : o.invoiceSimulatedAt } : o)),
      orderTimeline: [
        { id: `T-${Date.now()}-A`, orderId, label: `Estado actualizado: ${nextStatus}`, timestamp },
        ...(nextStatus === 'Despachado' ? [{ id: `T-${Date.now()}-B`, orderId, label: 'Facturación emitida (simulada)', timestamp }] : []),
        ...s.orderTimeline
      ]
    }));

    this.audit.add({ entityType: 'Order', entityId: orderId, action: 'STATUS_CHANGE', fromState: order.status, toState: nextStatus, summary: `Pedido ${orderId} -> ${nextStatus}` });
  }

  updateShipmentStatus(shipment: Shipment, nextStatus: ShipmentStatus, pod?: { signature: string; photo: string; deliveredByName: string }): boolean {
    if (nextStatus === 'Recogida' && (!pod?.signature || !pod?.photo || !pod.deliveredByName.trim())) {
      this.feedback.push('POD incompleto: firma, foto guía y nombre son obligatorios', 'Despachos', 'warning');
      return false;
    }

    const updated: Shipment = {
      ...shipment,
      status: nextStatus,
      deliveredByName: pod?.deliveredByName || shipment.deliveredByName,
      podSignatureDataUrl: pod?.signature || shipment.podSignatureDataUrl,
      podGuidePhotoDataUrl: pod?.photo || shipment.podGuidePhotoDataUrl
    };

    this.store.upsertShipment(updated);
    this.audit.add({ entityType: 'Shipment', entityId: shipment.id, action: 'STATUS_CHANGE', fromState: shipment.status, toState: nextStatus, summary: `Despacho ${shipment.id} -> ${nextStatus}` });
    return true;
  }

  updateTransferStatus(transfer: Transfer, nextStatus: TransferStatus): void {
    this.store.upsertTransfer({ ...transfer, status: nextStatus });

    if (nextStatus === 'Recibida') {
      this.store.updateState((s) => {
        const from = s.stock.find((st) => st.locationId === transfer.fromLocationId && st.skuId === transfer.skuId);
        const to = s.stock.find((st) => st.locationId === transfer.toLocationId && st.skuId === transfer.skuId);
        return {
          ...s,
          stock: s.stock.map((st) => {
            if (from && st.id === from.id) return { ...st, qtyOnHand: Math.max(0, st.qtyOnHand - transfer.qty) };
            if (to && st.id === to.id) return { ...st, qtyOnHand: st.qtyOnHand + transfer.qty };
            return st;
          })
        };
      });
    }

    this.audit.add({ entityType: 'Transfer', entityId: transfer.id, action: 'STATUS_CHANGE', fromState: transfer.status, toState: nextStatus, summary: `Transferencia ${transfer.id} -> ${nextStatus}` });
  }
}
