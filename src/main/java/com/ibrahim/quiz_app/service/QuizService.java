package com.ibrahim.quiz_app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ibrahim.quiz_app.entity.Question;
import com.ibrahim.quiz_app.entity.Quiz;
import com.ibrahim.quiz_app.entity.QuizAttempt;
import com.ibrahim.quiz_app.exception.QuizNotFoundException;
import com.ibrahim.quiz_app.repository.AttemptAnswerRepository;
import com.ibrahim.quiz_app.repository.OptionRepository;
import com.ibrahim.quiz_app.repository.QuestionRepository;
import com.ibrahim.quiz_app.repository.QuizAttemptRepository;
import com.ibrahim.quiz_app.repository.QuizRepository;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;

    public QuizService(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            OptionRepository optionRepository,
            QuizAttemptRepository quizAttemptRepository,
            AttemptAnswerRepository attemptAnswerRepository) {

        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found with id: " + id
                        )
                );
    }

    public Quiz updateQuiz(Long id, Quiz updatedQuiz) {

        Quiz existingQuiz = quizRepository.findById(id)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found with id: " + id
                        )
                );

        existingQuiz.setTitle(updatedQuiz.getTitle());
        existingQuiz.setDescription(updatedQuiz.getDescription());

        return quizRepository.save(existingQuiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {

        Quiz existingQuiz = quizRepository.findById(id)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found with id: " + id
                        )
                );

        // Delete questions and their options & answers
        List<Question> questions = questionRepository.findByQuizId(id);
        for (Question q : questions) {
            attemptAnswerRepository.deleteByQuestionId(q.getId());
            optionRepository.deleteAll(optionRepository.findByQuestionId(q.getId()));
            questionRepository.delete(q);
        }

        // Delete attempts and their answers
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(id);
        for (QuizAttempt a : attempts) {
            attemptAnswerRepository.deleteByAttemptId(a.getId());
            quizAttemptRepository.delete(a);
        }

        quizRepository.delete(existingQuiz);
    }
}