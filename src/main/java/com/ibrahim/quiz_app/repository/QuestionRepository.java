package com.ibrahim.quiz_app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ibrahim.quiz_app.entity.Question;

public interface QuestionRepository extends JpaRepository<Question,
 Long> {

    List<Question> findByQuizId(Long quizId);
}