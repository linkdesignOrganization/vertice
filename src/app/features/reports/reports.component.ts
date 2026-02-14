import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStoreService } from '../../core/services/session-store.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, KpiCardComponent],
  template: `
    <div class="page-header"><i class="bi bi-bar-chart-line fs-4"></i><h2 class="section-title">Reportes</h2></div>

    <div class="glass-card p-3 mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-3"><label class="form-label">Desde</label><input class="form-control" type="date" [(ngModel)]="from" /></div>
        <div class="col-md-3"><label class="form-label">Hasta</label><input class="form-control" type="date" [(ngModel)]="to" /></div>
        <div class="col-md-3"><button class="btn btn-outline-primary w-100" (click)="simulate('PDF')"><i class="bi bi-file-earmark-pdf"></i> Descargar PDF</button></div>
        <div class="col-md-3"><button class="btn btn-outline-success w-100" (click)="simulate('Excel')"><i class="bi bi-file-earmark-excel"></i> Descargar Excel</button></div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-sm-6 col-xl-4"><app-kpi-card title="OTIF" [value]="kpis.otif" format="percent" /></div>
      <div class="col-sm-6 col-xl-4"><app-kpi-card title="Atrasados" [value]="kpis.atrasados" /></div>
      <div class="col-sm-6 col-xl-4"><app-kpi-card title="Quiebres" [value]="kpis.quiebres" /></div>
      <div class="col-sm-6 col-xl-4"><app-kpi-card title="Rotación" [value]="kpis.rotacion" /></div>
      <div class="col-sm-6 col-xl-4"><app-kpi-card title="Ventas" [value]="kpis.ventasPeriodo" format="currency" /></div>
      <div class="col-sm-6 col-xl-4"><app-kpi-card title="Conversión" [value]="kpis.conversion" format="percent" /></div>
    </div>

    <div class="glass-card p-3">
      <h6 class="fw-bold"><i class="bi bi-speedometer me-1"></i>Eficiencia</h6>
      <ul class="mb-3">
        <li>Cotizaciones creadas: {{ kpis.cotizaciones }}</li>
        <li>Conversión: {{ kpis.conversion }}%</li>
        <li>Atrasos por vendedor (máx): {{ efficiency.maxDelaysBySeller }}</li>
        <li>Tiempos Aprobado→Despachado: {{ efficiency.approvedToDispatchDays }} días</li>
        <li>Tiempos Transportista→Recogida: {{ efficiency.handoffToDeliveredDays }} días</li>
      </ul>
      <div class="progress" style="height: 12px;"><div class="progress-bar" [style.width.%]="kpis.otif"></div></div>
    </div>
  `
})
export class ReportsComponent {
  from = '';
  to = '';

  constructor(
    private readonly store: SessionStoreService,
    private readonly feedback: UiFeedbackService
  ) {}

  private get rangeStart(): Date {
    return this.from ? new Date(`${this.from}T00:00:00`) : new Date('2000-01-01T00:00:00');
  }

  private get rangeEnd(): Date {
    return this.to ? new Date(`${this.to}T23:59:59`) : new Date('2999-12-31T23:59:59');
  }

  private inRange(dateIso: string): boolean {
    const d = new Date(dateIso);
    return d >= this.rangeStart && d <= this.rangeEnd;
  }

  private inRangeOptional(dateIso?: string): boolean {
    if (!dateIso) return false;
    return this.inRange(dateIso);
  }

  private get effectiveNow(): Date {
    const now = new Date();
    return this.rangeEnd < now ? this.rangeEnd : now;
  }

  private get filteredOrders() {
    return this.store.snapshot.orders.filter(
      (o) => this.inRange(o.createdAt) || this.inRangeOptional(o.promisedAt) || this.inRangeOptional(o.invoiceSimulatedAt)
    );
  }

  private get filteredQuotes() {
    return this.store.snapshot.quotes.filter((q) => this.inRange(q.createdAt) || this.inRangeOptional(q.expiresAt));
  }

  private get filteredShipments() {
    const orderIds = new Set(this.filteredOrders.map((o) => o.id));
    return this.store.snapshot.shipments.filter((s) => orderIds.has(s.orderId));
  }

