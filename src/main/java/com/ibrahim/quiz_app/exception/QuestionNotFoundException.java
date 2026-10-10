package com.ibrahim.quiz_app.exception;

public class QuestionNotFoundException extends RuntimeException {

    public QuestionNotFoundException(String message) {
        super(message);
    }
}