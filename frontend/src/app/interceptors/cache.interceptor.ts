import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpResponse 
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Check cache
    const cachedResponse = this.getFromCache(req.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Make request and cache response
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.addToCache(req.url, event);
        }
      })
    );
  }

  private getFromCache(url: string): HttpResponse<any> | null {
    const cached = this.cache.get(url);
    const timestamp = this.cacheTimestamps.get(url);
    
    if (cached && timestamp && (Date.now() - timestamp) < this.cacheTTL) {
      return cached;
    }
    
    // Remove expired cache
    this.cache.delete(url);
    this.cacheTimestamps.delete(url);
    return null;
  }

  private addToCache(url: string, response: HttpResponse<any>): void {
    this.cache.set(url, response);
    this.cacheTimestamps.set(url, Date.now());
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}