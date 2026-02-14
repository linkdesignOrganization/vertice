import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-export-simulated-dialog',
  standalone: true,
  template: `<div class="alert alert-info"><i class="bi bi-download"></i> Se simuló la descarga de {{ type }} para {{ context }}.</div>`
})
export class ExportSimulatedDialogComponent {
  @Input() type = 'PDF';
  @Input() context = 'módulo';
}
