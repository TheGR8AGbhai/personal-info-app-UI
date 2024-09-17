import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, NgModel, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, FormsModule, HttpClientModule],
  templateUrl: './personal-info-form.component.html',
  styleUrls: ['./personal-info-form.component.css']
})
export class PersonalInfoFormComponent implements OnInit {
  personalInfoForm: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.personalInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      idType: ['', Validators.required],
      idNumber: ['', [Validators.required, this.validateIdNumber.bind(this)]],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      dateOfBirth: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  validateIdNumber(control: AbstractControl): ValidationErrors | null {
    const idType = this.personalInfoForm?.get('idType')?.value;
    const idNumber = control.value;
    
    if (!idNumber) {
      return { required: true };
    }
    
    if (idType === 'Aadhaar' && !/^[0-9]{12}$/.test(idNumber)) {
      return { invalidAadhaar: true };
    } else if (idType === 'PAN' && !/^[A-Z0-9]{10}$/.test(idNumber)) {
      return { invalidPAN: true };
    } else if (idType === 'Driving Licence' && !/^[A-Z0-9-]{15}$/.test(idNumber)) {
      return { invalidDL: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.personalInfoForm.valid) {
      this.isSubmitted = true;
      this.http.post<{ id: string }>('http://localhost:7221/api/user', this.personalInfoForm.value)
        .subscribe({
          next: (response) => {
            console.log(response);
            alert(`Data submitted successfully! 
              Your Unique ID: ${response.id}`);
          },
          error: (error) => {
            console.error('There was an error!', error);
            alert('Error occurred while submitting data.');
          }
        });
    } else {
      this.personalInfoForm.markAllAsTouched();
      alert('Please fill out all required fields correctly.');
    }
  }

  onReset(): void {
    this.personalInfoForm.reset();
    this.personalInfoForm.markAsPristine();
    this.personalInfoForm.markAsUntouched();
    this.isSubmitted = false;
  }
}
