import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HRConnectionService {
  private apiUrl = 'http://localhost:5000/api/hr-connections';

  constructor(private http: HttpClient) {}

  sendConnectionRequest(hrId: number, message: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const payload = { hrId, requestMessage: message };
    return this.http.post<any>(`${this.apiUrl}/request`, payload, { headers });
  }

  getPendingRequests(): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<any>(`${this.apiUrl}/pending`, { headers });
  }

  respondToRequest(requestId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put<any>(`${this.apiUrl}/${requestId}/respond`, { status }, { headers });
  }
}
