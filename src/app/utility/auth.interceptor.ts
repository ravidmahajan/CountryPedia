import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConstants } from '../constants/api-constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If request is directed to REST Countries API (direct or proxied) and doesn't already have Authorization header
    if ((req.url.includes('/countries/v5') || req.url.includes('restcountries.com')) && !req.headers.has('Authorization')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${ApiConstants.API_KEY}`
        }
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
