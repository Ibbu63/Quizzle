package com.ibrahim.quiz_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ibrahim.quiz_app.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz,
Long> {
}