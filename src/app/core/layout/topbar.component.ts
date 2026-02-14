import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SessionStoreService } from '../services/session-store.service';
import { UserMenuModalService } from '../services/user-menu-modal.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  styles: [
    '.topbar-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap; gap: .5rem; }',
    '.topbar-brand { margin: 0; display: inline-flex; align-items: center; flex: 1 1 auto; min-width: 0; overflow: hidden; }',
    '.brand-logo { min-width: 145px; height: 30px; display: inline-block; }',
    '.brand-logo img { width: 100%; height: 100%; display: block; object-fit: contain; }',
    '.topbar-actions { display: flex; align-items: center; gap: .5rem; flex: 0 0 auto; position: relative; z-index: 2; }',
    '.user-menu-btn { background: transparent; border-color: transparent; min-height: 42px; min-width: 118px; padding: .35rem .75rem; justify-content: center; }',
    '.user-menu-btn:hover, .user-menu-btn:active { background: transparent; border-color: transparent; box-shadow: none; }',
    '.user-menu-btn:focus-visible { outline: 2px solid #1f6feb; outline-offset: 2px; border-radius: .6rem; }',
    '.user-menu-btn i, .user-menu-btn span { pointer-events: none; }',
    '@media (max-width: 576px) { .brand-logo { min-width: 96px; height: 24px; } .user-menu-btn { min-width: 74px; padding: .35rem .55rem; } }'
  ],
  template: `
    <nav class="navbar navbar-expand-lg glass-card rounded-0 border-0 border-bottom">
      <div class="container-fluid topbar-row">
        <button
          class="btn btn-outline-primary d-lg-none me-2"
          type="button"
          aria-label="Abrir menú lateral"
          aria-controls="main-mobile-menu"
          [attr.aria-expanded]="mobileMenuOpen"
          (click)="menuToggle.emit()"
        >
          <i class="bi bi-list"></i>
        </button>
        <span class="navbar-brand fw-bold topbar-brand">
          <span class="brand-logo" aria-label="Logo Vértice Seguridad Industrial" role="img">
            <img src="assets/logovertice.svg" alt="Logo Vértice Seguridad Industrial" />
          </span>
        </span>
        <div class="topbar-actions ms-auto">
          <button class="btn btn-sm user-menu-btn d-flex align-items-center gap-2" type="button" (click)="userMenu.open()">
            <i class="bi bi-person-circle"></i>
            <span class="d-none d-sm-inline">{{ store.snapshot.currentUser?.displayName }}</span>
            <i class="bi bi-chevron-down"></i>
          </button>
        </div>
      </div>
    </nav>
  `
})
export class TopbarComponent {
  @Input() mobileMenuOpen = false;
  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    public readonly store: SessionStoreService,
    public readonly userMenu: UserMenuModalService
  ) {}
}
