import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer, Quote, QuoteLine, Sku } from '../../core/models/entities';
import { AuditService } from '../../core/services/audit.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

interface DraftLine {
  skuId: string;
  skuName: string;
  qty: number;
  unitPriceUSD: number;
  estimatedCostUSD: number;
}

@Component({
  selector: 'app-quotes-create',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  styles: [
    '.customer-modal-overlay { position: fixed !important; inset: 0; width: 100vw; height: 100dvh; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }',
    '.customer-modal-backdrop { position: fixed; inset: 0; background: rgba(8,12,20,.52); }',
    '.customer-modal-dialog { position: relative; z-index: 2001; width: min(860px, 96vw); margin: 0 auto; }',
    '.customer-modal-card { background: #fff; border-radius: .95rem; box-shadow: 0 20px 44px rgba(0,0,0,.28); max-height: min(90dvh, 860px); display: flex; flex-direction: column; overflow: hidden; }',
    '.sku-modal-overlay { position: fixed !important; inset: 0; width: 100vw; height: 100dvh; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }',
    '.sku-modal-backdrop { position: fixed; inset: 0; background: rgba(8,12,20,.52); }',
    '.sku-modal-dialog { position: relative; z-index: 2001; width: min(860px, 96vw); margin: 0 auto; }',
    '.sku-modal-card { background: #fff; border-radius: .95rem; box-shadow: 0 20px 44px rgba(0,0,0,.28); max-height: min(90dvh, 860px); display: flex; flex-direction: column; overflow: hidden; }',
    '.catalog-modal-head { flex: 0 0 auto; }',
    '.catalog-modal-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }',
    '.catalog-list-scroll { max-height: min(58dvh, 520px); overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }',
    '.quote-action-btn { width: 100%; }',
    '@media (min-width: 768px) { .quote-action-btn { width: auto; } }',
    '@media (max-width: 991px) { .customer-modal-overlay, .sku-modal-overlay { padding: .6rem; align-items: center; } .customer-modal-dialog, .sku-modal-dialog { width: 100%; } .customer-modal-card, .sku-modal-card { max-height: calc(100dvh - 1.2rem); } .catalog-list-scroll { max-height: calc(100dvh - 260px); } }',
    '@media (max-width: 767px) { .customer-modal-overlay, .sku-modal-overlay { align-items: center; } .customer-modal-card, .sku-modal-card { border-radius: .9rem; } .catalog-list-scroll { max-height: calc(100dvh - 240px); } }'
  ],
  template: `
    <div class="page-header justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-file-earmark-plus fs-4"></i>
        <h2 class="section-title">Nueva cotización</h2>
      </div>
      <button class="btn btn-outline-secondary btn-sm d-lg-none" type="button" (click)="goBack()">
        <i class="bi bi-arrow-left me-1"></i>Atrás
      </button>
    </div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-3">
        <div class="col-lg-6">
          <label class="form-label">Buscar cliente por nombre</label>
          <div class="input-group">
            <input class="form-control" placeholder="Escriba nombre de empresa" [(ngModel)]="customerSearch" />
            <button class="btn btn-outline-secondary" type="button" (click)="openCustomerModal()" title="Ver listado de clientes">
              <i class="bi bi-list-ul"></i>
            </button>
          </div>
          @if (customerSearch.trim().length > 1) {
            <div class="list-group mt-2" style="max-height: 220px; overflow: auto;">
              @for (c of filteredCustomers; track c.id) {
                <button type="button" class="list-group-item list-group-item-action" (click)="selectCustomer(c)">
                  <strong>{{ c.legalName }}</strong>
                  <div class="small text-secondary">{{ c.companyEmail }}</div>
                </button>
              }
            </div>
          }
        </div>

        <div class="col-lg-6">
          <div class="border rounded p-3 bg-white">
            <div class="fw-semibold mb-2">Cliente seleccionado</div>
            @if (selectedCustomer) {
              <div><strong>{{ selectedCustomer.legalName }}</strong></div>
              <div class="small text-secondary">{{ selectedCustomer.contactName }} - {{ selectedCustomer.contactPosition }}</div>
              <div class="small text-secondary">{{ selectedCustomer.companyEmail }}</div>
              <div class="small text-secondary">Lista: {{ selectedCustomer.priceList }} | Pago: {{ selectedCustomer.paymentTerm }}</div>
            } @else {
              <div class="small text-secondary">Seleccione un cliente para continuar.</div>
            }
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-6">
          <label class="form-label">Buscar producto por nombre</label>
          <div class="input-group">
            <input class="form-control" placeholder="Ej: casco, arnés, detector" [(ngModel)]="productSearch" (ngModelChange)="onProductSearchChange()" />
            <button class="btn btn-outline-secondary" type="button" (click)="openSkuModal()" title="Ver catálogo SKU">
              <i class="bi bi-list-ul"></i>
            </button>
          </div>
          @if (selectedSku) {
            <div class="mt-2 border rounded p-2 bg-white d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ selectedSku.name }}</strong>
                <div class="small text-secondary">{{ selectedSku.code }} - {{ selectedSku.family }} - {{ selectedSku.salePriceUSD | currency:'USD' }}</div>
              </div>
              <button class="btn btn-sm btn-outline-secondary" (click)="clearSelectedProduct()"><i class="bi bi-x-circle"></i></button>
            </div>
          } @else if (productSearch.trim().length > 1) {
            <div class="list-group mt-2" style="max-height: 220px; overflow: auto;">
              @for (sku of filteredProducts; track sku.id) {
                <button type="button" class="list-group-item list-group-item-action" (click)="selectProduct(sku)">
                  <strong>{{ sku.name }}</strong>
                  <div class="small text-secondary">{{ sku.code }} - {{ sku.family }} - {{ sku.salePriceUSD | currency:'USD' }}</div>
                </button>
              }
            </div>
          }
        </div>
        <div class="col-md-2">
          <label class="form-label">Cantidad</label>
          <input class="form-control" type="number" min="1" [(ngModel)]="qtyToAdd" />
        </div>
        <div class="col-md-4 d-grid">
          <button class="btn btn-outline-primary" (click)="addSelectedProduct()"><i class="bi bi-plus-circle"></i> Agregar producto</button>
        </div>
      </div>
    </div>

    <div class="glass-card p-3 mb-3">
      <h6 class="fw-bold">Detalle de cotización</h6>
      @if (!lines.length) {
        <div class="empty-state">Aún no hay productos agregados.</div>
      } @else {
        <div class="table-responsive d-none d-lg-block">
          <table class="table table-sm align-middle">
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Total línea</th><th></th></tr></thead>
            <tbody>
              @for (line of lines; track line.skuId) {
                <tr>
                  <td>{{ line.skuName }}</td>
                  <td><input class="form-control form-control-sm" style="max-width: 90px;" type="number" min="1" [(ngModel)]="line.qty" (ngModelChange)="recalculate()" /></td>
                  <td>{{ line.unitPriceUSD | currency:'USD' }}</td>
                  <td>{{ line.qty * line.unitPriceUSD | currency:'USD' }}</td>
                  <td class="text-end"><button class="btn btn-sm btn-outline-danger" (click)="removeLine(line.skuId)"><i class="bi bi-trash"></i></button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mobile-list d-lg-none">
          @for (line of lines; track line.skuId) {
            <div class="mobile-list-card">
              <div class="mobile-list-title">{{ line.skuName }}</div>
              <div class="mobile-list-kv">
                <div><span>Precio unitario</span><strong>{{ line.unitPriceUSD | currency:'USD' }}</strong></div>
                <div><span>Total línea</span><strong>{{ line.qty * line.unitPriceUSD | currency:'USD' }}</strong></div>
              </div>
              <div class="row g-2 mt-1 align-items-end">
                <div class="col-6">
                  <label class="form-label mb-1">Cantidad</label>
                  <input class="form-control form-control-sm" type="number" min="1" [(ngModel)]="line.qty" (ngModelChange)="recalculate()" />
                </div>
                <div class="col-6 d-grid">
                  <button class="btn btn-sm btn-outline-danger" (click)="removeLine(line.skuId)"><i class="bi bi-trash me-1"></i>Quitar</button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <div class="row justify-content-end">
        <div class="col-md-4">
          <div class="border rounded p-3 bg-white small">
            <div class="d-flex justify-content-between"><span>Subtotal</span><strong>{{ subtotalUSD | currency:'USD' }}</strong></div>
            <div class="d-flex justify-content-between"><span>Impuesto (13%)</span><strong>{{ taxUSD | currency:'USD' }}</strong></div>
            <hr class="my-2" />
            <div class="d-flex justify-content-between"><span>Total</span><strong>{{ totalUSD | currency:'USD' }}</strong></div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-column flex-md-row gap-2 justify-content-end mt-3">
        <button class="btn btn-outline-secondary quote-action-btn" (click)="goBack()">Cancelar</button>
        <button class="btn btn-primary quote-action-btn" (click)="sendQuote()"><i class="bi bi-send-check"></i> Enviar cotización</button>
      </div>
    </div>

    @if (customerModalOpen) {
      <div class="customer-modal-overlay" tabindex="-1" role="dialog" aria-modal="true">
        <div class="customer-modal-backdrop" (click)="closeCustomerModal()"></div>
        <div class="customer-modal-dialog">
          <div class="customer-modal-card p-3">
            <div class="catalog-modal-head">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="bi bi-people me-1"></i>Listado de clientes</h5>
              <button class="btn btn-dark btn-sm" (click)="closeCustomerModal()">Cerrar</button>
            </div>
            </div>
            <div class="catalog-modal-body">
            <div class="row g-2 mb-2">
              <div class="col-md-8">
                <input class="form-control" placeholder="Buscar por empresa, contacto o correo" [(ngModel)]="customerModalSearch" />
              </div>
              <div class="col-md-4 text-md-end">
                <small class="text-secondary">Mostrando {{ modalCustomers.length }} clientes</small>
              </div>
            </div>
            <div class="catalog-list-scroll">
              <div class="table-responsive border rounded d-none d-lg-block">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light" style="position: sticky; top: 0;">
                    <tr>
                      <th>ID</th>
                      <th>Empresa</th>
                      <th>Contacto</th>
                      <th>Correo</th>
                      <th class="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of modalCustomers; track c.id) {
                      <tr>
                        <td><code>{{ c.id }}</code></td>
                        <td>{{ c.legalName }}</td>
                        <td>{{ c.contactName }}</td>
                        <td>{{ c.companyEmail }}</td>
                        <td class="text-end">
                          @if (isCustomerSelected(c.id)) {
                            <button class="btn btn-sm btn-success" type="button" disabled>
                              <i class="bi bi-check2-circle me-1"></i>Seleccionado
                            </button>
                          } @else {
                            <button class="btn btn-sm btn-outline-primary" (click)="selectCustomerFromModal(c)">
                              <i class="bi bi-person-check me-1"></i>Seleccionar
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="mobile-list d-lg-none">
                @for (c of modalCustomers; track c.id) {
                  <div class="mobile-list-card">
                    <div class="mobile-list-title">{{ c.legalName }}</div>
                    <div class="mobile-list-kv">
                      <div><span>ID</span><code>{{ c.id }}</code></div>
                      <div><span>Contacto</span><span>{{ c.contactName }}</span></div>
                      <div><span>Correo</span><span>{{ c.companyEmail }}</span></div>
                    </div>
                    <div class="mobile-list-actions">
                      @if (isCustomerSelected(c.id)) {
                        <button class="btn btn-sm btn-success" type="button" disabled><i class="bi bi-check2-circle me-1"></i>Seleccionado</button>
                      } @else {
                        <button class="btn btn-sm btn-outline-primary" (click)="selectCustomerFromModal(c)"><i class="bi bi-person-check me-1"></i>Seleccionar</button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
            <div class="small text-secondary mt-2">Solo se permite 1 cliente por cotización.</div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (skuModalOpen) {
      <div class="sku-modal-overlay" tabindex="-1" role="dialog" aria-modal="true">
        <div class="sku-modal-backdrop" (click)="closeSkuModal()"></div>
        <div class="sku-modal-dialog">
          <div class="sku-modal-card p-3">
            <div class="catalog-modal-head">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0"><i class="bi bi-box-seam me-1"></i>Catálogo de productos (SKU)</h5>
              <button class="btn btn-dark btn-sm" (click)="closeSkuModal()">Cerrar</button>
            </div>
            </div>
            <div class="catalog-modal-body">
            <div class="row g-2 mb-2">
              <div class="col-md-8">
                <input class="form-control" placeholder="Buscar por SKU, nombre o familia" [(ngModel)]="skuModalSearch" />
              </div>
              <div class="col-md-4 text-md-end">
                <small class="text-secondary">Mostrando {{ modalSkus.length }} productos</small>
              </div>
            </div>
            <div class="catalog-list-scroll">
              <div class="table-responsive border rounded d-none d-lg-block">
                <table class="table table-sm table-hover align-middle mb-0">
                  <thead class="table-light" style="position: sticky; top: 0;">
                    <tr>
                      <th>SKU</th>
                      <th>Producto</th>
                      <th>Familia</th>
                      <th>Precio</th>
                      <th class="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (sku of modalSkus; track sku.id) {
                      <tr>
                        <td><code>{{ sku.code }}</code></td>
                        <td>{{ sku.name }}</td>
                        <td>{{ sku.family }}</td>
                        <td>{{ sku.salePriceUSD | currency:'USD' }}</td>
                        <td class="text-end">
                          @if (isSkuAdded(sku.id)) {
                            <button class="btn btn-sm btn-success" type="button" disabled>
                              <i class="bi bi-check2-circle me-1"></i>Agregado
                            </button>
                          } @else {
                            <button class="btn btn-sm btn-outline-primary" (click)="addSkuFromModal(sku)">
                              <i class="bi bi-plus-circle me-1"></i>Agregar
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="mobile-list d-lg-none">
                @for (sku of modalSkus; track sku.id) {
                  <div class="mobile-list-card">
                    <div class="mobile-list-title">{{ sku.name }}</div>
                    <div class="mobile-list-kv">
                      <div><span>SKU</span><code>{{ sku.code }}</code></div>
                      <div><span>Familia</span><span>{{ sku.family }}</span></div>
                      <div><span>Precio</span><strong>{{ sku.salePriceUSD | currency:'USD' }}</strong></div>
                    </div>
                    <div class="mobile-list-actions">
                      @if (isSkuAdded(sku.id)) {
                        <button class="btn btn-sm btn-success" type="button" disabled><i class="bi bi-check2-circle me-1"></i>Agregado</button>
                      } @else {
                        <button class="btn btn-sm btn-outline-primary" (click)="addSkuFromModal(sku)"><i class="bi bi-plus-circle me-1"></i>Agregar</button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    }
  `
})
export class QuotesCreateComponent {
  customerSearch = '';
  customerModalSearch = '';
  customerModalOpen = false;
  productSearch = '';
  skuModalSearch = '';
  skuModalOpen = false;
  qtyToAdd = 1;
  selectedCustomer?: Customer;
  selectedSku?: Sku;
  lines: DraftLine[] = [];

