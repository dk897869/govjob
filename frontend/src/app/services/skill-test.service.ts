import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillTestService {
  private apiUrl = 'http://localhost:5000/api/skill-tests';

  constructor(private http: HttpClient) {}

  getTestQuestions(testId: number): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<any>(`${this.apiUrl}/${testId}/questions`, { headers });
  }

  submitTest(testId: number, answers: any[], duration: number, applicationId?: number): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const payload = { answers, duration, applicationId };
    return this.http.post<any>(`${this.apiUrl}/${testId}/submit`, payload, { headers });
  }

  getLeaderboard(testId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${testId}/leaderboard`);
  }
}
