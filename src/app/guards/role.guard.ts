import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const token = sessionStorage.getItem('token');

  const rol = Number(sessionStorage.getItem('rol'));

  // Comprobamos si hay sesión
  if (!token) {

    return router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          returnUrl: state.url
        }
      }
    );

  }

  // Roles permitidos para la ruta
  const rolesPermitidos = route.data['roles'] as number[];

  // Comprobamos los permisos
  if (rolesPermitidos.includes(rol)) {

    return true;

  }

  // Redirigimos a cada usuario a su zona
  switch (rol) {

    case 1:
      return router.createUrlTree(['/admin/dashboard']);

    case 2:
      return router.createUrlTree(['/recepcion/dashboard']);

    case 3:
      return router.createUrlTree(['/socio/dashboard']);

    default:
      return router.createUrlTree(['/login']);

  }

};
