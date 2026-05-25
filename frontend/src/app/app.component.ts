import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Role = 'STUDENT' | 'TEACHER' | 'HR' | 'ADMIN';
type Page = 'home' | 'jobs' | 'job-details' | 'login' | 'student' | 'teacher' | 'hr' | 'admin' | 'skill-test' | 'results' | 'admit-cards' | 'notifications' | 'resume' | 'chat' | 'connections';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  state: string;
}

interface Job {
  id: number;
  title: string;
  department: string;
  state: string;
  city: string;
  sector: string;
  salary: string;
  applicationFee: number;
  totalPositions: number;
  examStartDate: string;
  applicationDeadline: string;
  minSkillMarks: number;
  description: string;
  eligibility: string;
  status: string;
  sourceName?: string;
  sourceUrl?: string;
  applyUrl?: string;
  tags?: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:5000/api';

  page: Page = 'home';
  darkMode = false;
  mobileMenu = false;
  profileMenu = false;
  loading = false;
  message = '';
  source: any = null;

  user: User | null = null;
  token = localStorage.getItem('govjob_token');

  states = ['All India', 'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
  selectedState = 'All India';
  search = '';
  jobs: Job[] = [];
  selectedJob: Job | null = null;

  login = { identifier: 'student@govjob.in', password: 'Password@123', phone: '9876543210', otp: '', mode: 'password' };
  register = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'STUDENT' as Role, state: 'Delhi' };
  otpSent = false;

