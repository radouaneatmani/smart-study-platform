package com.smartstudy.platform.model;

import java.util.UUID;

public class StudySession {
    private String id = UUID.randomUUID().toString();
    private String day; // Lundi, Mardi, etc.
    private String date; // YYYY-MM-DD
    private String topic;
    private int durationMinutes;
    private boolean completed = false;
    private String tips;

    public StudySession() {}

    public StudySession(String day, String date, String topic, int durationMinutes, String tips) {
        this.id = UUID.randomUUID().toString();
        this.day = day;
        this.date = date;
        this.topic = topic;
        this.durationMinutes = durationMinutes;
        this.tips = tips;
        this.completed = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getTips() { return tips; }
    public void setTips(String tips) { this.tips = tips; }
}
