package com.smartstudy.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "subjects")
public class Subject {
    @Id
    private String id;
    private String userId;
    private String name;
    private String description;
    private String color;
    private String icon;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Subject() {}

    public Subject(String userId, String name, String description, String color, String icon) {
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.color = color != null ? color : "#6366f1";
        this.icon = icon != null ? icon : "Book";
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
