package com.ibrahim.quiz_app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.ibrahim.quiz_app.entity.AttemptAnswer;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

    List<AttemptAnswer> findByAttemptId(Long attemptId);

    @Transactional
    @Modifying
    @Query("DELETE FROM AttemptAnswer a WHERE a.question.id = :questionId")
    void deleteByQuestionId(@Param("questionId") Long questionId);

    @Transactional
    @Modifying
    @Query("DELETE FROM AttemptAnswer a WHERE a.attempt.id = :attemptId")
    void deleteByAttemptId(@Param("attemptId") Long attemptId);

    @Transactional
    @Modifying
    @Query("DELETE FROM AttemptAnswer a WHERE a.selectedOption.id = :optionId")
    void deleteByOptionId(@Param("optionId") Long optionId);
}