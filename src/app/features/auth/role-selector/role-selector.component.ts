import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div class="row w-100 justify-content-center m-0">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div class="glass-card p-4 p-lg-5 text-center">
            <div class="mb-3">
              <img
                class="img-fluid d-inline-block"
                src="assets/logovertice.svg"
                alt="Logo Vértice Seguridad Industrial"
                style="max-width: 220px;"
              />
            </div>
            <p class="text-secondary">Elija su perfil para continuar al login</p>
            <div class="row g-2 justify-content-center mt-3">
              <div class="col-12 col-sm-auto d-grid">
                <button class="btn btn-primary px-4" (click)="go('MASTER')"><i class="bi bi-person me-1"></i>GERENCIA</button>
              </div>
              <div class="col-12 col-sm-auto d-grid">
                <button class="btn btn-outline-primary px-4" (click)="go('OPERADOR')"><i class="bi bi-person me-1"></i>OPERADOR</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoleSelectorComponent {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  go(role: 'MASTER' | 'OPERADOR'): void {
    this.auth.selectRole(role);
    this.router.navigate(['/auth/login']);
  }
}
