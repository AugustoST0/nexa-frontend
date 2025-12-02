import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('accessToken');
    const isAuthRequest = req.url.includes('/auth');

    console.log('🔐 Auth Interceptor:', {
        url: req.url,
        hasToken: !!token,
        isAuthRequest,
        method: req.method
    });

    if (token && !isAuthRequest) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('✅ Token adicionado à requisição');
    } else if (!token && !isAuthRequest) {
        console.log('⚠️ Sem token para requisição não-auth');
    }

    return next(req);
};