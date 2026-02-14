import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `<span class="badge rounded-pill" [class]="badgeClass">{{ status }}</span>`
})
export class StatusChipComponent {
  @Input({ required: true }) status = '';

  get badgeClass(): string {
    if (this.status.includes('Entregado') || this.status.includes('Cerrado') || this.status.includes('Recibida') || this.status.includes('Recogida') || this.status.includes('Nota de crédito') || this.status.includes('emitida')) {
      return 'bg-success-subtle text-success-emphasis border border-success-subtle';
    }
    if (this.status.includes('Transportista')) {
      return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    }
    if (this.status.includes('Rechazada') || this.status.includes('Expirada')) {
      return 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
    }
    if (this.status.includes('Aprob')) {
      return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    }
    return 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
  }
}
