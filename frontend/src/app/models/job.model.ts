// Job Type Enum
export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship',
  REMOTE = 'remote',
  FREELANCE = 'freelance'
}

// Job Status Enum
export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  DRAFT = 'draft',
  ON_HOLD = 'on-hold',
  FILLED = 'filled'
}

// Experience Level Enum
export enum ExperienceLevel {
  FRESHER = 'fresher',
  JUNIOR = 'junior',
  MID_LEVEL = 'mid-level',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  DIRECTOR = 'director'
}

// Department Enum
export enum Department {
  IT = 'Information Technology',
  FINANCE = 'Finance',
  ADMINISTRATION = 'Administration',
  ENGINEERING = 'Engineering',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  DEFENSE = 'Defense',
  RAILWAYS = 'Railways',
  BANKING = 'Banking',
  AGRICULTURE = 'Agriculture',
  LEGAL = 'Legal',
  HR = 'Human Resources',
  MARKETING = 'Marketing',
  SALES = 'Sales',
  OPERATIONS = 'Operations'
}

// Location Type
export interface Location {
  city: string;
  state: string;
  country: string;
  pincode?: string;
  address?: string;
  isRemote?: boolean;
}

// Salary Range
export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'hourly';
  isNegotiable?: boolean;
}

// Job Requirements
export interface JobRequirements {
  education: string[];
  experience: string;
  skills: string[];
  certifications?: string[];
  languages?: string[];
  ageLimit?: {
    min: number;
    max: number;
  };
  gender?: 'male' | 'female' | 'any';
  category?: 'general' | 'obc' | 'sc' | 'st' | 'ews';
  physicalRequirements?: string[];
}

// Job Benefits
export interface JobBenefits {
  salary: string[];
  perks: string[];
  insurance: string[];
  leaves: string[];
  other: string[];
}

// Interview Process
export interface InterviewProcess {
  rounds: number;
  stages: {
    name: string;
    description: string;
    duration?: number;
    type: 'written' | 'technical' | 'hr' | 'group' | 'presentation';
  }[];
  mode: 'online' | 'offline' | 'hybrid';
}

// Application Requirements
export interface ApplicationRequirements {
  documents: string[];
  fees?: {
    amount: number;
    category?: string;
  };
  ageRelaxation?: {
    categories: string[];
    years: number;
  };
  applicationFee?: number;
  lastDate: Date;
  applicationMode: 'online' | 'offline' | 'both';
}

// Job Statistics
export interface JobStatistics {
  views: number;
  applications: number;
  shortlisted: number;
  hired: number;
  saveCount: number;
  shareCount: number;
}

// Main Job Interface
export interface Job {
  // Basic Information
  _id: string;
  title: string;
  referenceNumber?: string;
  department: Department | string;
  category: string;
  
  // Employment Details
  type: JobType;
  experience: ExperienceLevel | string;
  experienceYears: {
    min: number;
    max: number;
  };
  positions: number;
  vacancies: number;
  
  // Location
  location: Location;
  
  // Compensation
  salary: SalaryRange;
  
  // Descriptions
  description: string;
  summary?: string;
  responsibilities: string[];
  requirements: JobRequirements;
  benefits: JobBenefits;
  
  // Process
  interviewProcess: InterviewProcess;
  applicationRequirements: ApplicationRequirements;
  
  // Dates
  postedDate: Date;
  lastDate: Date;
  interviewDate?: Date;
  resultDate?: Date;
  
  // Status
  status: JobStatus;
  isActive: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  
  // Organization
  company: string;
  departmentName: string;
  reportingTo?: string;
  
  // Contact
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  
  // Statistics
  statistics: JobStatistics;
  
  // Metadata
  tags: string[];
  skills: string[];
  qualifications: string[];
  
  // User Related
  postedBy: {
    id: string;
    name: string;
    email: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Additional
  attachments?: string[];
  importantNotes?: string[];
  termsAndConditions?: string;
}

// Job Filter Parameters
export interface JobFilters {
  search?: string;
  department?: string;
  location?: string;
  type?: JobType | string;
  experience?: ExperienceLevel | string;
  salary?: {
    min?: number;
    max?: number;
  };
  status?: JobStatus;
  isFeatured?: boolean;
  isUrgent?: boolean;
  postedAfter?: Date;
  postedBefore?: Date;
  lastDateAfter?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Job Response with Pagination
export interface JobResponse {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Create Job DTO
export interface CreateJobDTO {
  title: string;
  department: string;
  category: string;
  type: JobType;
  experience: string;
  experienceYears: {
    min: number;
    max: number;
  };
  positions: number;
  location: Location;
  salary: SalaryRange;
  description: string;
  responsibilities: string[];
  requirements: JobRequirements;
  benefits: JobBenefits;
  lastDate: Date;
  contactEmail: string;
  contactPhone?: string;
  tags?: string[];
  skills?: string[];
}

// Update Job DTO
export interface UpdateJobDTO extends Partial<CreateJobDTO> {
  status?: JobStatus;
  isActive?: boolean;
  isFeatured?: boolean;
}

// Job Application Interface
export interface JobApplication {
  _id: string;
  jobId: string | Job;
  userId: string;
  applicationNumber: string;
  status: ApplicationStatus;
  appliedDate: Date;
  documents: ApplicationDocument[];
  answers: ApplicationAnswer[];
  score?: number;
  remarks?: string;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under-review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview-scheduled',
  INTERVIEW_COMPLETED = 'interview-completed',
  SELECTED = 'selected',
  WAITING_LIST = 'waiting-list',
  OFFER_LETTER_ISSUED = 'offer-letter-issued',
  JOINED = 'joined'
}

export interface ApplicationDocument {
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  verified?: boolean;
}

export interface ApplicationAnswer {
  questionId: string;
  question: string;
  answer: string;
}

// Saved Job Interface
export interface SavedJob {
  _id: string;
  jobId: string | Job;
  userId: string;
  savedAt: Date;
  notes?: string;
}

// Job Alert Interface
export interface JobAlert {
  _id: string;
  userId: string;
  name: string;
  filters: JobFilters;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastSent?: Date;
  createdAt: Date;
}

// Job Category Interface
export interface JobCategory {
  _id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  jobCount: number;
  isActive: boolean;
}

// Helper Functions
export class JobModel {
  // Check if job is expired
  static isExpired(job: Job): boolean {
    return new Date(job.lastDate) < new Date();
  }

