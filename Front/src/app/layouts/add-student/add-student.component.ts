import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Student } from 'src/app/models/student';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css']
})
export class AddStudentComponent implements OnInit {

  // Form
  studentForm: FormGroup = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      branch: new FormControl('', [
        Validators.required
      ])
    });;

  // State
  submitted: boolean = false;
  isLoading: boolean = false;

  // Reference to student model
  private newStudent: Student = new Student();

  constructor(private studentService: StudentService) {
  }

  ngOnInit(): void {
    this.resetComponentState();
  }


  // ==================== FORM GETTERS ====================

  get studentName() {
    return this.studentForm.get('name');
  }

  get studentEmail() {
    return this.studentForm.get('email');
  }

  get studentBranch() {
    return this.studentForm.get('branch');
  }

  // ==================== FORM ACTIONS ====================

  onSubmit(): void {
    // Prepare student data
    this.prepareStudentData();

    // Submit to API
    this.createStudent();
  }

  // ==================== DATA HANDLING ====================

  private prepareStudentData(): void {
    this.newStudent = new Student();
    this.newStudent = this.studentForm.getRawValue()
  }

  private createStudent(): void {
    this.isLoading = true;

    this.studentService.createStudent(this.newStudent).subscribe({
      next: () => {
        this.backToFirstState();
      },
      error: (error) => {
        this.handleError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // ==================== RESPONSE HANDLERS ====================

  private backToFirstState(): void {
    this.submitted = true;
    this.isLoading = false;
  }

  private handleError(error: any): void {
    console.error('Error creating student:', error);

    if (error.status === 400 || error.error?.message?.includes('already exist')) {
      this.studentEmail?.setErrors({'duplicated': true});
    } else {
      // Handle other errors
      alert('Failed to create student. Please try again.');
    }

    this.isLoading = false;
    this.submitted = false;
  }

  // ==================== HELPER METHODS ====================

  private resetComponentState(): void {
    this.submitted = false;
    this.isLoading = false;
    this.newStudent = new Student();
  }

  resetStudentForm(form: FormGroupDirective) {
    form.resetForm({
      name: '',
      email: '',
      branch: ''
    });
  }
}
