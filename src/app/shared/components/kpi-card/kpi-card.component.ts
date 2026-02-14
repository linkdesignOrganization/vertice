import { CurrencyPipe, DecimalPipe, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [DecimalPipe, CurrencyPipe, NgSwitch, NgSwitchCase, NgSwitchDefault],
  template: `
    <div class="glass-card interactive-card p-3 h-100">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <small class="text-uppercase text-secondary fw-semibold">{{ title }}</small>
        <i class="bi bi-graph-up-arrow text-primary"></i>
      </div>
      <div class="kpi-value" [ngSwitch]="format">
        <span *ngSwitchCase="'currency'">{{ value | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
        <span *ngSwitchCase="'percent'">{{ value | number: '1.0-0' }}%</span>
        <span *ngSwitchDefault>{{ value | number: '1.0-0' }}</span>
      </div>
    </div>
  `
})
export class KpiCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) value = 0;
  @Input() format: 'number' | 'currency' | 'percent' = 'number';
}
