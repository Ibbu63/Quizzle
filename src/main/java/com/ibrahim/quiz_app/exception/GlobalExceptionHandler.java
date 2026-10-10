package com.ibrahim.quiz_app.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidAnswerException.class)
public ResponseEntity<Map<String, Object>> handleInvalidAnswer(
        InvalidAnswerException exception) {

    Map<String, Object> response = new HashMap<>();

    response.put("timestamp", LocalDateTime.now());
    response.put("status", 400);
    response.put("error", "Bad Request");
    response.put("message", exception.getMessage());

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
}

    @ExceptionHandler(QuizNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleQuizNotFound(
            QuizNotFoundException exception) {

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", 404);
        response.put("error", "Not Found");
        response.put("message", exception.getMessage());

        return new ResponseEntity<>(
                response,
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(QuestionNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleQuestionNotFound(
        QuestionNotFoundException exception) {

    Map<String, Object> response = new HashMap<>();

    response.put("timestamp", LocalDateTime.now());
    response.put("status", 404);
    response.put("error", "Not Found");
    response.put("message", exception.getMessage());

    return new ResponseEntity<>(
            response,
            HttpStatus.NOT_FOUND
    );
}

@ExceptionHandler(OptionNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleOptionNotFound(
        OptionNotFoundException exception) {

    Map<String, Object> response = new HashMap<>();

    response.put("timestamp", LocalDateTime.now());
    response.put("status", 404);
    response.put("error", "Not Found");
    response.put("message", exception.getMessage());

    return new ResponseEntity<>(
            response,
            HttpStatus.NOT_FOUND
    );
}
}