import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const dashboardEntryGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const nav = router.getCurrentNavigation();

  if (!nav || nav.trigger === 'popstate') {
    return state.url === '/dashboard/home' ? true : router.createUrlTree(['/dashboard/home']);
  }

  return true;
};
