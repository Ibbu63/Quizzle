package com.ibrahim.quiz_app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ibrahim.quiz_app.dto.OptionResponse;
import com.ibrahim.quiz_app.entity.Option;
import com.ibrahim.quiz_app.service.OptionService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class OptionController {

    private final OptionService optionService;

    public OptionController(OptionService optionService) {
        this.optionService = optionService;
    }

    // Create option
    @PostMapping("/questions/{questionId}/options")
    public ResponseEntity<Option> createOption(
            @PathVariable Long questionId,
            @RequestBody Option option) {

        Option createdOption =
                optionService.createOption(questionId, option);

        return new ResponseEntity<>(
                createdOption,
                HttpStatus.CREATED
        );
    }

    // Get options for a question
    // Does NOT expose the correct answer
    @GetMapping("/questions/{questionId}/options")
    public ResponseEntity<List<OptionResponse>> getOptionsByQuestionId(
            @PathVariable Long questionId) {

        List<OptionResponse> options =
                optionService.getOptionsByQuestionId(questionId)
                        .stream()
                        .map(option -> new OptionResponse(
                                option.getId(),
                                option.getOptionText()
                        ))
                        .toList();

        return ResponseEntity.ok(options);
    }

    // Get one option
    // Does NOT expose the correct answer
    @GetMapping("/options/{id}")
    public ResponseEntity<OptionResponse> getOptionById(
            @PathVariable Long id) {

        Option option = optionService.getOptionById(id);

        OptionResponse response = new OptionResponse(
                option.getId(),
                option.getOptionText()
        );

        return ResponseEntity.ok(response);
    }

    // Update option
    // Admin functionality, so correct can still be changed
    @PutMapping("/options/{id}")
    public ResponseEntity<Option> updateOption(
            @PathVariable Long id,
            @RequestBody Option option) {

        return ResponseEntity.ok(
                optionService.updateOption(id, option)
        );
    }

    // Delete option
    @DeleteMapping("/options/{id}")
    public ResponseEntity<Void> deleteOption(
            @PathVariable Long id) {

        optionService.deleteOption(id);

        return ResponseEntity.noContent().build();
    }
}