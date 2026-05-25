import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  getAllJobs: any;
  getSavedJobs() {
    throw new Error('Method not implemented.');
  }
  unsaveJob(jobId: string) {
    throw new Error('Method not implemented.');
  }
  saveJob(jobId: string) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:5000/api/jobs';

  constructor(private http: HttpClient) {}

  getJobs(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filters.state) params = params.set('state', filters.state);
    if (filters.sector) params = params.set('sector', filters.sector);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getJobById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createJob(jobData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, jobData, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getStates(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/filters/states`);
  }

  getSectors(): Observable<any> {
    const sectors = [
      'SSC (Staff Selection Commission)',
      'UPSC (Union Public Service Commission)',
      'State PSC',
      'Railways',
      'Banking (IBPS/SBI)',
      'Insurance',
      'Defense',
      'Police',
      'Teaching',
      'Postal',
      'PWD (Public Works Department)',
      'Other'
    ];
    return new Observable(observer => {
      observer.next({ success: true, sectors });
      observer.complete();
    });
  }
}
