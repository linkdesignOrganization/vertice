import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { InventoryCalculationService } from '../../core/services/inventory-calculation.service';
import { RuleEngineService } from '../../core/services/rule-engine.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { UiModalComponent } from '../../shared/components/ui-modal/ui-modal.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, StatusChipComponent, DatePipe, PageHeaderComponent, UiModalComponent],
  template: `
    <app-page-header icon="bi-box-seam" title="Inventario">
      @if (tab==='trans') {
        <button class="btn btn-primary" (click)="openTransfer()"><i class="bi bi-plus-circle me-1"></i>Nueva transferencia</button>
      }
    </app-page-header>

    <ul class="nav nav-pills mb-3">
      <li class="nav-item"><button class="nav-link" [class.active]="tab==='stock'" (click)="tab='stock'">Stock</button></li>
      <li class="nav-item"><button class="nav-link" [class.active]="tab==='mov'" (click)="tab='mov'">Movimientos</button></li>
      <li class="nav-item"><button class="nav-link" [class.active]="tab==='trans'" (click)="tab='trans'">Transferencias</button></li>
      <li class="nav-item"><button class="nav-link" [class.active]="tab==='imp'" (click)="tab='imp'">Reposición/Importación</button></li>
    </ul>

    @if (tab==='stock') {
      <div class="glass-card p-3">
        @if (loading) { <div class="empty-state">Cargando...</div> }
        @else {
          <div class="row g-2 mb-2">
            <div class="col-md-8 col-lg-6">
              <label class="form-label">Buscar SKU o producto</label>
              <input class="form-control" [(ngModel)]="stockSearch" placeholder="Código, nombre o familia del SKU" />
            </div>
          </div>
          <div class="table-responsive d-none d-lg-block" style="max-height: 60vh;">
            <table class="table table-sm align-middle">
              <thead><tr><th>SKU</th><th>Ubicación</th><th>On Hand</th><th>Reservado</th><th>Disponible</th><th>Mínimo</th></tr></thead>
              <tbody>
                @for (row of filteredStockRows.slice(0, 240); track row.stock.id) {
                  <tr>
                    <td>{{ row.sku.code }}</td><td>{{ row.location.name }}</td><td>{{ row.stock.qtyOnHand }}</td><td>{{ row.stock.qtyReserved }}</td>
                    <td>{{ available(row.stock.qtyOnHand, row.stock.qtyReserved) }}</td><td>{{ row.sku.minStock }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="mobile-list d-lg-none">
            @for (row of filteredStockRows.slice(0, 240); track row.stock.id) {
              <div class="mobile-list-card">
                <div class="mobile-list-title">{{ row.sku.code }} - {{ row.sku.name }}</div>
                <div class="small text-secondary mb-2">{{ row.location.name }}</div>
                <div class="mobile-list-kv">
                  <div><span>On Hand</span><strong>{{ row.stock.qtyOnHand }}</strong></div>
                  <div><span>Reservado</span><strong>{{ row.stock.qtyReserved }}</strong></div>
                  <div><span>Disponible</span><strong>{{ available(row.stock.qtyOnHand, row.stock.qtyReserved) }}</strong></div>
                  <div><span>Mínimo</span><strong>{{ row.sku.minStock }}</strong></div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }

    @if (tab==='mov') {
      <div class="glass-card p-3">
        <p class="text-secondary mb-2">Movimientos simplificados según transferencias registradas.</p>
        <ul class="list-group list-group-flush">
          @for (t of store.snapshot.transfers.slice(0, 50); track t.id) {
            <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center">
              <span>{{ t.createdAt | date: 'd/M/y h:mm a' }} - {{ t.id }} - {{ t.qty }} uds</span>
              <app-status-chip [status]="t.status" />
            </li>
          }
        </ul>
      </div>
    }

    @if (tab==='trans') {
      <div class="glass-card p-3">
        <ul class="list-group list-group-flush">
          @for (t of store.snapshot.transfers.slice(0, 40); track t.id) {
            <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>{{ t.id }} - {{ t.status }}</span>
              <div>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="setTransferStatus(t.id, 'En traslado')">En traslado</button>
                <button class="btn btn-sm btn-outline-success me-1" (click)="setTransferStatus(t.id, 'Recibida')">Recibida</button>
                <button class="btn btn-sm btn-outline-danger" (click)="removeTransfer(t.id)"><i class="bi bi-trash"></i></button>
              </div>
            </li>
          }
          @if (!store.snapshot.transfers.length) {
            <li class="list-group-item bg-transparent"><div class="empty-state">Aún no hay transferencias. Creá una con "Nueva transferencia".</div></li>
          }
        </ul>
      </div>
    }

    @if (tab==='imp') {
      @if (auth.hasRole('MASTER')) {
        <div class="glass-card p-3">
          <h6 class="fw-bold"><i class="bi bi-globe2 me-1"></i>Vista gerencia de reposición/importación</h6>
          <ul class="mb-0">@for (family of families; track family) { <li>IMP-2026-{{ family }}: sugerencia de reposición</li> }</ul>
        </div>
      } @else {
        <div class="glass-card p-3"><span class="badge text-bg-secondary"><i class="bi bi-lock me-1"></i>No disponible para OPERADOR</span></div>
      }
    }

    <app-ui-modal [open]="transModalOpen" title="Nueva transferencia" size="md" [hasFooter]="true" (close)="transModalOpen=false">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Desde</label><select class="form-select" [(ngModel)]="draft.fromLocationId">@for (l of store.snapshot.locations; track l.id) { <option [value]="l.id">{{ l.name }}</option> }</select></div>
        <div class="col-md-6"><label class="form-label">Hacia</label><select class="form-select" [(ngModel)]="draft.toLocationId">@for (l of store.snapshot.locations; track l.id) { <option [value]="l.id">{{ l.name }}</option> }</select></div>
        <div class="col-md-8"><label class="form-label">SKU</label><select class="form-select" [(ngModel)]="draft.skuId">@for (s of store.snapshot.skus.slice(0,80); track s.id) { <option [value]="s.id">{{ s.code }}</option> }</select></div>
        <div class="col-md-4"><label class="form-label">Cantidad</label><input class="form-control" type="number" min="1" [(ngModel)]="draft.qty" /></div>
      </div>
      <div modal-footer>
        <button class="btn btn-outline-secondary" (click)="transModalOpen=false">Cancelar</button>
        <button class="btn btn-primary" (click)="createTransfer()"><i class="bi bi-plus-circle me-1"></i>Crear transferencia</button>
      </div>
    </app-ui-modal>
  `
})
export class InventoryComponent {
  tab: 'stock' | 'mov' | 'trans' | 'imp' = 'stock';
  loading = true;
  stockSearch = '';
  transModalOpen = false;
  families = ['EPP', 'Caídas', 'Instrumentos', 'Señalización', 'Derrames/Químicos', 'Consumibles mantenimiento'];
  draft = { fromLocationId: 'LOC-001', toLocationId: 'LOC-002', skuId: 'SKU-0001', qty: 5 };

