import { Injectable } from '@angular/core';
import { SessionStoreService } from './session-store.service';
import { InventoryCalculationService } from './inventory-calculation.service';

@Injectable({ providedIn: 'root' })
export class KpiService {
  constructor(
    private readonly store: SessionStoreService,
    private readonly inventoryCalc: InventoryCalculationService
  ) {}

  getSummary() {
    const state = this.store.snapshot;
    const now = new Date();

    const deliveredLike = state.orders.filter((o) => ['Despachado', 'Entregado', 'Cerrado'].includes(o.status));
    const otif = deliveredLike.length
      ? Math.round(
          (deliveredLike.filter((o) => {
            const promised = new Date(o.promisedAt);
            const delivered = o.invoiceSimulatedAt ? new Date(o.invoiceSimulatedAt) : now;
            return delivered <= promised;
          }).length /
            deliveredLike.length) *
            100
        )
      : 0;

    const atrasados = state.orders.filter((o) => !['Entregado', 'Cerrado'].includes(o.status) && new Date(o.promisedAt) < now).length;
    const quiebres = state.skus.filter((sku) => {
      const total = state.stock
        .filter((s) => s.skuId === sku.id)
        .reduce((acc, s) => acc + this.inventoryCalc.qtyAvailable(s.qtyOnHand, s.qtyReserved), 0);
      return total < sku.minStock;
    }).length;

    const ventasPeriodo = deliveredLike.reduce((acc, o) => acc + o.totalUSD, 0);
    const stockTotal = state.stock.reduce((acc, s) => acc + this.inventoryCalc.qtyAvailable(s.qtyOnHand, s.qtyReserved), 0) || 1;
    const rotacion = Number((ventasPeriodo / stockTotal).toFixed(2));

    const conversion = state.quotes.length
      ? Math.round((state.quotes.filter((q) => q.status === 'Convertida a pedido').length / state.quotes.length) * 100)
      : 0;

    return {
      otif,
      atrasados,
      quiebres,
      rotacion,
      ventasPeriodo,
      cotizaciones: state.quotes.length,
      conversion
    };
  }
}
