package com.ibrahim.quiz_app.dto;

public class OptionResponse {

    private Long id;
    private String optionText;

    public OptionResponse() {
    }

    public OptionResponse(Long id, String optionText) {
        this.id = id;
        this.optionText = optionText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }
}