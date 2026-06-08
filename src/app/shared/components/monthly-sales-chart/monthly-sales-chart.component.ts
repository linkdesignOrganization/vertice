import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-monthly-sales-chart',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="chart-surface interactive-card p-3 h-100">
      <div class="d-flex justify-content-between align-items-end mb-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-bar-chart-line me-1"></i>{{ title }}</h6>
        <div style="min-width: 130px;">
          <select class="form-select form-select-sm" [ngModel]="selectedYear" (ngModelChange)="selectedYearChange.emit($event)">
            @for (year of yearOptions; track year) {
              <option [ngValue]="year">{{ year }}</option>
            }
          </select>
        </div>
      </div>
      <div class="chart-grid" [style.--cols]="bars.length">
        @for (item of bars; track item.label) {
          <div class="bar-col">
            <div class="bar-wrap">
              <div class="bar-popover">{{ item.value | currency:'USD':'symbol':'1.0-0' }}</div>
              <div class="bar" [class.bar-zero]="item.height === 0" [style.height.%]="item.height"></div>
            </div>
            <small class="bar-label">{{ item.label }}</small>
          </div>
        }
      </div>
      <div class="small mt-2 pt-1 pb-1 d-flex flex-wrap gap-2">
        <span class="badge text-bg-light border">{{ trendLabel }}</span>
        <span class="badge text-bg-light border">Total anual: {{ totalPeriod | currency:'USD':'symbol':'1.0-0' }}</span>
      </div>
    </div>
  `,
  styles: [
    '.chart-surface { background: var(--vx-surface); border: 1px solid var(--vx-border); border-radius: var(--vx-radius-lg); overflow: visible; }',
    '.chart-grid { display: grid; grid-template-columns: repeat(var(--cols, 12), minmax(0, 1fr)); gap: .45rem; align-items: end; min-height: 242px; padding-top: .65rem; padding-bottom: .95rem; }',
    '.bar-col { display: flex; flex-direction: column; align-items: center; gap: .35rem; }',
    '.bar-wrap { width: 100%; height: 185px; display: flex; align-items: end; justify-content: center; position: relative; }',
    '.bar { width: 100%; max-width: 24px; border-radius: var(--vx-radius-sm); background: var(--vx-primary); transition: transform .18s ease, background-color .18s ease; }',
    '.bar-zero { height: 0 !important; min-height: 0; }',
    '.bar:hover { transform: translateY(-2px); background: var(--vx-primary-hover); }',
    '.bar-popover { position: absolute; top: -2.1rem; left: 50%; transform: translateX(-50%) translateY(6px); opacity: 0; pointer-events: none; background: var(--vx-text); color: #fff; border-radius: var(--vx-radius-sm); padding: .18rem .45rem; font-size: .68rem; white-space: nowrap; transition: opacity .15s ease, transform .15s ease; box-shadow: var(--vx-shadow); }',
    '.bar-col:hover .bar-popover { opacity: 1; transform: translateX(-50%) translateY(0); }',
    '.bar-label { color: var(--vx-text-muted); font-size: .70rem; text-transform: uppercase; letter-spacing: .03em; padding-bottom: .15rem; }'
  ]
})
export class MonthlySalesChartComponent {
  @Input() title = 'Desempeño por período';
  @Input() data: Array<{ label: string; value: number }> = [];
  @Input() trendLabel = '';
  @Input() totalPeriod = 0;
  @Input() selectedYear = new Date().getFullYear();
  @Input() yearOptions: number[] = [];
  @Output() selectedYearChange = new EventEmitter<number>();

  get bars(): Array<{ label: string; value: number; height: number }> {
    const max = Math.max(...this.data.map((d) => d.value), 1);
    return this.data.map((d) => ({
      label: d.label,
      value: d.value,
      height: d.value <= 0 ? 0 : Math.max(5, Math.round((d.value / max) * 100))
    }));
  }
}
