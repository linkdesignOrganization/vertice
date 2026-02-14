import { AsyncPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  template: `
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1200; width: min(420px, 96vw);">
      @for (toast of feedback.toasts$ | async; track toast.id) {
        <div class="toast show mb-2 glass-card border-0" role="alert">
          <div class="toast-header bg-transparent border-0">
            <i class="bi me-2" [ngClass]="icon(toast.tone)"></i>
            <strong class="me-auto">{{ toast.title }}</strong>
            <button type="button" class="btn-close" (click)="feedback.dismiss(toast.id)"></button>
          </div>
          <div class="toast-body pt-0">{{ toast.message }}</div>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  constructor(public readonly feedback: UiFeedbackService) {}

  icon(tone: string): string {
    if (tone === 'success') return 'bi-check-circle-fill text-success';
    if (tone === 'warning') return 'bi-exclamation-triangle-fill text-warning';
    if (tone === 'danger') return 'bi-x-octagon-fill text-danger';
    return 'bi-info-circle-fill text-primary';
  }
}
