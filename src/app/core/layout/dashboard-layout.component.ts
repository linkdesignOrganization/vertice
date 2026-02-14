import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from './sidenav.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidenavComponent],
  styles: [
    '.dashboard-content-shell { position: relative; }'
  ],
  template: `
    <div class="app-shell">
      <app-topbar [mobileMenuOpen]="mobileMenu" (menuToggle)="mobileMenu = !mobileMenu" />
      <div class="container-fluid mt-3">
        <div class="row g-3">
          <aside class="col-lg-2 desktop-sidebar">
            <div class="glass-card h-100 p-2 sticky-top" style="top: 86px;">
              <app-sidenav />
            </div>
          </aside>

          <div
            id="main-mobile-menu"
            class="offcanvas offcanvas-start"
            [class.show]="mobileMenu"
            [style.visibility]="mobileMenu ? 'visible' : 'hidden'"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="main-mobile-menu-title"
            style="width: min(88vw, 320px);"
            (keydown.escape)="mobileMenu=false"
          >
            <div class="offcanvas-header border-bottom">
              <h5 id="main-mobile-menu-title" class="offcanvas-title">Menú</h5>
              <button type="button" class="btn-close" aria-label="Cerrar menú" (click)="mobileMenu=false"></button>
            </div>
            <div class="offcanvas-body">
              <app-sidenav (navigate)="mobileMenu=false" />
            </div>
          </div>
          @if (mobileMenu) {
            <div class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 1040; background: rgba(0,0,0,.25);" (click)="mobileMenu=false"></div>
          }

          <main class="col-12 col-lg-10">
            <div class="dashboard-content-shell p-3 p-lg-4">
              <router-outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  mobileMenu = false;
}
