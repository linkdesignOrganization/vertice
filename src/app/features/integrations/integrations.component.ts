import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header icon="bi-diagram-3" title="Integraciones (vista)" />
    <div class="row g-3">
      <div class="col-md-4">
        <div class="glass-card p-3 h-100">
          <h6 class="fw-bold"><i class="bi bi-bag-check me-1"></i>E-commerce</h6>
          <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">Conectado</span>
          <div class="small text-secondary mt-2">Proveedor: Vértice Seguridad Industrial</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass-card p-3 h-100">
          <h6 class="fw-bold"><i class="bi bi-receipt-cutoff me-1"></i>Facturación</h6>
          <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">Conectado</span>
          <div class="small text-secondary mt-2">Proveedor: FacturaPro</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass-card p-3 h-100">
          <h6 class="fw-bold"><i class="bi bi-truck-flatbed me-1"></i>Tracking</h6>
          <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">Conectado</span>
          <div class="small text-secondary mt-2">Proveedor: TrackFlow</div>
        </div>
      </div>
    </div>
  `
})
export class IntegrationsComponent {}
