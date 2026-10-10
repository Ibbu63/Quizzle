package com.ibrahim.quiz_app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ibrahim.quiz_app.entity.Question;
import com.ibrahim.quiz_app.service.QuestionService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<Question> createQuestion(
            @PathVariable Long quizId,
            @RequestBody Question question) {

        Question createdQuestion =
                questionService.createQuestion(quizId, question);

        return new ResponseEntity<>(
                createdQuestion,
                HttpStatus.CREATED
        );
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuestionsByQuizId(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                questionService.getQuestionsByQuizId(quizId)
        );
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<Question> getQuestionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                questionService.getQuestionById(id)
        );
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Long id,
            @RequestBody Question question) {

        return ResponseEntity.ok(
                questionService.updateQuestion(id, question)
        );
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id) {

        questionService.deleteQuestion(id);

        return ResponseEntity.noContent().build();
    }
}