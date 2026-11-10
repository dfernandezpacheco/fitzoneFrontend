import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const esBackendFitZone = req.url.startsWith(
    'http://localhost:8081/'
  );
  const esLogin = req.url.endsWith('/auth/login');
  const esRegistro = req.url.endsWith('/auth/registro');
  const consultaPlanes = req.url.endsWith('/planes');
  if (token && esBackendFitZone && !esLogin && !esRegistro && !consultaPlanes) {
    const peticionAutenticada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(peticionAutenticada);
  }
  return next(req);
};
