import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const esBackendFitZone = req.url.startsWith(
    'http://localhost:8081/'
  );
  const esLogin = req.url.endsWith('/auth/login');
  if (token && esBackendFitZone && !esLogin) {
    const peticionAutenticada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(peticionAutenticada);
  }
  return next(req);
};
