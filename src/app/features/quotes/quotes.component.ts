import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Quote } from '../../core/models/entities';
import { AuditService } from '../../core/services/audit.service';
import { RuleEngineService } from '../../core/services/rule-engine.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [FormsModule, StatusChipComponent, CurrencyPipe, DatePipe],
  template: `
    <div class="page-header justify-content-between flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-file-earmark-text fs-4"></i>
        <h2 class="section-title">Cotizaciones</h2>
      </div>
      <button class="btn btn-sm btn-primary d-lg-none" (click)="goToCreate()">Nueva +</button>
    </div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-4 col-lg-5"><label class="form-label">Buscar</label><input class="form-control" [(ngModel)]="filter" /></div>
        <div class="col-12 col-md-4 col-lg-3"><label class="form-label">Orden</label><select class="form-select" [(ngModel)]="sortBy"><option value="id">ID</option><option value="createdAt">Fecha</option></select></div>
        <div class="col-12 col-md-4 col-lg-2"><label class="form-label">Dir</label><select class="form-select" [(ngModel)]="sortDir"><option value="asc">Asc</option><option value="desc">Desc</option></select></div>
        <div class="col-lg-2 d-none d-lg-block"><button class="btn btn-primary w-100" (click)="goToCreate()"><i class="bi bi-plus-circle"></i> Crear nueva</button></div>
      </div>
    </div>

    <div class="glass-card p-3">
      @if (loading) {
        <div class="empty-state">Cargando...</div>
      } @else if (!paged.length) {
        <div class="empty-state">No hay cotizaciones.</div>
      } @else {
        <div class="table-responsive d-none d-lg-block">
          <table class="table table-hover align-middle">
            <thead><tr><th>ID</th><th>Fecha</th><th>Total</th><th>Margen</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              @for (q of paged; track q.id) {
                <tr>
                  <td>{{ q.id }}</td>
                  <td>
                    <span class="badge text-bg-light border me-1">{{ q.createdAt | date: 'dd/MM/yy' }}</span>
                    <span class="badge text-bg-secondary">{{ q.createdAt | date: 'h:mm a' }}</span>
                  </td>
                  <td>{{ q.totalUSD | currency: 'USD' }}</td>
                  <td>{{ q.estimatedMarginPct }}%</td>
                  <td><app-status-chip [status]="q.status" /></td>
                  <td class="text-end">
                    @if (canApprove(q)) {
                      <button class="btn btn-sm btn-outline-success me-1" (click)="changeStatus(q, 'Aceptada')"><i class="bi bi-check2"></i></button>
                    }
                    <button class="btn btn-sm btn-outline-warning me-1" (click)="changeStatus(q, 'Rechazada')"><i class="bi bi-x"></i></button>
                    <button class="btn btn-sm btn-outline-danger" (click)="remove(q.id)"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mobile-list d-lg-none">
          @for (q of paged; track q.id) {
            <div class="mobile-list-card">
              <div class="mobile-list-title d-flex justify-content-between align-items-start gap-2">
                <span>{{ q.id }}</span>
                <app-status-chip [status]="q.status" />
              </div>
              <div class="mobile-list-kv">
                <div><span>Fecha</span><span>{{ q.createdAt | date: 'd/M/y h:mm a' }}</span></div>
                <div><span>Total</span><strong>{{ q.totalUSD | currency: 'USD' }}</strong></div>
                <div><span>Margen</span><strong>{{ q.estimatedMarginPct }}%</strong></div>
              </div>
              <div class="mobile-list-actions">
                @if (canApprove(q)) {
                  <button class="btn btn-sm btn-outline-success" (click)="changeStatus(q, 'Aceptada')"><i class="bi bi-check2 me-1"></i>Aceptar</button>
                }
                <button class="btn btn-sm btn-outline-warning" (click)="changeStatus(q, 'Rechazada')"><i class="bi bi-x me-1"></i>Rechazar</button>
                <button class="btn btn-sm btn-outline-danger" (click)="remove(q.id)"><i class="bi bi-trash me-1"></i>Eliminar</button>
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
export class QuotesComponent {
  loading = true;
  filter = '';
  sortBy: 'id' | 'createdAt' = 'id';
  sortDir: 'asc' | 'desc' = 'desc';
  page = 1;
  pageSize = 10;

  constructor(
    private readonly store: SessionStoreService,
    private readonly rules: RuleEngineService,
    private readonly audit: AuditService,
    private readonly router: Router
  ) {
    setTimeout(() => (this.loading = false), 300);
  }

  get rows(): Quote[] {
    const filtered = this.store.snapshot.quotes.filter((q) => `${q.id} ${q.status}`.toLowerCase().includes(this.filter.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const va = this.sortBy === 'id' ? a.id : a.createdAt;
      const vb = this.sortBy === 'id' ? b.id : b.createdAt;
      const res = va.localeCompare(vb);
      return this.sortDir === 'asc' ? res : -res;
    });
    return sorted;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paged(): Quote[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  canApprove(quote: Quote): boolean {
    return !['Aprobada', 'Aceptada', 'Convertida a pedido'].includes(quote.status);
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/cotizaciones/nueva']);
  }

  changeStatus(quote: Quote, status: Quote['status']): void {
    const updated = { ...quote, status };
    this.store.upsertQuote(updated);
    this.audit.add({ entityType: 'Quote', entityId: quote.id, action: 'STATUS_CHANGE', fromState: quote.status, toState: status, summary: `Cotización ${quote.id} actualizada` });
    if (status === 'Aceptada') this.rules.acceptQuoteCreateOrder(quote.id);
  }

  remove(id: string): void {
    this.store.updateState((s) => ({ ...s, quotes: s.quotes.filter((q) => q.id !== id), quoteLines: s.quoteLines.filter((l) => l.quoteId !== id) }));
    this.audit.add({ entityType: 'Quote', entityId: id, action: 'DELETE', summary: `Cotización ${id} eliminada` });
  }
}
