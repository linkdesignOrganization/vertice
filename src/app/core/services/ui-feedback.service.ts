import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UiToast {
  id: number;
  title: string;
  message: string;
  tone: 'success' | 'info' | 'warning' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  private readonly toastsSubject = new BehaviorSubject<UiToast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  push(message: string, title = 'Sistema', tone: UiToast['tone'] = 'info', timeoutMs = 2600): void {
    const toast: UiToast = { id: Date.now() + Math.floor(Math.random() * 1000), title, message, tone };
    this.toastsSubject.next([toast, ...this.toastsSubject.value]);
    setTimeout(() => this.dismiss(toast.id), timeoutMs);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
