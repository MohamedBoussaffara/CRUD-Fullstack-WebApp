import { Component, OnInit, ViewChild } from '@angular/core';
import { map, Subject, Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { StudentService } from 'src/app/services/student.service';
import { Student } from 'src/app/models/student';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  // Data properties
  students: Student[] = [];
  selectedStudent: Student = new Student();
  
  // UI State properties
  deleteMessage: boolean = false;
  closeResult: string = "";
  isDataTableInitialized: boolean = false;
  
  // DataTables
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  
  // Form
  studentUpdateForm: FormGroup = new FormGroup({
    id: new FormControl(null),
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

  // Modal reference
  private modalReference: any;

  constructor(
    private studentService: StudentService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.students = [];
    this.initializeDataTable();
    this.loadStudents();
  }

  // ==================== FORM GETTERS ====================

  get studentName() {
    return this.studentUpdateForm.get('name');
  }

  get studentEmail() {
    return this.studentUpdateForm.get('email');
  }

  get studentBranch() {
    return this.studentUpdateForm.get('branch');
  }

  get studentId() {
    return this.studentUpdateForm.get('id');
  }

  // ==================== DATA METHODS ====================

  private initializeDataTable(): void {
    this.dtOptions = {
      paging: true,
      pageLength: 5,
      searching: true,
      ordering: false,
      info: true,
      autoWidth: false,
      responsive: true,
      destroy: true,
      lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
      language: {
        emptyTable: 'No students found. Add a new student to get started.',
        zeroRecords: 'No matching students found'
      }
    };
  }

  loadStudents(): void {
    this.studentService.getStudentList()
    .subscribe({
      next: (data: Student[]) => {
        this.students = data || [];
        this.rerenderDataTable();
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.students = [];
        this.rerenderDataTable();
      }
    });
  }

  deleteStudent(id: number): void {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.deleteMessage = true;
        setTimeout(() => this.deleteMessage = false, 2000);
        this.loadStudents();
      },
      error: (error) => {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
    });
  }

  updateStudent(): void {

    const studentData = this.studentUpdateForm.value;
    
    this.studentService.updateStudent(studentData.id, studentData).subscribe({
        next: () => {
          this.closeModal();
          this.loadStudents();
        },
        error: (error) => {
          if (error.status === 400 || error.error?.message?.includes('already exist')) {
            this.studentEmail?.setErrors({'duplicated': true});
          }
        }
      });
  }

  // ==================== MODAL METHODS ====================

  openUpdateModal(content: any, student: Student): void {
    this.selectedStudent = { ...student };
    this.studentUpdateForm.patchValue({
      id: student.id,
      name: student.name,
      email: student.email,
      branch: student.branch
    });
    
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md'
    });

    this.modalReference.result.then(
      (result: string) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason: string) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  closeModal(): void {
    if (this.modalReference) {
      this.modalReference.close();
      this.studentUpdateForm.reset();
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  // ==================== DATA TABLE METHODS ====================

  rerenderDataTable(): void {
    // Destroy existing DataTable if it exists
    this.destroyDataTable();
    
    // Trigger the DataTable
    setTimeout(() => {
      this.dtTrigger.next(null);
    });
  }

  destroyDataTable(): void {
    try {
      const dt = $('table').DataTable();
      dt.destroy();
    } catch (error) {
      console.error(error)
    }
  }

}