  constructor(
    private readonly store: SessionStoreService,
    private readonly audit: AuditService,
    private readonly feedback: UiFeedbackService,
    private readonly router: Router
  ) {}

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  get filteredCustomers(): Customer[] {
    const q = this.customerSearch.trim().toLowerCase();
    if (!q) return [];
    return this.store.snapshot.customers.filter((c) => c.legalName.toLowerCase().includes(q)).slice(0, 12);
  }

  get modalCustomers(): Customer[] {
    const q = this.normalize(this.customerModalSearch);
    const list = !q
      ? this.store.snapshot.customers
      : this.store.snapshot.customers.filter((c) => this.normalize(`${c.legalName} ${c.contactName} ${c.companyEmail}`).includes(q));
    return list.slice(0, 120);
  }

  get filteredProducts(): Sku[] {
    const q = this.normalize(this.productSearch);
    if (!q) return [];
    return this.store.snapshot.skus
      .filter((s) => {
        const haystack = this.normalize(`${s.name} ${s.family} ${s.code}`);
        return haystack.includes(q);
      })
      .slice(0, 15);
  }

  get modalSkus(): Sku[] {
    const q = this.normalize(this.skuModalSearch);
    const list = !q
      ? this.store.snapshot.skus
      : this.store.snapshot.skus.filter((s) => this.normalize(`${s.code} ${s.name} ${s.family}`).includes(q));
    return list.slice(0, 120);
  }

