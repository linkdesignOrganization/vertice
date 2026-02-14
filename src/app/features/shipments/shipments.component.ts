import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Shipment } from '../../core/models/entities';
import { SessionStoreService } from '../../core/services/session-store.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [StatusChipComponent],
  template: `
    <div class="page-header"><i class="bi bi-truck fs-4"></i><h2 class="section-title">Despachos</h2></div>

    <div class="glass-card p-3">
      <h6 class="fw-bold"><i class="bi bi-list-ul me-1"></i>Cola de despachos</h6>
      @if (loading) {
        <div class="empty-state">Cargando...</div>
      } @else if (!store.snapshot.shipments.length) {
        <div class="empty-state">Sin despachos.</div>
      } @else {
        <ul class="list-group list-group-flush d-none d-lg-block">
          @for (sh of paged; track sh.id) {
            <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center gap-2">
              <div>
                <div class="fw-semibold">{{ sh.id }}</div>
                <div class="small text-secondary">Pedido {{ sh.orderId }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <app-status-chip [status]="sh.status" />
                <button class="btn btn-sm btn-outline-primary" (click)="openDetail(sh)"><i class="bi bi-sliders me-1"></i>Completar</button>
              </div>
            </li>
          }
        </ul>

        <div class="mobile-list d-lg-none">
          @for (sh of paged; track sh.id) {
            <div class="mobile-list-card">
              <div class="mobile-list-title">{{ sh.id }}</div>
              <div class="mobile-list-kv">
                <div><span>Pedido</span><span>{{ sh.orderId }}</span></div>
                <div><span>Estado</span><app-status-chip [status]="sh.status" /></div>
              </div>
              <div class="mobile-list-actions">
                <button class="btn btn-sm btn-outline-primary" (click)="openDetail(sh)"><i class="bi bi-sliders me-1"></i>Llenar despacho</button>
              </div>
            </div>
          }
        </div>

        <div class="d-flex justify-content-between align-items-center mt-2">
          <small class="text-secondary">Página {{ page }} de {{ totalPages }}</small>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary" [disabled]="page === 1" (click)="page = page - 1">Anterior</button>
            <button class="btn btn-sm btn-outline-secondary" [disabled]="page === totalPages" (click)="page = page + 1">Siguiente</button>
          </div>
        </div>
      }
    </div>
  `
})
export class ShipmentsComponent {
  loading = true;
  page = 1;
  pageSize = 10;

  constructor(
    public readonly store: SessionStoreService,
    private readonly router: Router
  ) {
    setTimeout(() => (this.loading = false), 300);
  }

  get rows(): Shipment[] {
    return this.store.snapshot.shipments;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paged(): Shipment[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  openDetail(shipment: Shipment): void {
    this.router.navigate(['/dashboard/despachos', shipment.id]);
  }
}
