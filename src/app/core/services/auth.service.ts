import { Injectable } from '@angular/core';
import { LoginRole, User } from '../models/entities';
import { SessionStoreService } from './session-store.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly store: SessionStoreService) {}

  /** Sin pantalla de login: garantiza una sesión activa, por defecto GERENCIA (MASTER). */
  ensureSession(): void {
    if (this.store.snapshot.currentUser) return;
    const master = this.userByRole('MASTER');
    if (master) this.store.updateState((state) => ({ ...state, currentUser: master }));
  }

  /** Cambia de perfil al instante desde el menú de usuario, sin re-autenticar. */
  switchRole(role: LoginRole): void {
    const user = this.userByRole(role);
    if (user) this.store.updateState((state) => ({ ...state, currentUser: user }));
  }

  get currentUser(): User | null {
    return this.store.snapshot.currentUser;
  }

  hasRole(role: LoginRole): boolean {
    return this.currentUser?.loginRole === role;
  }

  private userByRole(role: LoginRole): User | null {
    return this.store.snapshot.users.find((u) => u.loginRole === role) ?? null;
  }
}
