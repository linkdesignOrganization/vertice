import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReturnRecord, ReturnStatus } from '../../core/models/entities';
import { AuditService } from '../../core/services/audit.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [FormsModule, StatusChipComponent, DatePipe],
  template: `
    <div class="page-header"><i class="bi bi-arrow-return-left fs-4"></i><h2 class="section-title">Devoluciones</h2></div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4"><label class="form-label">Pedido</label><input class="form-control" [(ngModel)]="draft.orderId" /></div>
        <div class="col-md-6"><label class="form-label">Motivo</label><input class="form-control" [(ngModel)]="draft.reason" /></div>
        <div class="col-md-2"><button class="btn btn-primary w-100" (click)="create()"><i class="bi bi-plus-circle"></i> Crear</button></div>
      </div>
    </div>

    <div class="glass-card p-3">
      @if (loading) { <div class="empty-state">Cargando...</div> }
      @else if (!store.snapshot.returns.length) { <div class="empty-state">Sin devoluciones.</div> }
      @else {
      <div class="table-responsive d-none d-lg-block">
        <table class="table table-hover align-middle">
          <thead><tr><th>ID</th><th>Pedido</th><th>Estado</th><th>Nota crédito</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            @for (r of paged; track r.id) {
              <tr>
                <td>{{ r.id }}</td><td>{{ r.orderId }}</td><td><app-status-chip [status]="r.status" /></td><td>{{ r.creditNoteNumber || '-' }}</td>
                <td>
                  <span class="badge text-bg-light border me-1">{{ r.createdAt | date: 'dd/MM/yy' }}</span>
                  <span class="badge text-bg-secondary">{{ r.createdAt | date: 'h:mm a' }}</span>
                </td>
                <td class="text-end">
                  <select class="form-select form-select-sm d-inline-block me-1" style="width: 220px" [ngModel]="r.status" (ngModelChange)="setStatus(r, $event)">@for (st of statuses; track st) { <option [ngValue]="st">{{ st }}</option> }</select>
                  <button class="btn btn-sm btn-outline-danger" (click)="remove(r.id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="mobile-list d-lg-none">
        @for (r of paged; track r.id) {
          <div class="mobile-list-card">
            <div class="mobile-list-title d-flex justify-content-between align-items-start gap-2">
              <span>{{ r.id }}</span>
              <app-status-chip [status]="r.status" />
            </div>
            <div class="mobile-list-kv">
              <div><span>Pedido</span><strong>{{ r.orderId }}</strong></div>
              <div><span>Nota crédito</span><span>{{ r.creditNoteNumber || '-' }}</span></div>
              <div><span>Fecha</span><span>{{ r.createdAt | date: 'd/M/y h:mm a' }}</span></div>
            </div>
            <div class="mt-2">
              <label class="form-label mb-1">Estado</label>
              <select class="form-select form-select-sm" [ngModel]="r.status" (ngModelChange)="setStatus(r, $event)">
                @for (st of statuses; track st) { <option [ngValue]="st">{{ st }}</option> }
              </select>
            </div>
            <div class="mobile-list-actions">
              <button class="btn btn-sm btn-outline-danger" (click)="remove(r.id)"><i class="bi bi-trash me-1"></i>Eliminar</button>
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
export class ReturnsComponent {
  statuses: ReturnStatus[] = ['Solicitado', 'Nota de crédito'];
  loading = true;
  page = 1;
  pageSize = 10;
  draft = { orderId: '', reason: '' };

  constructor(
    public readonly store: SessionStoreService,
    private readonly audit: AuditService,
    private readonly feedback: UiFeedbackService
  ) {
    setTimeout(() => (this.loading = false), 300);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.store.snapshot.returns.length / this.pageSize));
  }

  get paged(): ReturnRecord[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.store.snapshot.returns.slice(start, start + this.pageSize);
  }

  create(): void {
    if (!this.draft.orderId.trim() || !this.draft.reason.trim()) {
      this.feedback.push('Pedido y motivo son obligatorios', 'Devoluciones', 'warning');
      return;
    }
    const id = `RT-2026-${String(this.store.snapshot.returns.length + 1).padStart(4, '0')}`;
    const record: ReturnRecord = { id, orderId: this.draft.orderId, reason: this.draft.reason, status: 'Solicitado', createdAt: new Date().toISOString() };

    this.store.upsertReturn(record);
    this.audit.add({ entityType: 'Return', entityId: id, action: 'CREATE', summary: `Devolución ${id}` });
    this.feedback.push('Devolución creada', 'Devoluciones', 'success');
    this.draft = { orderId: '', reason: '' };
  }

  setStatus(record: ReturnRecord, next: ReturnStatus): void {
    const updated: ReturnRecord = { ...record, status: next, creditNoteNumber: next === 'Nota de crédito' ? `NC-2026-${record.id.split('-').pop()}` : record.creditNoteNumber };
    this.store.upsertReturn(updated);
    this.audit.add({ entityType: 'Return', entityId: record.id, action: 'STATUS_CHANGE', fromState: record.status, toState: next, summary: `Devolución ${record.id} -> ${next}` });
  }

  remove(id: string): void {
    this.store.updateState((s) => ({ ...s, returns: s.returns.filter((r) => r.id !== id) }));
    this.audit.add({ entityType: 'Return', entityId: id, action: 'DELETE', summary: `Devolución ${id} eliminada` });
  }
}
