import { Component, Input } from '@angular/core';

/**
 * Encabezado de pantalla reutilizable (icono + título + subtítulo opcional) con un slot
 * a la derecha para acciones (botón "Nuevo", "Atrás", etc.) vía <ng-content>.
 * Reemplaza el markup `.page-header` que estaba duplicado en cada feature.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header justify-content-between flex-wrap">
      <div class="d-flex align-items-center gap-2">
        <i class="bi {{ icon }} fs-4"></i>
        <div>
          <h2 class="section-title mb-0">{{ title }}</h2>
          @if (subtitle) { <small class="text-secondary">{{ subtitle }}</small> }
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 ms-auto">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() subtitle = '';
}
