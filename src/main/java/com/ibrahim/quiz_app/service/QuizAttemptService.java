package com.ibrahim.quiz_app.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ibrahim.quiz_app.dto.AnswerRequest;
import com.ibrahim.quiz_app.dto.QuizAttemptRequest;
import com.ibrahim.quiz_app.entity.AttemptAnswer;
import com.ibrahim.quiz_app.entity.Option;
import com.ibrahim.quiz_app.entity.Question;
import com.ibrahim.quiz_app.entity.Quiz;
import com.ibrahim.quiz_app.entity.QuizAttempt;
import com.ibrahim.quiz_app.exception.InvalidAnswerException;
import com.ibrahim.quiz_app.exception.OptionNotFoundException;
import com.ibrahim.quiz_app.exception.QuestionNotFoundException;
import com.ibrahim.quiz_app.exception.QuizNotFoundException;
import com.ibrahim.quiz_app.repository.AttemptAnswerRepository;
import com.ibrahim.quiz_app.repository.OptionRepository;
import com.ibrahim.quiz_app.repository.QuestionRepository;
import com.ibrahim.quiz_app.repository.QuizAttemptRepository;
import com.ibrahim.quiz_app.repository.QuizRepository;

@Service
public class QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;

    public QuizAttemptService(
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

    @Transactional
    public QuizAttempt submitQuiz(QuizAttemptRequest request) {

        // 1. Find the quiz
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() ->
                        new QuizNotFoundException(
                                "Quiz not found with id: " + request.getQuizId()
                        )
                );

        // 2. Get all questions belonging to the quiz
        List<Question> questions =
                questionRepository.findByQuizId(quiz.getId());

        // 3. Validate and calculate score
        int score = 0;

        Set<Long> answeredQuestionIds = new HashSet<>();

        for (AnswerRequest answer : request.getAnswers()) {

            // Check for duplicate answers
            if (!answeredQuestionIds.add(answer.getQuestionId())) {
                throw new InvalidAnswerException(
                        "Question " + answer.getQuestionId()
                                + " has been answered more than once"
                );
            }

            // Find the question
            Question question = questionRepository
                    .findById(answer.getQuestionId())
                    .orElseThrow(() ->
                            new QuestionNotFoundException(
                                    "Question not found with id: "
                                            + answer.getQuestionId()
                            )
                    );

            // Check that the question belongs to this quiz
            if (!question.getQuiz().getId().equals(quiz.getId())) {
                throw new InvalidAnswerException(
                        "Question " + answer.getQuestionId()
                                + " does not belong to quiz "
                                + quiz.getId()
                );
            }

            // Find the selected option
            // and make sure it belongs to this question
            Option selectedOption = optionRepository
                    .findByIdAndQuestionId(
                            answer.getOptionId(),
                            answer.getQuestionId()
                    )
                    .orElseThrow(() ->
                            new OptionNotFoundException(
                                    "Option " + answer.getOptionId()
                                            + " does not belong to question "
                                            + answer.getQuestionId()
                            )
                    );

            // Check whether the selected option is correct
            boolean correct = selectedOption.isCorrect();

            if (correct) {
                score++;
            }
        }

        // 4. Make sure every question was answered
        if (answeredQuestionIds.size() != questions.size()) {
            throw new InvalidAnswerException(
                    "All questions must be answered"
            );
        }

        // 5. Calculate percentage
        int totalQuestions = questions.size();

        double percentage = totalQuestions > 0
                ? ((double) score / totalQuestions) * 100
                : 0;

        // 6. Create QuizAttempt
        QuizAttempt attempt = new QuizAttempt(
                quiz,
                score,
                totalQuestions,
                percentage
        );

        // 7. Save attempt
        QuizAttempt savedAttempt =
                quizAttemptRepository.save(attempt);

        // 8. Save individual answers
        for (AnswerRequest answer : request.getAnswers()) {

            Question question = questionRepository
                    .findById(answer.getQuestionId())
                    .orElseThrow(() ->
                            new QuestionNotFoundException(
                                    "Question not found with id: "
                                            + answer.getQuestionId()
                            )
                    );

            // Check that the question belongs to this quiz
            if (!question.getQuiz().getId().equals(quiz.getId())) {
                throw new InvalidAnswerException(
                        "Question " + answer.getQuestionId()
                                + " does not belong to quiz "
                                + quiz.getId()
                );
            }

            // Find the selected option
            Option selectedOption = optionRepository
                    .findByIdAndQuestionId(
                            answer.getOptionId(),
                            answer.getQuestionId()
                    )
                    .orElseThrow(() ->
                            new OptionNotFoundException(
                                    "Option " + answer.getOptionId()
                                            + " does not belong to question "
                                            + answer.getQuestionId()
                            )
                    );

            boolean correct = selectedOption.isCorrect();

            AttemptAnswer attemptAnswer = new AttemptAnswer(
                    savedAttempt,
                    question,
                    selectedOption,
                    correct
            );

            attemptAnswerRepository.save(attemptAnswer);
        }

        return savedAttempt;
    }

    // Get all attempts for a quiz
    public List<QuizAttempt> getAttemptsByQuizId(Long quizId) {

        if (!quizRepository.existsById(quizId)) {
            throw new QuizNotFoundException(
                    "Quiz not found with id: " + quizId
            );
        }

        return quizAttemptRepository.findByQuizId(quizId);
    }

    // Get a single attempt
    public QuizAttempt getAttemptById(Long id) {

        return quizAttemptRepository.findById(id)
                .orElseThrow(() ->
                        new InvalidAnswerException(
                                "Attempt not found with id: " + id
                        )
                );
    }
}