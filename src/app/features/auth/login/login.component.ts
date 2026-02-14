import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div class="row w-100 justify-content-center m-0">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div class="glass-card p-4 p-lg-5">
            <div class="text-center mb-3">
              <img class="img-fluid d-inline-block" src="assets/logovertice.svg" alt="Logo Vértice Seguridad Industrial" style="max-width: 220px;" />
            </div>
            <h3 class="fw-bold mb-1">Login {{ roleLabel }}</h3>
            <p class="text-secondary mb-4">Ingrese sus credenciales para continuar</p>

            <div class="mb-3">
              <label class="form-label">Usuario</label>
              <input class="form-control" [(ngModel)]="username" />
            </div>
            <div class="mb-3">
              <label class="form-label">Contraseña</label>
              <input class="form-control" [(ngModel)]="password" type="password" />
            </div>

            <button class="btn btn-primary w-100" (click)="submit()"><i class="bi bi-box-arrow-in-right me-1"></i>Ingresar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router,
    private readonly feedback: UiFeedbackService
  ) {
    if (!auth.selectedRole) this.router.navigate(['/auth/selector-rol']);
  }

  get roleLabel(): string {
    return this.auth.selectedRole === 'MASTER' ? 'GERENCIA' : this.auth.selectedRole || '';
  }

  submit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.feedback.push('Usuario y contraseña son obligatorios', 'Validación', 'warning');
      return;
    }

    const ok = this.auth.login(this.username, this.password);
    if (!ok) {
      this.feedback.push('Credenciales inválidas para el rol seleccionado', 'Acceso', 'danger');
      return;
    }
    this.feedback.push('Ingreso exitoso', 'Bienvenido', 'success');
    this.router.navigate(['/dashboard/home']);
  }
}
