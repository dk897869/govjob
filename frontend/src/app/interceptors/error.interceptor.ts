import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(30000), // 30 seconds timeout
      retry(1), // Retry once on failure
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
          console.error('Client Error:', error.error);
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              errorMessage = 'Network error. Please check your internet connection.';
              this.notificationService?.showError('Network connection failed');
              break;
            
            case 400:
              errorMessage = error.error?.message || 'Bad request. Please check your input.';
              this.notificationService?.showError(errorMessage);
              break;
            
            case 401:
              errorMessage = 'Session expired. Please login again.';
              this.notificationService?.showError(errorMessage);
              this.router.navigate(['/login']);
              break;
            
            case 403:
              errorMessage = 'You do not have permission to access this resource.';
              this.notificationService?.showError(errorMessage);
              break;
            
            case 404:
              errorMessage = 'Resource not found.';
              this.notificationService?.showError(errorMessage);
              break;
            
            case 409:
              errorMessage = error.error?.message || 'Conflict with existing data.';
              this.notificationService?.showError(errorMessage);
              break;
            
            case 422:
              errorMessage = error.error?.message || 'Validation failed.';
              this.notificationService?.showError(errorMessage);
              break;
            
            case 429:
              errorMessage = 'Too many requests. Please try again later.';
              this.notificationService?.showError(errorMessage);
              break;
            
            case 500:
            case 502:
            case 503:
              errorMessage = 'Server error. Please try again later.';
              this.notificationService?.showError('Server is temporarily unavailable');
              break;
            
            default:
              errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
              this.notificationService?.showError(errorMessage);
          }
          
          console.error('Server Error:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
        }
        
        // Log to error tracking service (if any)
        this.logErrorToService(error);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private logErrorToService(error: HttpErrorResponse): void {
    // You can integrate with error tracking services like Sentry, LogRocket, etc.
    console.error('Error logged:', {
      url: error.url,
      status: error.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}