import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddStudentComponent } from './layouts/add-student/add-student.component';
import { StudentListComponent } from './layouts/student-list/student-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'view-student', pathMatch: 'full' },
  { path: 'view-student', component: StudentListComponent },
  { path: 'add-student', component: AddStudentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }