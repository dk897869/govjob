import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./components/jobs/job-list/job-list.component').then(m => m.JobListComponent)
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./components/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent)
  },
  {
    path: 'apply/:jobId',
    loadComponent: () => import('./components/applications/application-form/application-form.component').then(m => m.ApplicationFormComponent)
  },
  {
    path: 'my-applications',
    loadComponent: () => import('./components/applications/application-list/application-list.component').then(m => m.ApplicationListComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];