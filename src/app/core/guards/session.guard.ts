import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Garantiza que siempre exista una sesión activa al entrar al dashboard.
// Sin pantalla de login: si no hay usuario, inicia sesión como GERENCIA (MASTER).
export const sessionGuard: CanActivateFn = () => {
  inject(AuthService).ensureSession();
  return true;
};
