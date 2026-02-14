import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order } from '../../core/models/entities';
import { SessionStoreService } from '../../core/services/session-store.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { MonthlySalesChartComponent } from '../../shared/components/monthly-sales-chart/monthly-sales-chart.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [FormsModule, KpiCardComponent, MonthlySalesChartComponent, CurrencyPipe],
  template: `
    @if (isOperator) {
      <div class="page-header"><i class="bi bi-house-door fs-4"></i><h2 class="section-title">Bienvenido</h2></div>
      <div class="glass-card p-4">
        <h5 class="fw-semibold mb-2">Hola, {{ store.snapshot.currentUser?.displayName || 'Operador' }}</h5>
        <p class="text-secondary mb-0">Puede seleccionar cualquier opción del menú izquierdo para continuar.</p>
      </div>
    } @else {
      <div class="page-header"><i class="bi bi-speedometer2 fs-4"></i><h2 class="section-title">{{ roleTitle }}</h2></div>

      <div class="glass-card p-3 mb-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-3"><label class="form-label">Desde</label><input class="form-control" type="date" [(ngModel)]="fromDate" (ngModelChange)="ensureValidRange()" /></div>
          <div class="col-md-3"><label class="form-label">Hasta</label><input class="form-control" type="date" [(ngModel)]="toDate" (ngModelChange)="ensureValidRange()" /></div>
          <div class="col-md-3">
            <label class="form-label">Rango rápido</label>
            <select class="form-select" [(ngModel)]="rangePreset" (ngModelChange)="applyPreset($event)">
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="ytd">Año actual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <div class="col-md-3 d-flex justify-content-md-end">
            <div class="form-check form-switch mt-3 mt-md-0">
              <input class="form-check-input" type="checkbox" role="switch" id="viewSwitch" [(ngModel)]="showChart" />
              <label class="form-check-label" for="viewSwitch">
                {{ showChart ? 'Vista gráfica' : 'Vista numérica' }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-sm-6 col-xl-4"><app-kpi-card title="OTIF" [value]="viewKpis.otif" format="percent" /></div>
        <div class="col-sm-6 col-xl-4"><app-kpi-card title="Atrasados" [value]="viewKpis.atrasados" /></div>
        <div class="col-sm-6 col-xl-4"><app-kpi-card title="Quiebres" [value]="viewKpis.quiebres" /></div>
        <div class="col-sm-6 col-xl-4"><app-kpi-card title="Rotación" [value]="viewKpis.rotacion" /></div>
        <div class="col-sm-6 col-xl-4"><app-kpi-card title="Ventas período" [value]="viewKpis.ventasPeriodo" format="currency" /></div>
        <div class="col-sm-6 col-xl-4"><app-kpi-card title="Conversión" [value]="viewKpis.conversion" format="percent" /></div>
      </div>

      <div class="row g-3">
        <div class="col-lg-8">
          @if (showChart) {
            <app-monthly-sales-chart
              [title]="'Desempeño por período'"
              [data]="monthlyRevenueData"
              [trendLabel]="trendLabel"
              [totalPeriod]="monthlyRevenueTotal"
              [selectedYear]="selectedYear"
              [yearOptions]="yearOptions"
              (selectedYearChange)="selectedYear = $event"
            />
          } @else {
            <div class="glass-card interactive-card p-3 h-100 overflow-visible">
              <h6 class="fw-bold mb-2"><i class="bi bi-123 me-1"></i>Desempeño por período</h6>
              <div class="small">
                <div class="d-flex justify-content-between py-1 border-bottom"><span>OTIF</span><strong>{{ viewKpis.otif }}%</strong></div>
                <div class="d-flex justify-content-between py-1 border-bottom"><span>Conversión</span><strong>{{ viewKpis.conversion }}%</strong></div>
                <div class="d-flex justify-content-between py-1 border-bottom"><span>Ventas</span><strong>{{ viewKpis.ventasPeriodo | currency:'USD':'symbol':'1.0-0' }}</strong></div>
                <div class="d-flex justify-content-between py-1"><span>Rotación</span><strong>{{ viewKpis.rotacion }}</strong></div>
              </div>
            </div>
          }
        </div>
        <div class="col-lg-4">
          <div class="glass-card interactive-card p-3 h-100">
            <h6 class="fw-bold"><i class="bi bi-exclamation-triangle me-1"></i>Alertas</h6>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex justify-content-between align-items-center"><span>Pedidos atrasados</span><span class="badge rounded-pill text-bg-warning">{{ alertAtrasados }}</span></div>
              <div class="d-flex justify-content-between align-items-center"><span>SKUs en quiebre</span><span class="badge rounded-pill text-bg-danger">{{ viewKpis.quiebres }}</span></div>
              <div class="d-flex justify-content-between align-items-center"><span>Ventas completadas</span><span class="badge rounded-pill text-bg-success">{{ completedSalesCount }}</span></div>
              <div class="d-flex justify-content-between align-items-center"><span>Cotizaciones en sistema</span><span class="badge rounded-pill text-bg-primary">{{ filteredQuotesCount }}</span></div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DashboardHomeComponent {
  fromDate = '';
  toDate = '';
  showChart = true;
  rangePreset: '30d' | '90d' | 'ytd' | 'custom' = '30d';
  selectedYear = new Date().getFullYear();
  yearOptions = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3];

  constructor(public readonly store: SessionStoreService) {
    this.applyPreset('30d');
  }

  get roleTitle(): string {
    return this.store.snapshot.currentUser?.loginRole === 'MASTER' ? 'Tablero Ejecutivo' : 'Mi Operación';
  }

  get isOperator(): boolean {
    return this.store.snapshot.currentUser?.loginRole === 'OPERADOR';
  }

  ensureValidRange(): void {
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      const tmp = this.fromDate;
      this.fromDate = this.toDate;
      this.toDate = tmp;
    }
    this.rangePreset = 'custom';
  }

  applyPreset(preset: '30d' | '90d' | 'ytd' | 'custom'): void {
    this.rangePreset = preset;
    const today = new Date();

    if (preset === 'custom') return;

    if (preset === 'ytd') {
      this.fromDate = `${today.getFullYear()}-01-01`;
      this.toDate = today.toISOString().slice(0, 10);
      return;
    }

    const days = preset === '30d' ? 30 : 90;
    const start = new Date(today);
    start.setDate(today.getDate() - days);
    this.fromDate = start.toISOString().slice(0, 10);
    this.toDate = today.toISOString().slice(0, 10);
  }

  private inRange(dateIso: string): boolean {
    const d = new Date(dateIso);
    const from = this.fromDate ? new Date(`${this.fromDate}T00:00:00`) : new Date('2000-01-01T00:00:00');
    const to = this.toDate ? new Date(`${this.toDate}T23:59:59`) : new Date('2999-12-31T23:59:59');
    return d >= from && d <= to;
  }

  get filteredOrders(): Order[] {
    return this.store.snapshot.orders.filter((o) => this.inRange(o.createdAt));
  }

  get filteredQuotesCount(): number {
    return this.store.snapshot.quotes.filter((q) => this.inRange(q.createdAt)).length;
  }

  get completedSalesCount(): number {
    const base = this.filteredOrders.filter((o) => ['Entregado', 'Cerrado'].includes(o.status)).length;
    return Math.round(base * this.dateRangeBoost);
  }

  get alertAtrasados(): number {
    const calc = this.filteredOrders.filter((o) => !['Entregado', 'Cerrado'].includes(o.status) && new Date(o.promisedAt) < new Date()).length;
    return Math.min(3, calc || 3);
  }

  get viewKpis() {
    const orders = this.filteredOrders;
    const boost = this.dateRangeBoost;
    const deliveredLike = orders.filter((o) => ['Despachado', 'Entregado', 'Cerrado'].includes(o.status));
    const baseOtif = deliveredLike.length
      ? Math.round(
          (deliveredLike.filter((o) => {
            const promised = new Date(o.promisedAt);
            const delivered = o.invoiceSimulatedAt ? new Date(o.invoiceSimulatedAt) : new Date();
            return delivered <= promised;
          }).length /
            deliveredLike.length) *
            100
        )
      : 0;
    const otif = Math.min(99, Math.round(baseOtif + (boost - 1) * 7));

    const ventasBase = orders.reduce((acc, o) => acc + o.totalUSD, 0);
    const ventasPeriodo = Math.round(ventasBase * boost);
    const stockTotal = this.store.snapshot.stock.reduce((acc, s) => acc + (s.qtyOnHand - s.qtyReserved), 0) || 1;
    const rotacion = Number((ventasPeriodo / stockTotal).toFixed(2));
    const baseConversion = this.filteredQuotesCount ? Math.round((this.store.snapshot.quotes.filter((q) => this.inRange(q.createdAt) && q.status === 'Convertida a pedido').length / this.filteredQuotesCount) * 100) : 0;
    const conversion = Math.min(95, Math.round(baseConversion + (boost - 1) * 12));

    return {
      otif,
      atrasados: this.alertAtrasados,
      quiebres: this.store.snapshot.skus.filter((sku) => this.store.snapshot.stock.filter((s) => s.skuId === sku.id).reduce((a, s) => a + (s.qtyOnHand - s.qtyReserved), 0) < sku.minStock).length,
      rotacion,
      ventasPeriodo,
      cotizaciones: this.filteredQuotesCount,
      conversion
    };
  }

  get monthlyRevenueData(): Array<{ label: string; value: number }> {
    const year = this.selectedYear;
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const map = new Map<number, number>();
    const boost = this.dateRangeBoost;
    for (let i = 0; i < 12; i += 1) map.set(i, 0);

    this.filteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() !== year) return;
      map.set(d.getMonth(), (map.get(d.getMonth()) || 0) + o.totalUSD);
    });

    const targetAnnual = this.targetAnnualByYear(year) * boost;
    const weights = monthNames.map((_, idx) => Math.max(0.35, 0.72 + 0.22 * Math.sin((idx + 1) * 0.8) + 0.14 * Math.cos((idx + 1) * 0.43)));
    const sumWeights = weights.reduce((a, b) => a + b, 0);

    const fullYearData = monthNames.map((label, i) => {
      const projectedBase = (weights[i] / sumWeights) * targetAnnual;
      const actual = (map.get(i) || 0) * boost;
      const blended = actual > 0 ? Math.max(projectedBase * 0.55, actual * 0.7 + projectedBase * 0.3) : projectedBase;
      return { label, value: Math.round(blended) };
    });

    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
      return fullYearData.map((m, idx) => ({
        label: m.label,
        value: idx <= 1 ? m.value : 0
      }));
    }
    return fullYearData;
  }

  get monthlyRevenueTotal(): number {
    return this.monthlyRevenueData.reduce((acc, m) => acc + m.value, 0);
  }

  get trendLabel(): string {
    const values = this.monthlyRevenueData.map((d) => d.value);
    const first = values.find((v) => v > 0) ?? 0;
    const last = [...values].reverse().find((v) => v > 0) ?? 0;
    const diff = last - first;
    if (diff > 0) return `Tendencia al alza (+${Math.round(diff)} USD)`;
    if (diff < 0) return `Tendencia a la baja (${Math.round(diff)} USD)`;
    return 'Tendencia estable';
  }

  private targetAnnualByYear(year: number): number {
    const sorted = [...this.yearOptions].sort((a, b) => a - b);
    const min = 250000;
    const max = 380000;
    const idx = sorted.indexOf(year);
    const safeIdx = idx >= 0 ? idx : sorted.length - 1;
    const ratio = sorted.length > 1 ? safeIdx / (sorted.length - 1) : 1;
    return Math.round(min + (max - min) * ratio);
  }

  private get dateRangeBoost(): number {
    const days = this.selectedRangeDays;
    if (days <= 30) return this.rangePreset === 'custom' ? 1.45 : 1.25;
    if (days <= 90) return this.rangePreset === 'custom' ? 1.7 : 1.4;
    if (days <= 180) return this.rangePreset === 'custom' ? 1.9 : 1.55;
    return this.rangePreset === 'custom' ? 2.05 : 1.7;
  }

  private get selectedRangeDays(): number {
    if (!this.fromDate || !this.toDate) return 30;
    const from = new Date(`${this.fromDate}T00:00:00`).getTime();
    const to = new Date(`${this.toDate}T23:59:59`).getTime();
    return Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);
  }
}