  constructor(
    public readonly store: SessionStoreService,
    public readonly auth: AuthService,
    private readonly inventoryCalc: InventoryCalculationService,
    private readonly rules: RuleEngineService
  ) {
    setTimeout(() => (this.loading = false), 300);
  }

  get stockRows() {
    return this.store.snapshot.stock.map((stock) => ({ stock, sku: this.store.snapshot.skus.find((s) => s.id === stock.skuId)!, location: this.store.snapshot.locations.find((l) => l.id === stock.locationId)! }));
  }

  get filteredStockRows() {
    const q = this.stockSearch
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();

    if (!q) return this.stockRows;

    return this.stockRows.filter((row) => {
      const haystack = `${row.sku.code} ${row.sku.name} ${row.sku.family}`
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  available(onHand: number, reserved: number): number {
    return this.inventoryCalc.qtyAvailable(onHand, reserved);
  }

  openTransfer(): void {
    this.draft = { fromLocationId: 'LOC-001', toLocationId: 'LOC-002', skuId: 'SKU-0001', qty: 5 };
    this.transModalOpen = true;
  }

  createTransfer(): void {
    if (!this.draft.fromLocationId || !this.draft.toLocationId || !this.draft.skuId || this.draft.qty <= 0) return;
    const t = {
      id: `TR-2026-${String(this.store.snapshot.transfers.length + 1).padStart(4, '0')}`,
      fromLocationId: this.draft.fromLocationId,
      toLocationId: this.draft.toLocationId,
      status: 'Programada' as const,
      skuId: this.draft.skuId,
      qty: this.draft.qty,
      createdAt: new Date().toISOString()
    };
    this.store.upsertTransfer(t);
    this.transModalOpen = false;
  }

  setTransferStatus(id: string, status: 'Programada' | 'En traslado' | 'Recibida'): void {
    const transfer = this.store.snapshot.transfers.find((t) => t.id === id);
    if (!transfer) return;
    this.rules.updateTransferStatus(transfer, status);
  }

  removeTransfer(id: string): void {
    this.store.updateState((s) => ({ ...s, transfers: s.transfers.filter((t) => t.id !== id) }));
  }
}