  get subtotalUSD(): number {
    return this.lines.reduce((acc, l) => acc + l.qty * l.unitPriceUSD, 0);
  }

  get taxUSD(): number {
    return Math.round(this.subtotalUSD * 0.13);
  }

  get totalUSD(): number {
    return Math.round(this.subtotalUSD + this.taxUSD);
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerSearch = customer.legalName;
  }

  openCustomerModal(): void {
    this.customerModalOpen = true;
    this.customerModalSearch = '';
  }

  closeCustomerModal(): void {
    this.customerModalOpen = false;
  }

  selectCustomerFromModal(customer: Customer): void {
    this.selectCustomer(customer);
    this.closeCustomerModal();
    this.feedback.push(`Cliente seleccionado: ${customer.legalName}`, 'Cotizaciones', 'success', 1200);
  }

  isCustomerSelected(customerId: string): boolean {
    return this.selectedCustomer?.id === customerId;
  }

  selectProduct(sku: Sku): void {
    this.selectedSku = sku;
    this.productSearch = '';
  }

  clearSelectedProduct(): void {
    this.selectedSku = undefined;
    this.productSearch = '';
  }

  onProductSearchChange(): void {
    if (this.productSearch.trim().length > 0) {
      this.selectedSku = undefined;
    }
  }

