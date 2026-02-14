import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InventoryCalculationService {
  qtyAvailable(qtyOnHand: number, qtyReserved: number): number {
    return qtyOnHand - qtyReserved;
  }
}
