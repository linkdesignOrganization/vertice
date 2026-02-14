import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditEvent } from '../../core/models/entities';
import { SessionStoreService } from '../../core/services/session-store.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page-header"><i class="bi bi-shield-lock fs-4"></i><h2 class="section-title">Auditoría Global</h2></div>

    <div class="glass-card p-3 mb-3">
      <label class="form-label">Filtrar eventos</label>
      <input class="form-control" [(ngModel)]="filter" />
    </div>

    <div class="glass-card p-3">
      @if (loading) { <div class="empty-state">Cargando...</div> }
      @else {
      <div class="table-responsive d-none d-lg-block">
        <table class="table table-hover align-middle">
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Persona</th><th>Cargo</th><th>Resumen</th></tr></thead>
          <tbody>
            @for (a of paged; track a.id) {
              <tr>
                <td>{{ a.timestamp | date: 'd/M/y h:mm a' }}</td>
                <td>{{ a.userId }}</td>
                <td>{{ personName(a) }}</td>
                <td>{{ companyRole(a) }}</td>
                <td>{{ a.summary }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="mobile-list d-lg-none">
        @for (a of paged; track a.id) {
          <div class="mobile-list-card">
            <div class="mobile-list-title">{{ a.summary }}</div>
            <div class="mobile-list-kv">
              <div><span>Fecha</span><span>{{ a.timestamp | date: 'd/M/y h:mm a' }}</span></div>
              <div><span>Usuario</span><strong>{{ a.userId }}</strong></div>
              <div><span>Persona</span><span>{{ personName(a) }}</span></div>
              <div><span>Cargo</span><span>{{ companyRole(a) }}</span></div>
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
export class AuditComponent {
  loading = true;
  filter = '';
  page = 1;
  pageSize = 20;

  constructor(private readonly store: SessionStoreService) {
    setTimeout(() => (this.loading = false), 300);
  }

  get rows(): AuditEvent[] {
    const q = this.filter.toLowerCase();
    return this.store.snapshot.audit.filter((a) => {
      const haystack = `${a.userId} ${this.personName(a)} ${this.companyRole(a)} ${a.summary}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paged(): AuditEvent[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  personName(a: AuditEvent): string {
    const user = this.store.snapshot.users.find((u) => u.id === a.userId);
    if (!user) return 'Sin nombre';
    if (user.actorType === 'MASTER') return 'Roberto Castillo';
    if (user.actorType === 'OPERADOR') return 'Daniela Rojas';
    if (user.actorType === 'VENDEDOR') {
      const bySeller = this.store.snapshot.customers.find((c) => c.sellerId === user.id);
      return bySeller?.contactName || user.displayName;
    }
    const internalContact = this.store.snapshot.customers.find((c) => c.contactName !== '' && c.sellerId !== user.id);
    return internalContact?.contactName || user.displayName;
  }

  companyRole(a: AuditEvent): string {
    const user = this.store.snapshot.users.find((u) => u.id === a.userId);
    if (!user) return 'Sin cargo';
    if (user.actorType === 'MASTER') return 'Gerencia general';
    if (user.actorType === 'OPERADOR') return 'Coordinación operativa';
    if (user.actorType === 'VENDEDOR') return 'Ejecutivo comercial';
    return 'Analista de operaciones';
  }
}
