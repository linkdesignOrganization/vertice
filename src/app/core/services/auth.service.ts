import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRole, User } from '../models/entities';
import { SessionStoreService } from './session-store.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  selectedRole: LoginRole | null = null;

  constructor(
    private readonly store: SessionStoreService,
    private readonly router: Router
  ) {}

  selectRole(role: LoginRole): void {
    this.selectedRole = role;
  }

  login(username: string, password: string): boolean {
    if (!username.trim() || !password.trim() || !this.selectedRole) return false;

    const allowedUsers = this.store.snapshot.users.filter(
      (u) => (u.loginRole === 'MASTER' || u.loginRole === 'OPERADOR') && (u.username === 'master' || u.username === 'operador')
    );

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const isSharedMasterCredential = normalizedUsername === 'master' && normalizedPassword === 'master';

    const matched = isSharedMasterCredential
      ? allowedUsers.find((u) => u.loginRole === this.selectedRole)
      : allowedUsers.find(
          (u) => u.username.toLowerCase() === normalizedUsername && u.password === normalizedPassword && u.loginRole === this.selectedRole
        );

    if (!matched) return false;

    this.store.updateState((state) => ({ ...state, currentUser: matched }));
    return true;
  }

  logout(): void {
    this.store.updateState((state) => ({ ...state, currentUser: null }));
    this.selectedRole = null;
    this.router.navigate(['/auth/selector-rol']);
  }

  get currentUser(): User | null {
    return this.store.snapshot.currentUser;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  hasRole(role: LoginRole): boolean {
    return this.currentUser?.loginRole === role;
  }
}
