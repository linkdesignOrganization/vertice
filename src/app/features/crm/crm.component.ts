import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../core/models/entities';
import { CustomerProfileModalService } from '../../core/services/customer-profile-modal.service';
import { AuditService } from '../../core/services/audit.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><i class="bi bi-people-fill fs-4"></i><h2 class="section-title">CRM</h2></div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-lg-3"><label class="form-label">Cliente</label><input class="form-control" [(ngModel)]="draft.legalName" /></div>
        <div class="col-12 col-lg-2"><label class="form-label">Contacto</label><input class="form-control" [(ngModel)]="draft.contactName" /></div>
        <div class="col-6 col-lg-2"><label class="form-label">Lista</label><select class="form-select" [(ngModel)]="draft.priceList"><option>Retail</option><option>Empresa</option><option>Mayorista</option></select></div>
        <div class="col-6 col-lg-2"><label class="form-label">Término</label><select class="form-select" [(ngModel)]="draft.paymentTerm"><option>Contado</option><option>Net 15</option><option>Net 30</option></select></div>
        <div class="col-6 col-lg-2"><label class="form-label">Correo empresa</label><input class="form-control" [(ngModel)]="draft.companyEmail" /></div>
        <div class="col-6 col-lg-2"><label class="form-label">Puesto</label><input class="form-control" [(ngModel)]="draft.contactPosition" /></div>
        <div class="col-6 col-lg-1"><label class="form-label">Seller</label><input class="form-control" [(ngModel)]="draft.sellerId" /></div>
        <div class="col-6 col-lg-2"><button class="btn btn-primary w-100" (click)="save()"><i class="bi bi-save"></i> Guardar</button></div>
      </div>
      <small class="text-secondary d-block mt-2"><i class="bi bi-receipt"></i> Impuesto visible: 13%</small>
    </div>

    <div class="glass-card p-3">
      <div class="row g-2 align-items-end mb-2">
        <div class="col-md-5"><label class="form-label">Buscar</label><input class="form-control" [(ngModel)]="filter" /></div>
        <div class="col-md-3"><label class="form-label">Orden</label><select class="form-select" [(ngModel)]="sortBy"><option value="id">ID</option><option value="legalName">Cliente</option></select></div>
        <div class="col-md-2"><label class="form-label">Dirección</label><select class="form-select" [(ngModel)]="sortDir"><option value="asc">Asc</option><option value="desc">Desc</option></select></div>
      </div>

      @if (loading) {
        <div class="empty-state">Cargando...</div>
      } @else if (!paged.length) {
        <div class="empty-state">Sin clientes.</div>
      } @else {
        <div class="table-responsive d-none d-lg-block">
          <table class="table table-hover align-middle">
            <thead><tr><th>ID</th><th>Cliente</th><th>Contacto</th><th>Lista</th><th>Término</th><th>Seller</th><th></th></tr></thead>
            <tbody>
              @for (c of paged; track c.id) {
                <tr>
                  <td>{{ c.id }}</td><td>{{ c.legalName }}</td><td>{{ c.contactName }}</td><td>{{ c.priceList }}</td><td>{{ c.paymentTerm }}</td><td>{{ c.sellerId }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-1" (click)="openProfile(c)"><i class="bi bi-person-vcard"></i></button>
                    <button class="btn btn-sm btn-outline-primary me-1" (click)="edit(c)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" (click)="remove(c.id)"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mobile-list d-lg-none">
          @for (c of paged; track c.id) {
            <div class="mobile-list-card">
              <div class="mobile-list-title">{{ c.legalName }}</div>
              <div class="small text-secondary mb-2">{{ c.id }}</div>
              <div class="mobile-list-kv">
                <div><span>Contacto</span><span>{{ c.contactName }}</span></div>
                <div><span>Seller</span><strong>{{ c.sellerId }}</strong></div>
              </div>
              <div class="mobile-list-actions">
                <button class="btn btn-sm btn-outline-info" (click)="openProfile(c)"><i class="bi bi-person-vcard me-1"></i>Ficha</button>
                <button class="btn btn-sm btn-outline-primary" (click)="edit(c)"><i class="bi bi-pencil me-1"></i>Editar</button>
                <button class="btn btn-sm btn-outline-danger" (click)="remove(c.id)"><i class="bi bi-trash me-1"></i>Eliminar</button>
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
export class CrmComponent {
  loading = true;
  filter = '';
  sortBy: 'id' | 'legalName' = 'id';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 10;

  draft: Partial<Customer> = { priceList: 'Retail', paymentTerm: 'Contado', taxPct: 13, sellerId: 'U-0003', contactName: 'Sin asignar', companyEmail: '', contactPosition: 'Encargado de Compras' };

  constructor(
    private readonly store: SessionStoreService,
    private readonly audit: AuditService,
    private readonly feedback: UiFeedbackService,
    private readonly customerModal: CustomerProfileModalService
  ) {
    setTimeout(() => (this.loading = false), 300);
  }

  get rows(): Customer[] {
    const filtered = this.store.snapshot.customers.filter((c) => `${c.id} ${c.legalName} ${c.sellerId}`.toLowerCase().includes(this.filter.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const va = this.sortBy === 'id' ? a.id : a.legalName;
      const vb = this.sortBy === 'id' ? b.id : b.legalName;
      const res = va.localeCompare(vb);
      return this.sortDir === 'asc' ? res : -res;
    });
    return sorted;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paged(): Customer[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  save(): void {
    if (!this.draft.legalName || !this.draft.sellerId || !this.draft.priceList || !this.draft.paymentTerm) {
      this.feedback.push('Complete los campos requeridos', 'CRM', 'warning');
      return;
    }

    const id = this.draft.id ?? `C-${String(this.store.snapshot.customers.length + 1).padStart(4, '0')}`;
    const normalized = this.draft.legalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const topDomain = ((this.store.snapshot.customers.length + 1) % 2 === 0) ? 'com' : 'cr';
    const record: Customer = {
      id,
      legalName: this.draft.legalName,
      contactName: this.draft.contactName || 'Sin asignar',
      companyEmail: this.draft.companyEmail || `contacto@${normalized}.${topDomain}`,
      contactPosition: this.draft.contactPosition || 'Encargado de Compras',
      sellerId: this.draft.sellerId,
      priceList: this.draft.priceList,
      paymentTerm: this.draft.paymentTerm,
      taxPct: 13
    };

    this.store.updateState((s) => ({ ...s, customers: s.customers.some((c) => c.id === id) ? s.customers.map((c) => (c.id === id ? record : c)) : [record, ...s.customers] }));
    this.draft = { priceList: 'Retail', paymentTerm: 'Contado', taxPct: 13, sellerId: 'U-0003', contactName: 'Sin asignar', companyEmail: '', contactPosition: 'Encargado de Compras' };
    this.audit.add({ entityType: 'Customer', entityId: id, action: 'UPSERT', summary: `Cliente ${id} guardado` });
    this.feedback.push('Cliente guardado', 'CRM', 'success');
  }

  edit(customer: Customer): void {
    this.draft = { ...customer };
  }

  openProfile(customer: Customer): void {
    this.customerModal.open({
      ...customer,
      contactName: customer.contactName || 'Sin asignar',
      companyEmail: customer.companyEmail || 'sincorreo@empresa.com',
      contactPosition: customer.contactPosition || 'Encargado de Compras'
    });
  }

  remove(id: string): void {
    this.store.updateState((s) => ({ ...s, customers: s.customers.filter((c) => c.id !== id) }));
    this.audit.add({ entityType: 'Customer', entityId: id, action: 'DELETE', summary: `Cliente ${id} eliminado` });
    this.feedback.push('Cliente eliminado', 'CRM', 'info');
  }
}
