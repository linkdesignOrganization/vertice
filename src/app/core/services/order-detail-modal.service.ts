import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderDetailModalService {
  private readonly orderIdSubject = new BehaviorSubject<string | null>(null);
  readonly orderId$ = this.orderIdSubject.asObservable();

  open(orderId: string): void {
    this.orderIdSubject.next(orderId);
  }

  close(): void {
    this.orderIdSubject.next(null);
  }

  get currentOrderId(): string | null {
    return this.orderIdSubject.value;
  }
}
