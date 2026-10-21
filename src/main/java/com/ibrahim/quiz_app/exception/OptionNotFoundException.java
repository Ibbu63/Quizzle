package com.ibrahim.quiz_app.exception;

public class OptionNotFoundException extends RuntimeException {

    public OptionNotFoundException(String message) {
        super(message);
    }
}