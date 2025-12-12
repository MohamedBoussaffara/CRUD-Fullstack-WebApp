package com.student.controller;

import java.util.List;

import com.student.model.Student;


import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.student.repo.StudentRepository;
import org.springframework.web.server.ResponseStatusException;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(value="/api")
public class CustomerController {

	@Autowired
	StudentRepository repository;

	@GetMapping("students-list")
	public ResponseEntity<List<Student>> allstudents() {
		List<Student> students = repository.findAllByOrderByCreationDateDesc();
		if (students.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		}
		return new ResponseEntity<>(students, HttpStatus.OK);
	}
	
	@GetMapping("student/{student_id}")
	public ResponseEntity<Student>  getStudentByID(@PathVariable("student_id") long id) {
		Student student = repository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"Student with id " + id + " not found"
				));
		return new ResponseEntity<>(student, HttpStatus.OK);
	}

	@PostMapping(value = "save-student")
	public ResponseEntity<Student> saveStudent(@RequestBody Student student) {
		if(this.repository.existsByEmail(student.getEmail())){
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Student with email " + student.getEmail() + " already exist"
			);
		}
		repository.save(student);
		return new ResponseEntity<>(student, HttpStatus.CREATED);
	}
    @PutMapping(value = "update-student/{student_id}")
    public ResponseEntity<Student> updateStudent(@RequestBody Student student, @PathVariable("student_id") Long student_id) {
		return repository.findById(student_id)
				.map(oldStudent -> {
					if(!student.getEmail().equals(oldStudent.getEmail()) && this.repository.existsByEmail(student.getEmail())){
						throw new ResponseStatusException(
								HttpStatus.BAD_REQUEST,
								"Student with email " + student.getEmail() + " already exist"
						);
					}
					oldStudent.setBranch(student.getBranch());
					oldStudent.setEmail(student.getEmail());
					oldStudent.setName(student.getName());
					Student updatedStudent = repository.save(oldStudent);
					return new ResponseEntity<>(updatedStudent, HttpStatus.CREATED);
				}).orElseGet(() -> {
					student.setId(student_id);
					repository.save(student);
					return new ResponseEntity<>(student, HttpStatus.CREATED);
					});
    }
	@DeleteMapping("delete-student/{student_id}")
	public ResponseEntity<HttpStatus> deleteStudent(@PathVariable("student_id") Long student_id) {
		repository.deleteById(student_id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}



}



