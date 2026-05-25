import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.css']
})
export class ApplicationFormComponent implements OnInit {
  applicationForm: FormGroup;
  job: any;
  isLoading = false;
  isSubmitting = false;
  resumeFile: File | null = null;
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private jobService: JobService
  ) {
    this.applicationForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      }),
      professionalInfo: this.fb.group({
        experience: ['', Validators.required],
        currentCompany: [''],
        currentSalary: [''],
        expectedSalary: ['', Validators.required],
        noticePeriod: ['', Validators.required],
        skills: this.fb.array([]),
        education: ['', Validators.required]
      }),
      additionalInfo: this.fb.group({
        coverLetter: ['', Validators.required],
        portfolio: [''],
        linkedin: [''],
        github: [''],
        additionalInfo: ['']
      })
    });

    this.addSkill();
  }

  ngOnInit(): void {
    const jobIdParam = this.route.snapshot.paramMap.get('jobId');
    if (jobIdParam) {
      const jobId = parseInt(jobIdParam, 10);
      if (!isNaN(jobId)) {
        this.loadJob(jobId);
      }
    }
  }

  loadJob(jobId: number): void {
    this.jobService.getJobById(jobId).subscribe({
      next: (job) => this.job = job,
      error: (error) => console.error('Error loading job:', error)
    });
  }

  get skills(): FormArray {
    return this.applicationForm.get('professionalInfo.skills') as FormArray;
  }

  addSkill(): void {
    this.skills.push(this.fb.control('', Validators.required));
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  onFileSelected(event: any): void {
    this.resumeFile = event.target.files[0];
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      Object.keys(this.applicationForm.controls).forEach(key => {
        const control = this.applicationForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.markAsTouched();
          });
        } else {
          control?.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('jobId', this.job._id);
    formData.append('applicationData', JSON.stringify(this.applicationForm.value));
    if (this.resumeFile) {
      formData.append('resume', this.resumeFile);
    }

    // cast formData to any to match service signature and avoid TS type error
    this.applicationService.applyForJob(this.job._id, formData as any).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/my-applications'], { 
          queryParams: { success: true }
        });
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        this.isSubmitting = false;
      }
    });
  }
}