import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppState, Order, OrderTimelineEvent, Quote, ReturnRecord, Shipment, Transfer } from '../models/entities';
import { createSeedState } from '../seeds/demo-seed';

const STORAGE_KEY = 'vs_demo_state';

@Injectable({ providedIn: 'root' })
export class SessionStoreService {
  private readonly stateSubject = new BehaviorSubject<AppState>(this.loadState());
  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): AppState {
    return this.stateSubject.value;
  }

  private loadState(): AppState {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppState;
    const needsCustomerMigration = parsed.customers.some(
      (c) =>
        !c.contactName ||
        !c.companyEmail ||
        !c.contactPosition ||
        c.legalName.startsWith('Cliente ') ||
        c.companyEmail.includes('-') ||
        c.companyEmail.includes('.co.cr')
    );
    const masterUser = parsed.users.find((u) => u.username === 'master');
    const operadorUser = parsed.users.find((u) => u.username === 'operador');
    const needsAuthMigration = !masterUser || !operadorUser || masterUser.password !== 'master' || operadorUser.password !== 'master';
    const needsSkuMigration = parsed.skus.some((s) => s.name.includes('Item '));
    const needsStockDistributionMigration = parsed.stock.every((s) => s.qtyOnHand > 0);
    const needsReturnStatusMigration = parsed.returns.some((r) => {
      const legacyStatus = String((r as { status?: unknown }).status || '');
      return legacyStatus === 'Aprobado' || legacyStatus === 'Nota de crédito emitida';
    });
    const needsQuoteMigration = parsed.quotes.length >= 100;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const needsQuoteRecencyMigration = parsed.quotes.some((q) => {
      const created = new Date(q.createdAt);
      return Number.isNaN(created.getTime()) || created.getFullYear() !== currentYear || created.getMonth() !== currentMonth;
    });
    const validShipmentStatuses = new Set(['Pendiente', 'Transportista', 'Recogida']);
    const needsShipmentStatusMigration = parsed.shipments.some((s) => !validShipmentStatuses.has(String(s.status)));
    if (
      needsCustomerMigration ||
      needsAuthMigration ||
      needsSkuMigration ||
      needsStockDistributionMigration ||
      needsReturnStatusMigration ||
      needsQuoteMigration ||
      needsQuoteRecencyMigration ||
      needsShipmentStatusMigration
    ) {
      const seed = createSeedState();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  }

  updateState(mutator: (state: AppState) => AppState): void {
    const next = mutator(this.snapshot);
    this.stateSubject.next(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  resetDemo(): void {
    const seed = createSeedState();
    this.stateSubject.next(seed);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }

  upsertQuote(quote: Quote): void {
    this.updateState((s) => ({
      ...s,
      quotes: s.quotes.some((q) => q.id === quote.id) ? s.quotes.map((q) => (q.id === quote.id ? quote : q)) : [quote, ...s.quotes]
    }));
  }

  upsertOrder(order: Order): void {
    this.updateState((s) => ({
      ...s,
      orders: s.orders.some((o) => o.id === order.id) ? s.orders.map((o) => (o.id === order.id ? order : o)) : [order, ...s.orders]
    }));
  }

  addTimelineEvent(event: OrderTimelineEvent): void {
    this.updateState((s) => ({ ...s, orderTimeline: [event, ...s.orderTimeline] }));
  }

  upsertShipment(shipment: Shipment): void {
    this.updateState((s) => ({
      ...s,
      shipments: s.shipments.some((sh) => sh.id === shipment.id) ? s.shipments.map((sh) => (sh.id === shipment.id ? shipment : sh)) : [shipment, ...s.shipments]
    }));
  }

  upsertTransfer(transfer: Transfer): void {
    this.updateState((s) => ({
      ...s,
      transfers: s.transfers.some((t) => t.id === transfer.id) ? s.transfers.map((t) => (t.id === transfer.id ? transfer : t)) : [transfer, ...s.transfers]
    }));
  }

  upsertReturn(returnRecord: ReturnRecord): void {
    this.updateState((s) => ({
      ...s,
      returns: s.returns.some((r) => r.id === returnRecord.id) ? s.returns.map((r) => (r.id === returnRecord.id ? returnRecord : r)) : [returnRecord, ...s.returns]
    }));
  }
}
