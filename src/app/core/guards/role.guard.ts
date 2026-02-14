import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const expected = route.data['role'] as 'MASTER' | 'OPERADOR';
  return auth.hasRole(expected) ? true : router.createUrlTree(['/dashboard/home']);
};
