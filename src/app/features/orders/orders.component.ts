import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order } from '../../core/models/entities';
import { OrderDetailModalService } from '../../core/services/order-detail-modal.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, StatusChipComponent, CurrencyPipe, DatePipe],
  template: `
    <div class="page-header"><i class="bi bi-cart-check fs-4"></i><h2 class="section-title">Pedidos</h2></div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-12"><label class="form-label">Buscar</label><input class="form-control" [(ngModel)]="filter" /></div>
      </div>
    </div>

    <div class="glass-card p-3 mb-3">
      @if (loading) { <div class="empty-state">Cargando...</div> }
      @else if (!paged.length) { <div class="empty-state">Sin pedidos.</div> }
      @else {
      <div class="table-responsive d-none d-lg-block">
        <table class="table table-hover align-middle">
          <thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Facturación</th><th></th></tr></thead>
          <tbody>
            @for (o of paged; track o.id) {
              <tr>
                <td>{{ o.id }}</td>
                <td>{{ customerName(o.customerId) }}</td>
                <td>{{ o.totalUSD | currency: 'USD' }}</td>
                <td><app-status-chip [status]="o.status" /></td>
                <td>{{ o.invoiceSimulatedAt ? (o.invoiceSimulatedAt | date: 'd/M/y h:mm a') : 'Pendiente' }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="openDetail(o)"><i class="bi bi-eye"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="remove(o.id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="mobile-list d-lg-none">
        @for (o of paged; track o.id) {
          <div class="mobile-list-card">
            <div class="mobile-list-title d-flex justify-content-between align-items-start gap-2">
              <span>{{ o.id }}</span>
              <app-status-chip [status]="o.status" />
            </div>
            <div class="mobile-list-kv">
              <div><span>Cliente</span><strong>{{ customerName(o.customerId) }}</strong></div>
              <div><span>Total</span><strong>{{ o.totalUSD | currency: 'USD' }}</strong></div>
              <div><span>Facturación</span><span>{{ o.invoiceSimulatedAt ? (o.invoiceSimulatedAt | date: 'd/M/y h:mm a') : 'Pendiente' }}</span></div>
            </div>
            <div class="mobile-list-actions">
              <button class="btn btn-sm btn-outline-primary" (click)="openDetail(o)"><i class="bi bi-eye me-1"></i>Ver</button>
              <button class="btn btn-sm btn-outline-danger" (click)="remove(o.id)"><i class="bi bi-trash me-1"></i>Eliminar</button>
            </div>
          </div>
        }
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-secondary">Página {{ page }} de {{ totalPages }}</small>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary" [disabled]="page===1" (click)="page=page-1">Anterior</button>
          <button class="btn btn-sm btn-outline-secondary" [disabled]="page===totalPages" (click)="page=page+1">Siguiente</button>
        </div>
      </div>
      }
    </div>
  `
})
export class OrdersComponent {
  loading = true;
  filter = '';
  page = 1;
  pageSize = 10;

  constructor(
    private readonly store: SessionStoreService,
    private readonly orderModal: OrderDetailModalService
  ) {
    setTimeout(() => (this.loading = false), 300);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  get rows(): Order[] {
    const q = this.normalize(this.filter);
    if (!q) return this.store.snapshot.orders;

    return this.store.snapshot.orders.filter((o) => {
      const customer = this.store.snapshot.customers.find((c) => c.id === o.customerId);
      const shipment = this.store.snapshot.shipments.find((s) => s.orderId === o.id);
      const carrier = shipment ? this.store.snapshot.carriers.find((c) => c.id === shipment.carrierId) : undefined;

      const haystack = this.normalize(
        [
          o.id,
          o.status,
          o.totalUSD.toString(),
          new Date(o.promisedAt).toLocaleDateString('es-CR'),
          customer?.legalName || '',
          customer?.contactName || '',
          customer?.companyEmail || '',
          carrier?.name || '',
          shipment?.id || ''
        ].join(' ')
      );
      return haystack.includes(q);
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paged(): Order[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  remove(id: string): void {
    this.store.updateState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id), orderTimeline: s.orderTimeline.filter((t) => t.orderId !== id) }));
  }

  openDetail(order: Order): void {
    this.orderModal.open(order.id);
  }

  customerName(customerId: string): string {
    return this.store.snapshot.customers.find((c) => c.id === customerId)?.legalName || 'N/A';
  }
}
