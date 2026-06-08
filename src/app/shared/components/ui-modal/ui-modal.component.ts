import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

/**
 * Modal/diálogo reutilizable: overlay centrado + backdrop + tarjeta con header,
 * cuerpo scrollable y footer opcional. Cierra por backdrop, botón y tecla ESC.
 * Bloquea el scroll del body mientras hay al menos un modal abierto (contador estático).
 *
 * Uso:
 *   <app-ui-modal [open]="x" title="..." size="lg" (close)="x=false">
 *     ...contenido del cuerpo...
 *     <div modal-footer> ...botones... </div>   <!-- requiere [hasFooter]="true" -->
 *   </app-ui-modal>
 */
@Component({
  selector: 'app-ui-modal',
  standalone: true,
  styles: [
    '.ui-modal-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 1rem; }',
    '.ui-modal-backdrop { position: fixed; inset: 0; background: rgba(8, 12, 20, .5); }',
    '.ui-modal-dialog { position: relative; z-index: 1201; width: 100%; margin: 0 auto; }',
    '.ui-modal-dialog.size-sm { max-width: 460px; }',
    '.ui-modal-dialog.size-md { max-width: 620px; }',
    '.ui-modal-dialog.size-lg { max-width: 820px; }',
    '.ui-modal-dialog.size-xl { max-width: 980px; }',
    '.ui-modal-card { background: var(--vx-surface); border: 1px solid var(--vx-border); border-radius: var(--vx-radius-xl); box-shadow: var(--vx-shadow-lg); max-height: min(92dvh, 900px); display: flex; flex-direction: column; overflow: hidden; }',
    '.ui-modal-head { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .9rem 1.1rem; border-bottom: 1px solid var(--vx-border); }',
    '.ui-modal-title { margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--vx-text); }',
    '.ui-modal-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding: 1.1rem; }',
    '.ui-modal-foot { flex: 0 0 auto; display: flex; align-items: center; justify-content: flex-end; gap: .5rem; padding: .85rem 1.1rem; border-top: 1px solid var(--vx-border); }',
    '@media (max-width: 767px) { .ui-modal-overlay { padding: .6rem; } .ui-modal-card { max-height: calc(100dvh - 1.2rem); } }'
  ],
  template: `
    @if (open) {
      <div class="ui-modal-overlay" tabindex="-1" role="dialog" aria-modal="true" (keydown.escape)="close.emit()">
        <div class="ui-modal-backdrop" (click)="close.emit()"></div>
        <div class="ui-modal-dialog" [class]="'size-' + size" (click)="$event.stopPropagation()">
          <div class="ui-modal-card">
            <div class="ui-modal-head">
              <h5 class="ui-modal-title">{{ title }}</h5>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="close.emit()"></button>
            </div>
            <div class="ui-modal-body">
              <ng-content></ng-content>
            </div>
            @if (hasFooter) {
              <div class="ui-modal-foot">
                <ng-content select="[modal-footer]"></ng-content>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class UiModalComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() hasFooter = false;
  @Output() close = new EventEmitter<void>();

  private static openCount = 0;
  private locked = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) this.applyLock(this.open);
  }

  ngOnDestroy(): void {
    this.applyLock(false);
  }

  /** Bloqueo de scroll del body con contador estático (soporta varios modales abiertos). */
  private applyLock(shouldLock: boolean): void {
    if (typeof document === 'undefined') return;
    if (shouldLock && !this.locked) {
      this.locked = true;
      UiModalComponent.openCount += 1;
      document.body.classList.add('modal-open-lock');
    } else if (!shouldLock && this.locked) {
      this.locked = false;
      UiModalComponent.openCount = Math.max(0, UiModalComponent.openCount - 1);
      if (UiModalComponent.openCount === 0) document.body.classList.remove('modal-open-lock');
    }
  }
}
