import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats = {
    totalJobs: 0,
    totalApplications: 0,
    interviewScheduled: 0,
    offersReceived: 0,
    profileViews: 0
  };
  
  recentJobs: any[] = [];
  recentApplications: any[] = [];
  upcomingInterviews: any[] = [];
  isLoading = true;
  
  private applicationChart: any;
  private jobChart: any;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private applicationService: ApplicationService
  ) {
    this.currentUser = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load jobs
    this.jobService.getJobs({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentJobs = response.jobs;
        this.stats.totalJobs = response.total;
      },
      error: (error) => console.error('Error loading jobs:', error)
    });

    // Load applications
    this.applicationService.getUserApplications().subscribe({
      next: (applications) => {
        this.recentApplications = applications.slice(0, 5);
        this.stats.totalApplications = applications.length;
        this.stats.interviewScheduled = applications.filter((a: { status: string; }) => a.status === 'interview').length;
        this.stats.offersReceived = applications.filter((a: { status: string; }) => a.status === 'offered').length;
        this.upcomingInterviews = applications.filter((a: { interviewDate: any; }) => a.interviewDate).slice(0, 3);
        this.isLoading = false;
        this.initCharts(applications);
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.isLoading = false;
      }
    });
  }

  initCharts(applications: any[]): void {
    const statusCounts = {
      pending: applications.filter(a => a.status === 'pending').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offered: applications.filter(a => a.status === 'offered').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    const ctx = document.getElementById('applicationChart') as HTMLCanvasElement;
    if (ctx) {
      this.applicationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Reviewed', 'Interview', 'Offered', 'Rejected'],
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 12 }, usePointStyle: true }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.raw} applications`
              }
            }
          }
        }
      });
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getStatusClass(status: string): string {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      offered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }
}