package com.ibrahim.quiz_app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ibrahim.quiz_app.entity.QuizAttempt;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByQuizId(Long quizId);

}