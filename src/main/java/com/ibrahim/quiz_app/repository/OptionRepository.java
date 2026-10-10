package com.ibrahim.quiz_app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ibrahim.quiz_app.entity.Option;

public interface OptionRepository extends JpaRepository<Option, Long> {

    List<Option> findByQuestionId(Long questionId);

    Optional<Option> findByIdAndQuestionId(Long id, Long questionId);
}