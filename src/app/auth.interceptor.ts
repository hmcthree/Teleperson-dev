import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import {ObservablesService} from './observables.service'
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
export class AuthInterceptor implements HttpInterceptor {
    constructor(private observables: ObservablesService) { }
    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken = localStorage.getItem("id_token");

        // if (!req.headers.has('Authorization')) {


            if (idToken) {
                const cloned = req.clone({
                    headers: req.headers.set("Authorization",
                        "Bearer " + idToken)
                });
    
                return next.handle(cloned);
            }
        // }

        if (!req.headers.has('Content-Type')) {
            req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
        }

        // if (!req.headers.has('Accept')) {
            req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
        // }

        // req = req.clone({ headers: req.headers.set('Accept', 'application/json') });

        return next.handle(req).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // console.log('event--->>>', event);
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                let data = {};
                data = {
                    reason: error && error.error && error.error.reason ? error.error.reason : '',
                    status: error.status
                };
                this.observables.showToastMessage({type:1,message:'Something Wen Wrong..!'})
                return throwError(error);
            }));
        // else {
        //     return next.handle(req);
        // }
    }
}
