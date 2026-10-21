package com.ibrahim.quiz_app.service;

import com.ibrahim.quiz_app.entity.Option;
import com.ibrahim.quiz_app.entity.Question;
import com.ibrahim.quiz_app.exception.OptionNotFoundException;
import com.ibrahim.quiz_app.exception.QuestionNotFoundException;
import com.ibrahim.quiz_app.repository.AttemptAnswerRepository;
import com.ibrahim.quiz_app.repository.OptionRepository;
import com.ibrahim.quiz_app.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OptionService {

    private final OptionRepository optionRepository;
    private final QuestionRepository questionRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;

    public OptionService(
            OptionRepository optionRepository,
            QuestionRepository questionRepository,
            AttemptAnswerRepository attemptAnswerRepository) {

        this.optionRepository = optionRepository;
        this.questionRepository = questionRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
    }

    public Option createOption(Long questionId, Option option) {

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new QuestionNotFoundException(
                                "Question not found with id: " + questionId
                        )
                );

        option.setQuestion(question);

        return optionRepository.save(option);
    }

    public List<Option> getOptionsByQuestionId(Long questionId) {

        if (!questionRepository.existsById(questionId)) {
            throw new QuestionNotFoundException(
                    "Question not found with id: " + questionId
            );
        }

        return optionRepository.findByQuestionId(questionId);
    }

    public Option getOptionById(Long id) {

        return optionRepository.findById(id)
                .orElseThrow(() ->
                        new OptionNotFoundException(
                                "Option not found with id: " + id
                        )
                );
    }

    public Option updateOption(Long id, Option updatedOption) {

        Option existingOption = optionRepository.findById(id)
                .orElseThrow(() ->
                        new OptionNotFoundException(
                                "Option not found with id: " + id
                        )
                );

        existingOption.setOptionText(updatedOption.getOptionText());
        existingOption.setCorrect(updatedOption.isCorrect());

        return optionRepository.save(existingOption);
    }

    @Transactional
    public void deleteOption(Long id) {

        Option existingOption = optionRepository.findById(id)
                .orElseThrow(() ->
                        new OptionNotFoundException(
                                "Option not found with id: " + id
                        )
                );

        attemptAnswerRepository.deleteByOptionId(id);
        optionRepository.delete(existingOption);
    }
}