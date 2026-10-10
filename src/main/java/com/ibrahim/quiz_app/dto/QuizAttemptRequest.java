package com.ibrahim.quiz_app.dto;

import java.util.List;

public class QuizAttemptRequest {

    private Long quizId;

    private List<AnswerRequest> answers;

    public QuizAttemptRequest() {
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public List<AnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerRequest> answers) {
        this.answers = answers;
    }
}