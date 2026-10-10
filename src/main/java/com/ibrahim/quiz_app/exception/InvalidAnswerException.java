package com.ibrahim.quiz_app.exception;

public class InvalidAnswerException extends RuntimeException {

    public InvalidAnswerException(String message) {
        super(message);
    }
}