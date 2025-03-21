package com.example.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.Binary;

@Document(collection = "users")
public class User {
    @Id
    private String id; // Unique user ID
    private String username;
    private String password;
    private String email;
    private String role; // "USER" or "ADMIN"
    private Binary profilePicture;
    private String description;
    // Constructors
    public User() {}

    public User(String username, String password, String email, String role, Binary profilePicture, String description) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.profilePicture = profilePicture;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }  // Ensure ID is accessible
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Binary getProfilePicture() { return profilePicture; }
    public void setProfilePicture(Binary profilePicture) { this.profilePicture = profilePicture; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
