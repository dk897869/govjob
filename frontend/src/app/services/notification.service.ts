import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      },
      error: (error) => console.error('Error loading notifications:', error)
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .pipe(catchError(this.handleError));
  }

  markAsRead(notificationId: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          );
          this.notificationsSubject.next(updated);
          this.updateUnreadCount(updated);
        }),
        catchError(this.handleError)
      );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(notif => ({ ...notif, read: true }));
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(0);
        }),
        catchError(this.handleError)
      );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`)
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.filter(notif => notif._id !== notificationId);
          this.notificationsSubject.next(updated);
          this.updateUnreadCount(updated);
        }),
        catchError(this.handleError)
      );
  }

  showSuccess(message: string, title?: string): void {
    this.showNotification(message, 'success', title);
  }

  showError(message: string, title?: string): void {
    this.showNotification(message, 'error', title);
  }

  showWarning(message: string, title?: string): void {
    this.showNotification(message, 'warning', title);
  }

  showInfo(message: string, title?: string): void {
    this.showNotification(message, 'info', title);
  }

  private showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error', title?: string): void {
    // You can integrate with toast libraries like ngx-toastr, sweetalert2, etc.
    console.log(`[${type.toUpperCase()}] ${title || type}: ${message}`);
    
    // Simple alert for demo (replace with proper toast)
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      alert(`Success: ${message}`);
    }
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred in notification service';
    if (error.error?.message) {
      errorMessage = error.error.message;
    }
    console.error('Notification Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}