import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';

@Component({
  selector: 'app-pod-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule, SignaturePadComponent],
  styles: [
    '.mobile-camera-card { border: 1px dashed rgba(31,111,235,.45); border-radius: .9rem; background: rgba(31,111,235,.06); padding: .9rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: .6rem; font-weight: 600; color: #1c3f74; }',
    '.mobile-camera-card i { font-size: 1.15rem; }',
    '.photo-preview { max-width: 220px; }',
    '.signature-block { margin-bottom: .5rem; }',
    '.signature-title { display: block; }',
    '@media (max-width: 991px) { .signature-block { text-align: center; } .signature-title { text-align: center; } }'
  ],
  template: `
    <div class="mb-3">
      <label class="form-label">Nombre del responsable</label>
      <input class="form-control" [(ngModel)]="deliveredByName" (ngModelChange)="emit()" />
    </div>

    <div class="mb-3">
      <label class="form-label">Foto de guía</label>
      <input class="form-control d-none d-lg-block" type="file" accept="image/*" capture="environment" (change)="onPhoto($event)" />
      <input #mobilePhotoInput class="d-none" type="file" accept="image/*" capture="environment" (change)="onPhoto($event)" />
      <button class="mobile-camera-card d-lg-none" type="button" (click)="mobilePhotoInput.click()">
        <i class="bi bi-camera-fill"></i>
        <span>Abrir cámara</span>
      </button>
    </div>

    <div *ngIf="hasPhotoPreview" class="mb-3">
      <img [src]="photoDataUrl" alt="preview" class="img-fluid rounded border photo-preview" (error)="onPreviewError()" />
      <small class="d-block text-secondary mt-1"><i class="bi bi-check2-circle"></i> Cargado en sesión</small>
    </div>

    <div class="mb-2 signature-block">
      <label class="form-label signature-title">Firma</label>
      <app-signature-pad (signatureChange)="onSignature($event)" />
    </div>
  `
})
export class PodUploaderComponent implements OnChanges {
  @Input() initialPod?: { deliveredByName: string; photo: string; signature: string };
  @Output() podChange = new EventEmitter<{ deliveredByName: string; photo: string; signature: string }>();
  deliveredByName = '';
  photoDataUrl = '';
  signatureDataUrl = '';
  private hidePreview = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['initialPod'] || !this.initialPod) return;
    this.deliveredByName = this.initialPod.deliveredByName || '';
    this.photoDataUrl = this.initialPod.photo || '';
    this.signatureDataUrl = this.initialPod.signature || '';
    this.hidePreview = false;
  }

  onPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoDataUrl = String(reader.result || '');
      this.hidePreview = false;
      this.emit();
    };
    reader.readAsDataURL(file);
  }

  get hasPhotoPreview(): boolean {
    if (this.hidePreview) return false;
    const value = this.photoDataUrl?.trim();
    return value.startsWith('data:image/') || value.startsWith('blob:') || value.startsWith('http://') || value.startsWith('https://');
  }

  onPreviewError(): void {
    this.hidePreview = true;
  }

  onSignature(value: string): void {
    this.signatureDataUrl = value;
    this.emit();
  }

  emit(): void {
    this.podChange.emit({
      deliveredByName: this.deliveredByName,
      photo: this.photoDataUrl,
      signature: this.signatureDataUrl
    });
  }
}