  addSelectedProduct(): void {
    if (!this.selectedSku) {
      this.feedback.push('Seleccione un producto', 'Cotizaciones', 'warning');
      return;
    }
    if (!this.qtyToAdd || this.qtyToAdd <= 0) {
      this.feedback.push('La cantidad debe ser mayor que 0', 'Cotizaciones', 'warning');
      return;
    }

    this.upsertLine(this.selectedSku, this.qtyToAdd);

    this.qtyToAdd = 1;
    this.selectedSku = undefined;
    this.productSearch = '';
  }

  openSkuModal(): void {
    this.skuModalOpen = true;
    this.skuModalSearch = '';
  }

  closeSkuModal(): void {
    this.skuModalOpen = false;
  }

  addSkuFromModal(sku: Sku): void {
    this.upsertLine(sku, 1);
    this.feedback.push(`${sku.name} agregado`, 'Cotizaciones', 'success', 1200);
  }

  isSkuAdded(skuId: string): boolean {
    return this.lines.some((line) => line.skuId === skuId);
  }

  removeLine(skuId: string): void {
    this.lines = this.lines.filter((l) => l.skuId !== skuId);
  }

  recalculate(): void {
    this.lines = this.lines.map((line) => ({ ...line, qty: Math.max(1, Math.round(line.qty || 1)) }));
  }

