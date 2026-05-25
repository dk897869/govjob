import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../services/job.service';

// Local Job type (job.service does not export Job)
interface Job {
  _id: string;
  [key: string]: any;
}
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalJobs = 0;
  pageSize = 12;
  
  filters = {
    search: '',
    location: '',
    type: '',
    experience: '',
    salary: ''
  };
  
  locations = ['All', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];
  jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  experienceLevels = ['All', '0-1 years', '1-3 years', '3-5 years', '5-7 years', '7+ years'];
  
  showFilters = false;
  savedJobs: Set<string> = new Set();

  constructor(
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadSavedJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filters
    };
    
    this.jobService.getAllJobs(params).subscribe({
      next: (response: { jobs: Job[]; total: number; pages: number; }) => {
        this.jobs = response.jobs;
        this.filteredJobs = response.jobs;
        this.totalJobs = response.total;
        this.totalPages = response.pages;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading jobs:', error);
        this.isLoading = false;
      }
    });
  }

  loadSavedJobs(): void {
    const savedJobs$ = this.jobService.getSavedJobs() as any;
    if (savedJobs$?.subscribe) {
      savedJobs$.subscribe({
        next: (jobs: any[]) => jobs.forEach((job: { _id: string; }) => this.savedJobs.add(job._id)),
        error: (error: any) => console.error('Error loading saved jobs:', error)
      });
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      location: '',
      type: '',
      experience: '',
      salary: ''
    };
    this.currentPage = 1;
    this.loadJobs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSaveJob(jobId: string): void {
    if (this.savedJobs.has(jobId)) {
      const result: any = this.jobService.unsaveJob(jobId);
      if (result && typeof result.subscribe === 'function') {
        result.subscribe({ next: () => this.savedJobs.delete(jobId) });
      } else if (result && typeof result.then === 'function') {
        result.then(() => this.savedJobs.delete(jobId)).catch((e: any) => console.error(e));
      } else {
        // If unsaveJob does not return a value, assume success and update locally
        this.savedJobs.delete(jobId);
      }
    } else {
      const result: any = this.jobService.saveJob(jobId);
      if (result && typeof result.subscribe === 'function') {
        result.subscribe({ next: () => this.savedJobs.add(jobId), error: (e: any) => console.error(e) });
      } else if (result && typeof result.then === 'function') {
        result.then(() => this.savedJobs.add(jobId)).catch((e: any) => console.error(e));
      } else {
        // If saveJob does not return a value, assume success and update locally
        this.savedJobs.add(jobId);
      }
    }
  }

  isJobSaved(jobId: string): boolean {
    return this.savedJobs.has(jobId);
  }

  getJobTypeColor(type: string): string {
    const colors: any = {
      'Full-time': 'bg-green-100 text-green-800',
      'Part-time': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-orange-100 text-orange-800',
      'Temporary': 'bg-yellow-100 text-yellow-800',
      'Internship': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }
}