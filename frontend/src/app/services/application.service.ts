import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:5000/api/applications';

  constructor(private http: HttpClient) {}

  applyForJob(jobId: number, applicationFee: number): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post<any>(this.apiUrl, { jobId, applicationFeeAmount: applicationFee }, { headers });
  }

  getUserApplications(): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<any>(`${this.apiUrl}/user/applications`, { headers });
  }

  updateApplicationStatus(applicationId: number, status: string): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put<any>(`${this.apiUrl}/${applicationId}/status`, { status }, { headers });
  }
}
