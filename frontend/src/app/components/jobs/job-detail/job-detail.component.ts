import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { AuthService } from '../../../services/auth.service';
import { Job } from './../../../models/job.model';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  isLoading = true;
  isSaved = false;
  similarJobs: Job[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJobDetails(Number(jobId));
    }
  }

  loadJobDetails(jobId: number): void {
    this.isLoading = true;
    this.jobService.getJobById(jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.checkIfSaved();
        this.loadSimilarJobs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading job:', error);
        this.isLoading = false;
      }
    });
  }

  checkIfSaved(): void {
    (this.jobService.getSavedJobs() as any)?.subscribe({
      next: (jobs: any[]) => {
        this.isSaved = jobs.some(j => j._id === this.job?._id);
      }
    });
  }

  loadSimilarJobs(): void {
    this.jobService.getAllJobs({ 
      category: this.job?.category,
      limit: 3 
    }).subscribe({
      next: (response: { jobs: Job[] }) => {
        this.similarJobs = response.jobs.filter(j => j._id !== this.job?._id);
      }
    });
  }

  toggleSave(): void {
    if (!this.job) return;
    
    if (this.isSaved) {
      this.jobService.unsaveJob(this.job._id);
      this.isSaved = false;
    } else {
      const res: any = this.jobService.saveJob(this.job._id);
      // support both Observable and void/Promise-returning implementations
      if (res && typeof res.subscribe === 'function') {
        res.subscribe({ next: () => (this.isSaved = true) });
      } else if (res && typeof res.then === 'function') {
        res.then(() => (this.isSaved = true));
      } else {
        // assume synchronous/void: optimistically mark as saved
        this.isSaved = true;
      }
    }
  }

  applyNow(): void {
    if (this.job) {
      this.router.navigate(['/apply', this.job._id]);
    }
  }

  shareJob(): void {
    if (navigator.share && this.job) {
      navigator.share({
        title: this.job.title,
        text: `Job opportunity at ${this.job.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }
}