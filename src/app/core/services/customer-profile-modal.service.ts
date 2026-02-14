import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class CustomerProfileModalService {
  private readonly customerSubject = new BehaviorSubject<Customer | null>(null);
  readonly customer$ = this.customerSubject.asObservable();

  open(customer: Customer): void {
    this.customerSubject.next(customer);
  }

  close(): void {
    this.customerSubject.next(null);
  }

  get current(): Customer | null {
    return this.customerSubject.value;
  }
}
