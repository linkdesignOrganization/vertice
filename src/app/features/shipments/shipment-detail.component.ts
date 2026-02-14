import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Shipment, ShipmentStatus } from '../../core/models/entities';
import { RuleEngineService } from '../../core/services/rule-engine.service';
import { SessionStoreService } from '../../core/services/session-store.service';
import { PodUploaderComponent } from '../../shared/components/pod-uploader/pod-uploader.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [FormsModule, PodUploaderComponent, StatusChipComponent],
  template: `
    <div class="page-header justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-truck fs-4"></i>
        <h2 class="section-title mb-0">Detalle de despacho</h2>
      </div>
      <button class="btn btn-outline-secondary btn-sm d-lg-none" type="button" (click)="goBack()">
        <i class="bi bi-arrow-left me-1"></i>Atrás
      </button>
    </div>

    @if (!shipment) {
      <div class="glass-card p-3">
        <div class="empty-state">No se encontró el despacho solicitado.</div>
        <div class="text-center">
          <button class="btn btn-outline-secondary" (click)="goBack()"><i class="bi bi-arrow-left me-1"></i>Volver a despachos</button>
        </div>
      </div>
    } @else {
      <div class="row g-3">
        <div class="col-12 col-xl-5">
          <div class="glass-card p-3 h-100">
            <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-1"></i>Información</h6>
            <div class="mobile-list-kv">
              <div><span>ID</span><strong>{{ shipment.id }}</strong></div>
              <div><span>Pedido</span><span>{{ shipment.orderId }}</span></div>
              <div><span>Transportista</span><span>{{ carrierName }}</span></div>
              <div><span>Estado actual</span><app-status-chip [status]="shipment.status" /></div>
            </div>

            @if ((shipment.status === 'Transportista' || shipment.status === 'Recogida') && shipment.podGuidePhotoDataUrl) {
              <div class="mt-3">
                <div class="small fw-semibold mb-1">Evidencia actual</div>
                <img [src]="shipment.podGuidePhotoDataUrl" class="img-fluid rounded border" alt="Foto guía actual" style="max-width: 260px;" />
              </div>
            }
          </div>
        </div>

        <div class="col-12 col-xl-7">
          <div class="glass-card p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-sliders me-1"></i>Actualizar despacho</h6>
            <div class="mb-3">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="selectedStatus">
                @for (st of statuses; track st) { <option [ngValue]="st" [disabled]="st === 'Transportista'">{{ st }}</option> }
              </select>
            </div>

            @if (selectedStatus === 'Listo para recoger') {
              <div class="alert alert-light border">
                Debe firmar el encargado de quien prepara el "listo".
              </div>
              <app-pod-uploader [initialPod]="pod" (podChange)="pod = $event" />
            } @else {
              <div class="alert alert-light border mb-0">
                El estado base es <strong>Pendiente</strong>. Cuando esté listo, seleccione <strong>Listo para recoger</strong> y complete evidencia.
              </div>
            }

            <div class="d-flex flex-column flex-md-row gap-2 justify-content-end mt-3">
              <button class="btn btn-outline-secondary" type="button" (click)="goBack()">Volver</button>
              <button class="btn btn-primary" type="button" [disabled]="isSaveDisabled" (click)="save()">
                <i class="bi bi-check2-circle me-1"></i>Reportar a repartidor
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ShipmentDetailComponent {
  statuses: Array<ShipmentStatus | 'Listo para recoger'> = ['Pendiente', 'Listo para recoger'];
  shipment?: Shipment;
  selectedStatus: ShipmentStatus | 'Listo para recoger' = 'Pendiente';
  pod = { deliveredByName: '', photo: '', signature: '' };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly store: SessionStoreService,
    private readonly rules: RuleEngineService
  ) {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('shipmentId');
      this.shipment = id ? this.store.snapshot.shipments.find((s) => s.id === id) : undefined;
      if (!this.shipment) return;
      this.selectedStatus = this.shipment.status;
      this.pod = {
        deliveredByName: this.shipment.deliveredByName || '',
        photo: this.shipment.podGuidePhotoDataUrl || '',
        signature: this.shipment.podSignatureDataUrl || ''
      };
    });
  }

  get carrierName(): string {
    if (!this.shipment) return 'Sin asignar';
    const carrier = this.store.snapshot.carriers.find((c) => c.id === this.shipment!.carrierId);
    return carrier?.name || 'Sin asignar';
  }

  get isSaveDisabled(): boolean {
    if (!this.shipment) return true;
    if (this.selectedStatus !== 'Listo para recoger') return false;
    return !this.pod.deliveredByName.trim() || !this.pod.photo || !this.pod.signature;
  }

  save(): void {
    if (!this.shipment) return;
    const nextStatus: ShipmentStatus = this.selectedStatus === 'Listo para recoger' ? 'Recogida' : this.selectedStatus;
    const ok = this.rules.updateShipmentStatus(this.shipment, nextStatus, this.pod);
    if (!ok) return;

    this.shipment = this.store.snapshot.shipments.find((s) => s.id === this.shipment!.id);
    if (this.shipment) {
      this.selectedStatus = this.shipment.status;
      this.pod = {
        deliveredByName: this.shipment.deliveredByName || '',
        photo: this.shipment.podGuidePhotoDataUrl || '',
        signature: this.shipment.podSignatureDataUrl || ''
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/despachos']);
  }
}
