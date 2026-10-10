package com.ibrahim.quiz_app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ibrahim.quiz_app.dto.QuizAttemptRequest;
import com.ibrahim.quiz_app.entity.QuizAttempt;
import com.ibrahim.quiz_app.service.QuizAttemptService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    public QuizAttemptController(QuizAttemptService quizAttemptService) {
        this.quizAttemptService = quizAttemptService;
    }

    // Submit a quiz
    @PostMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<QuizAttempt> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizAttemptRequest request) {

        request.setQuizId(quizId);

        QuizAttempt attempt =
                quizAttemptService.submitQuiz(request);

        return new ResponseEntity<>(
                attempt,
                HttpStatus.CREATED
        );
    }

    // Get all attempts for a quiz
    @GetMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByQuizId(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                quizAttemptService.getAttemptsByQuizId(quizId)
        );
    }

    // Get one specific attempt
    @GetMapping("/attempts/{id}")
    public ResponseEntity<QuizAttempt> getAttemptById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                quizAttemptService.getAttemptById(id)
        );
    }
}