  private upsertLine(sku: Sku, qty: number): void {
    const existing = this.lines.find((l) => l.skuId === sku.id);
    if (existing) {
      existing.qty += qty;
      this.recalculate();
      return;
    }
    this.lines.push({
      skuId: sku.id,
      skuName: sku.name,
      qty,
      unitPriceUSD: sku.salePriceUSD,
      estimatedCostUSD: sku.estimatedCostUSD
    });
  }

  sendQuote(): void {
    if (!this.selectedCustomer) {
      this.feedback.push('Debe seleccionar un cliente', 'Cotizaciones', 'warning');
      return;
    }
    if (!this.lines.length) {
      this.feedback.push('Debe agregar al menos un producto', 'Cotizaciones', 'warning');
      return;
    }

    const maxId = this.store.snapshot.quotes.reduce((max, q) => Math.max(max, Number(q.id.split('-').pop() || '0')), 0);
    const nextSeq = maxId + 1;
    const year = new Date().getFullYear();
    const quoteId = `Q-${year}-${String(nextSeq).padStart(4, '0')}`;
    const now = new Date();

    const estimatedMarginPct = Math.max(
      0,
      Math.round(
        ((this.lines.reduce((a, l) => a + l.qty * l.unitPriceUSD, 0) - this.lines.reduce((a, l) => a + l.qty * l.estimatedCostUSD, 0)) /
          Math.max(1, this.lines.reduce((a, l) => a + l.qty * l.unitPriceUSD, 0))) *
          100
      )
    );

    const quote: Quote = {
      id: quoteId,
      customerId: this.selectedCustomer.id,
      sellerId: this.selectedCustomer.sellerId,
      status: 'Enviada',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      estimatedMarginPct,
      subtotalUSD: Math.round(this.subtotalUSD),
      taxUSD: this.taxUSD,
      totalUSD: this.totalUSD
    };

    const quoteLines: QuoteLine[] = this.lines.map((line, idx) => ({
      id: `QL-${quoteId}-${idx + 1}`,
      quoteId,
      skuId: line.skuId,
      qty: line.qty,
      unitPriceUSD: line.unitPriceUSD,
      discountPct: 0,
      lineMarginPct: Math.round(((line.unitPriceUSD - line.estimatedCostUSD) / Math.max(1, line.unitPriceUSD)) * 100),
      requiresApproval: false
    }));

    this.store.updateState((s) => ({ ...s, quotes: [quote, ...s.quotes], quoteLines: [...quoteLines, ...s.quoteLines] }));
    this.audit.add({ entityType: 'Quote', entityId: quoteId, action: 'SEND', summary: `Cotización ${quoteId} enviada al cliente ${this.selectedCustomer.legalName}` });
    this.feedback.push(`Cotización enviada automáticamente a ${this.selectedCustomer.companyEmail}`, 'Cotizaciones', 'success', 2600);
    this.router.navigate(['/dashboard/cotizaciones']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/cotizaciones']);
  }
}
