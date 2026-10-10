package com.ibrahim.quiz_app.service;

import com.ibrahim.quiz_app.entity.Option;
import com.ibrahim.quiz_app.entity.Question;
import com.ibrahim.quiz_app.entity.Quiz;
import com.ibrahim.quiz_app.exception.QuestionNotFoundException;
import com.ibrahim.quiz_app.exception.QuizNotFoundException;
import com.ibrahim.quiz_app.repository.AttemptAnswerRepository;
import com.ibrahim.quiz_app.repository.OptionRepository;
import com.ibrahim.quiz_app.repository.QuestionRepository;
import com.ibrahim.quiz_app.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final OptionRepository optionRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            QuizRepository quizRepository,
            OptionRepository optionRepository,
            AttemptAnswerRepository attemptAnswerRepository) {

        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.optionRepository = optionRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
    }

    public Question createQuestion(Long quizId, Question question) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found with id: " + quizId
                        )
                );

        question.setQuiz(quiz);

        return questionRepository.save(question);
    }

    public List<Question> getQuestionsByQuizId(Long quizId) {

        if (!quizRepository.existsById(quizId)) {
            throw new QuizNotFoundException(
                    "Quiz not found with id: " + quizId
            );
        }

        return questionRepository.findByQuizId(quizId);
    }

    public Question getQuestionById(Long id) {

        return questionRepository.findById(id)
                .orElseThrow(() ->
                        new QuestionNotFoundException(
                                "Question not found with id: " + id
                        )
                );
    }

    public Question updateQuestion(Long id, Question updatedQuestion) {

        Question existingQuestion = questionRepository.findById(id)
                .orElseThrow(() ->
                        new QuestionNotFoundException(
                                "Question not found with id: " + id
                        )
                );

        existingQuestion.setQuestionText(
                updatedQuestion.getQuestionText()
        );

        return questionRepository.save(existingQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {

        Question existingQuestion = questionRepository.findById(id)
                .orElseThrow(() ->
                        new QuestionNotFoundException(
                                "Question not found with id: " + id
                        )
                );

        // Delete associated answers and options first to preserve referential integrity
        attemptAnswerRepository.deleteByQuestionId(id);
        List<Option> options = optionRepository.findByQuestionId(id);
        optionRepository.deleteAll(options);

        questionRepository.delete(existingQuestion);
    }
}