  // Check if job is recently posted (within 7 days)
  static isRecentlyPosted(job: Job): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(job.postedDate) > sevenDaysAgo;
  }

  // Get job urgency level
  static getUrgencyLevel(job: Job): 'normal' | 'urgent' | 'critical' {
    const daysLeft = this.getDaysLeft(job);
    if (daysLeft <= 3) return 'critical';
    if (daysLeft <= 7) return 'urgent';
    return 'normal';
  }

  // Get days left to apply
  static getDaysLeft(job: Job): number {
    const today = new Date();
    const lastDate = new Date(job.lastDate);
    const diffTime = lastDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Format salary range
  static formatSalary(salary: SalaryRange): string {
    const currency = salary.currency === 'INR' ? '₹' : salary.currency;
    const period = salary.period === 'monthly' ? '/month' : salary.period === 'yearly' ? '/year' : '/hour';
    
    if (salary.isNegotiable) {
      return `${currency} Negotiable ${period}`;
    }
    
    if (salary.max === salary.min) {
      return `${currency} ${salary.min.toLocaleString()} ${period}`;
    }
    
    return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${period}`;
  }

  // Get job type display name
  static getJobTypeDisplay(type: JobType): string {
    const display: Record<JobType, string> = {
      [JobType.FULL_TIME]: 'Full Time',
      [JobType.PART_TIME]: 'Part Time',
      [JobType.CONTRACT]: 'Contract',
      [JobType.TEMPORARY]: 'Temporary',
      [JobType.INTERNSHIP]: 'Internship',
      [JobType.REMOTE]: 'Remote',
      [JobType.FREELANCE]: 'Freelance'
    };
    return display[type] || type;
  }

  // Get experience level display
  static getExperienceDisplay(level: ExperienceLevel): string {
    const display: Record<ExperienceLevel, string> = {
      [ExperienceLevel.FRESHER]: 'Fresher',
      [ExperienceLevel.JUNIOR]: 'Junior (1-3 years)',
      [ExperienceLevel.MID_LEVEL]: 'Mid Level (3-5 years)',
      [ExperienceLevel.SENIOR]: 'Senior (5-8 years)',
      [ExperienceLevel.LEAD]: 'Lead (8-10 years)',
      [ExperienceLevel.MANAGER]: 'Manager (10+ years)',
      [ExperienceLevel.DIRECTOR]: 'Director (15+ years)'
    };
    return display[level] || level;
  }

  // Get status badge color
  static getStatusColor(status: JobStatus): string {
    const colors: Record<JobStatus, string> = {
      [JobStatus.OPEN]: 'bg-green-100 text-green-800',
      [JobStatus.CLOSED]: 'bg-red-100 text-red-800',
      [JobStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [JobStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
      [JobStatus.FILLED]: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get location display
  static getLocationDisplay(location: Location): string {
    if (location.isRemote) return 'Remote';
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`;
    }
    return location.city || location.state || location.country;
  }

  // Validate job dates
  static validateDates(job: Partial<Job>): boolean {
    if (job.postedDate && job.lastDate) {
      return new Date(job.lastDate) > new Date(job.postedDate);
    }
    return true;
  }

  // Get application progress percentage
  static getApplicationProgress(status: ApplicationStatus): number {
    const progress: Record<ApplicationStatus, number> = {
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.SUBMITTED]: 10,
      [ApplicationStatus.UNDER_REVIEW]: 30,
      [ApplicationStatus.SHORTLISTED]: 50,
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 60,
      [ApplicationStatus.INTERVIEW_COMPLETED]: 70,
      [ApplicationStatus.SELECTED]: 90,
      [ApplicationStatus.OFFER_LETTER_ISSUED]: 95,
      [ApplicationStatus.JOINED]: 100,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.WAITING_LIST]: 40
    };
    return progress[status] || 0;
  }
}

// Job Constants
export const JOB_CONSTANTS = {
  // Application fee categories
  FEE_CATEGORIES: {
    GENERAL: 'General',
    OBC: 'OBC',
    SC: 'SC',
    ST: 'ST',
    EWS: 'EWS',
    PWD: 'PwD',
    WOMEN: 'Women'
  },
  
  // Age relaxation categories
  AGE_RELAXATION: {
    SC_ST: 5,
    OBC: 3,
    PWD: 10,
    EX_SERVICEMAN: 5
  },
  
  // Document types
  DOCUMENT_TYPES: {
    PHOTO: 'photograph',
    SIGNATURE: 'signature',
    ID_PROOF: 'id-proof',
    DEGREE: 'degree-certificate',
    EXPERIENCE: 'experience-certificate',
    CASTE: 'caste-certificate',
    PWD: 'pwd-certificate'
  },
  
  // Maximum file sizes (in MB)
  MAX_FILE_SIZE: {
    PHOTO: 1,
    SIGNATURE: 0.5,
    DOCUMENT: 5
  },
  
  // Allowed file types
  ALLOWED_FILE_TYPES: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
};

// Export all
export default {
  JobType,
  JobStatus,
  ExperienceLevel,
  Department,
  JobModel,
  JOB_CONSTANTS
};