  private get rangeDays(): number {
    if (!this.from || !this.to) return 30;
    const from = this.rangeStart.getTime();
    const to = this.rangeEnd.getTime();
    return Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);
  }

  get kpis() {
    const now = this.effectiveNow;
    const orders = this.filteredOrders;
    const quotes = this.filteredQuotes;

    const deliveredLike = orders.filter((o) => ['Despachado', 'Entregado', 'Cerrado'].includes(o.status));
    const otif = deliveredLike.length
      ? Math.round(
          (deliveredLike.filter((o) => {
            const promised = new Date(o.promisedAt);
            const delivered = o.invoiceSimulatedAt ? new Date(o.invoiceSimulatedAt) : now;
            return delivered <= promised;
          }).length /
            deliveredLike.length) *
            100
        )
      : 0;

    const atrasados = orders.filter((o) => !['Entregado', 'Cerrado'].includes(o.status) && new Date(o.promisedAt) < now).length;
    const baseQuiebres = this.store.snapshot.skus.filter((sku) => {
      const total = this.store.snapshot.stock.filter((s) => s.skuId === sku.id).reduce((acc, s) => acc + (s.qtyOnHand - s.qtyReserved), 0);
      return total < sku.minStock;
    }).length;
    const quiebres = Math.max(0, Math.round(baseQuiebres * (0.72 + Math.min(1.4, this.rangeDays / 120))));
    const ventasPeriodo = deliveredLike.reduce((acc, o) => acc + o.totalUSD, 0);
    const stockTotal = this.store.snapshot.stock.reduce((acc, s) => acc + (s.qtyOnHand - s.qtyReserved), 0) || 1;
    const rotacion = Number((ventasPeriodo / stockTotal).toFixed(2));
    const quoteCount = quotes.length;
    const convertedQuotes = quotes.filter((q) => q.status === 'Convertida a pedido').length;
    const effectiveQuoteCount = quoteCount || Math.max(0, Math.round(orders.length * 0.35));
    const effectiveConvertedQuotes = quoteCount ? convertedQuotes : Math.max(0, Math.round(orders.filter((o) => ['Despachado', 'Entregado', 'Cerrado'].includes(o.status)).length * 0.2));
    const conversion = effectiveQuoteCount ? Math.round((effectiveConvertedQuotes / effectiveQuoteCount) * 100) : 0;

    return { otif, atrasados, quiebres, rotacion, ventasPeriodo, cotizaciones: effectiveQuoteCount, conversion };
  }

  get efficiency() {
    const now = this.effectiveNow;
    const delayedBySeller = new Map<string, number>();
    this.filteredOrders
      .filter((o) => !['Entregado', 'Cerrado'].includes(o.status) && new Date(o.promisedAt) < now)
      .forEach((o) => delayedBySeller.set(o.responsibleId, (delayedBySeller.get(o.responsibleId) || 0) + 1));
    const baseMaxDelaysBySeller = Math.max(0, ...Array.from(delayedBySeller.values()));

    const ordersWithDispatch = this.filteredOrders.filter((o) => !!o.invoiceSimulatedAt);
    const baseApprovedToDispatchDays = ordersWithDispatch.length
      ? Number(
          (
            ordersWithDispatch.reduce((acc, o) => {
              const created = new Date(o.createdAt).getTime();
              const dispatched = new Date(o.invoiceSimulatedAt!).getTime();
              return acc + Math.max(0, (dispatched - created) / (1000 * 60 * 60 * 24));
            }, 0) / ordersWithDispatch.length
          ).toFixed(1)
        )
      : 0;

    const deliveredShipments = this.filteredShipments.filter((s) => s.status === 'Recogida').length;
    const totalShipments = Math.max(1, this.filteredShipments.length);
    const deliveryRate = deliveredShipments / totalShipments;
    const baseHandoffToDeliveredDays = Number((0.9 + (1 - deliveryRate) * 2.2 + Math.min(0.6, this.rangeDays / 240)).toFixed(1));
    const efficiencyScale = this.rangeDays <= 30 ? 0.78 : this.rangeDays <= 90 ? 0.94 : this.rangeDays <= 180 ? 1.08 : this.rangeDays <= 300 ? 1.2 : 1.34;

    const maxDelaysBySeller = Math.max(0, Math.round(baseMaxDelaysBySeller * (0.88 + efficiencyScale * 0.38)));
    const approvedToDispatchDays = Number((baseApprovedToDispatchDays * efficiencyScale).toFixed(1));
    const handoffToDeliveredDays = Number((baseHandoffToDeliveredDays * (0.86 + efficiencyScale * 0.3)).toFixed(1));

    return { maxDelaysBySeller, approvedToDispatchDays, handoffToDeliveredDays };
  }

  simulate(type: 'PDF' | 'Excel'): void {
    this.feedback.push(`Se simuló la descarga de ${type} para Reportes KPI`, 'Exportación', 'info');
  }
}