  applications: any[] = [];
  notifications: any[] = [];
  connections: any[] = [];
  messages: any[] = [];
  chatText = '';
  resume = { headline: 'UPSC aspirant | Public administration | Data handling', education: 'B.A. Political Science, Delhi University', skills: 'Reasoning, Quantitative Aptitude, MS Office, Governance', experience: 'Volunteer teacher for competitive exam foundation classes' };
  testAnswers: Record<number, string> = {};
  testResult: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.restoreSession();
    this.loadJobs();
  }

  get authHeaders(): HttpHeaders {
    return new HttpHeaders(this.token ? { Authorization: `Bearer ${this.token}` } : {});
  }

  get filteredJobs(): Job[] {
    return this.jobs.filter((job) => {
      const stateMatch = this.selectedState === 'All India' || job.state === this.selectedState;
      const text = `${job.title} ${job.department} ${job.sector} ${job.city}`.toLowerCase();
      return stateMatch && text.includes(this.search.toLowerCase());
    });
  }

  get recommendedJobs(): Job[] {
    const score = this.testResult?.percentage ?? 72;
    return this.jobs.filter((job) => score >= job.minSkillMarks).slice(0, 4);
  }

  get stats(): any[] {
    return [
      { label: 'Open vacancies', value: this.jobs.reduce((sum, job) => sum + job.totalPositions, 0) },
      { label: 'Applications', value: this.applications.length },
      { label: 'Skill score', value: `${this.testResult?.percentage ?? 76}%` },
      { label: 'Unread alerts', value: this.notifications.filter((n) => !n.isRead).length }
    ];
  }

  navigate(page: Page): void {
    this.page = page;
    this.mobileMenu = false;
    this.message = '';
    if (page === 'jobs') this.loadJobs();
    if (page === 'notifications') this.loadNotifications();
    if (page === 'connections') this.loadConnections();
    if (page === 'chat') this.loadMessages();
    if (['student', 'teacher', 'hr', 'admin'].includes(page)) this.loadApplications();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async api<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown): Promise<T> {
    const options = { headers: this.authHeaders, body };
    if (method === 'GET') return await this.http.get<T>(`${this.apiUrl}${path}`, { headers: this.authHeaders }).toPromise() as T;
    if (method === 'PUT') return await this.http.put<T>(`${this.apiUrl}${path}`, body, options).toPromise() as T;
    return await this.http.post<T>(`${this.apiUrl}${path}`, body, options).toPromise() as T;
  }

  async restoreSession(): Promise<void> {
    if (!this.token) return;
    try {
      const response: any = await this.api('GET', '/auth/me');
      this.user = response.user;
      this.loadNotifications();
    } catch {
      this.logout();
    }
  }

  async loadJobs(): Promise<void> {
    try {
      const response: any = await this.api('GET', `/jobs?state=${encodeURIComponent(this.selectedState === 'All India' ? '' : this.selectedState)}&search=${encodeURIComponent(this.search)}&limit=50`);
      this.jobs = response.jobs;
      this.source = response.source;
      this.selectedJob = this.selectedJob ?? this.jobs[0] ?? null;
    } catch {
      this.message = 'Backend is not reachable. Start the Node API on port 5000.';
    }
  }

  async syncSource(): Promise<void> {
    if (!this.user || !['HR', 'ADMIN'].includes(this.user.role)) {
      this.message = 'Login as HR or Admin to sync the Sarkari job source.';
      this.navigate('login');
      return;
    }
    this.loading = true;
    try {
      const response: any = await this.api('POST', '/source/sync', {});
      this.message = response.message;
      this.source = response.source;
      await this.loadJobs();
    } catch (error: any) {
      this.message = error?.error?.message ?? 'Source sync failed';
    } finally {
      this.loading = false;
    }
  }

  async passwordLogin(): Promise<void> {
    this.loading = true;
    try {
      const response: any = await this.api('POST', '/auth/login', { identifier: this.login.identifier, password: this.login.password });
      this.setSession(response);
      this.navigate(response.user.role === 'HR' ? 'hr' : response.user.role === 'ADMIN' ? 'admin' : 'student');
    } catch (error: any) {
      this.message = error?.error?.message ?? 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  async registerUser(): Promise<void> {
    this.loading = true;
    try {
      const response: any = await this.api('POST', '/auth/register', this.register);
      this.setSession(response);
      this.navigate(this.register.role === 'HR' ? 'hr' : this.register.role === 'TEACHER' ? 'teacher' : 'student');
    } catch (error: any) {
      this.message = error?.error?.message ?? 'Registration failed';
    } finally {
      this.loading = false;
    }
  }

  async sendOtp(): Promise<void> {
    await this.api('POST', '/auth/send-otp', { phone: this.login.phone });
    this.otpSent = true;
    this.message = 'Demo OTP sent. Use 123456.';
  }

  async verifyOtp(): Promise<void> {
    const response: any = await this.api('POST', '/auth/verify-otp', { phone: this.login.phone, otp: this.login.otp || '123456' });
    this.setSession(response);
    this.navigate('student');
  }

  async socialLogin(provider: string): Promise<void> {
    const response: any = await this.api('POST', '/auth/social-login', { provider });
    this.setSession(response);
    this.navigate('student');
  }

  setSession(response: any): void {
    this.token = response.token;
    this.user = response.user;
    localStorage.setItem('govjob_token', response.token);
  }

  logout(): void {
    this.user = null;
    this.token = null;
    localStorage.removeItem('govjob_token');
    this.navigate('home');
  }

  viewJob(job: Job): void {
    this.selectedJob = job;
    this.navigate('job-details');
  }

  async apply(job: Job): Promise<void> {
    if (!this.user) {
      this.navigate('login');
      return;
    }
    const response: any = await this.api('POST', '/applications', { jobId: job.id });
    this.message = response.message;
    this.loadApplications();
  }

  async loadApplications(): Promise<void> {
    if (!this.user) return;
    const response: any = await this.api('GET', '/applications/me');
    this.applications = response.applications;
  }

  async createJob(): Promise<void> {
    const body = { title: 'State Revenue Inspector', department: 'Revenue Department', sector: 'Administration', state: this.user?.state ?? 'Delhi', city: 'Capital Region', salary: 'Level 6, Rs. 35,400 - 1,12,400', totalPositions: 124, applicationFee: 250, minSkillMarks: 60, description: 'Recruitment for revenue field administration, records, and citizen service delivery.', eligibility: 'Graduate degree with state language proficiency.' };
    const response: any = await this.api('POST', '/jobs', body);
    this.message = response.message;
    this.loadJobs();
  }

  async submitTest(): Promise<void> {
    const answers = Object.entries(this.testAnswers).map(([questionId, selectedAnswer]) => ({ questionId: Number(questionId), selectedAnswer }));
    const response: any = await this.api('POST', '/skill-tests/1/submit', { answers });
    this.testResult = response.result;
    this.message = 'Skill test submitted. Recommendations updated from your marks.';
  }

  async loadNotifications(): Promise<void> {
    if (!this.user) return;
    const response: any = await this.api('GET', '/notifications');
    this.notifications = response.notifications;
  }

  async loadConnections(): Promise<void> {
    if (!this.user) return;
    const response: any = await this.api('GET', '/hr-connections');
    this.connections = response.connections;
  }

  async requestConnection(): Promise<void> {
    const response: any = await this.api('POST', '/hr-connections', { hrId: 3, requestMessage: 'I want guidance for upcoming government recruitment.' });
    this.message = response.message;
    this.loadConnections();
  }

  async loadMessages(): Promise<void> {
    if (!this.user) return;
    const response: any = await this.api('GET', '/chat/messages/3');
    this.messages = response.messages;
  }

  async sendMessage(): Promise<void> {
    if (!this.chatText.trim()) return;
    await this.api('POST', '/chat/messages', { receiverId: 3, message: this.chatText });
    this.chatText = '';
    this.loadMessages();
  }
}
