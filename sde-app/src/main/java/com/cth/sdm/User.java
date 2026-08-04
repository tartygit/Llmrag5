package com.cth.sdm;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ADMIN, MAKER, CHECKER

    @Column(name = "is_locked", nullable = false)
    private String isLocked = "N"; // Y or N

    @Column(name = "pwd_reset_token")
    private String pwdResetToken;

    @Column(name = "pwd_expiry_date", nullable = false)
    private LocalDateTime pwdExpiryDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String password, String role, LocalDateTime pwdExpiryDate) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.pwdExpiryDate = pwdExpiryDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getIsLocked() { return isLocked; }
    public void setIsLocked(String isLocked) { this.isLocked = isLocked; }

    public String getPwdResetToken() { return pwdResetToken; }
    public void setPwdResetToken(String pwdResetToken) { this.pwdResetToken = pwdResetToken; }

    public LocalDateTime getPwdExpiryDate() { return pwdExpiryDate; }
    public void setPwdExpiryDate(LocalDateTime pwdExpiryDate) { this.pwdExpiryDate = pwdExpiryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
