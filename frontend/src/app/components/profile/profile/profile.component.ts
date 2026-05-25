import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditing = false;
  isChangingPassword = false;
  isLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^[0-9]{10}$')],
      address: [''],
      city: [''],
      state: [''],
      pincode: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.reset(this.currentUser);
    }
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadAvatar(): void {
    if (this.selectedFile) {
      this.isLoading = true;
      (this.authService as any).uploadAvatar(this.selectedFile).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.notificationService.showSuccess('Profile picture updated successfully');
          this.selectedFile = null;
          this.previewUrl = null;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.notificationService.showError('Failed to upload profile picture');
        }
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    (this.authService as any).updateProfile(this.profileForm.value).subscribe({
      next: (user: any) => {
        this.isLoading = false;
        this.isEditing = false;
        this.notificationService.showSuccess('Profile updated successfully');
      },
      error: (error: any) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to update profile');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    (this.authService as any).changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.notificationService.showSuccess('Password changed successfully');
      },
      error: (error: any) => {
        this.isLoading = false;
        this.notificationService.showError('Failed to change password');
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}