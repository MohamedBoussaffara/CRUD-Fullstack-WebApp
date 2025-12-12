package com.student.repo;



import org.springframework.data.repository.CrudRepository;
import com.student.model.Student;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends CrudRepository<Student, Long> {

    List<Student> findAllByOrderByCreationDateDesc();

    boolean existsByEmail(String email);

}
