package com.smartstudy.platform.dto.request;

public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
    private int targetStudyHoursPerWeek;
    private String geminiApiKey;
    private String openaiApiKey;
    private String newPassword;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public int getTargetStudyHoursPerWeek() { return targetStudyHoursPerWeek; }
    public void setTargetStudyHoursPerWeek(int targetStudyHoursPerWeek) { this.targetStudyHoursPerWeek = targetStudyHoursPerWeek; }

    public String getGeminiApiKey() { return geminiApiKey; }
    public void setGeminiApiKey(String geminiApiKey) { this.geminiApiKey = geminiApiKey; }

    public String getOpenaiApiKey() { return openaiApiKey; }
    public void setOpenaiApiKey(String openaiApiKey) { this.openaiApiKey = openaiApiKey; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
