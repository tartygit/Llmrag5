package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        try {
            // Check LDAP toggle
            String authMethod = userService.getConfig("AUTH_METHOD", "DATABASE");
            if ("LDAP".equalsIgnoreCase(authMethod)) {
                // Mock LDAP: If admin/maker/checker and credentials are correct
                if (("admin".equals(username) || "maker".equals(username) || "checker".equals(username)) && "admin123".equals(password)) {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("status", "SUCCESS");
                    resp.put("username", username);
                    resp.put("role", "admin".equals(username) ? "ADMIN" : "maker".equals(username) ? "MAKER" : "CHECKER");
                    resp.put("authMethod", "LDAP");
                    return ResponseEntity.ok(resp);
                }
                return ResponseEntity.status(401).body(Map.of("message", "Invalid LDAP credentials"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            if ("Y".equals(user.getIsLocked())) {
                return ResponseEntity.status(401).body(Map.of("message", "Account is locked"));
            }

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid password"));
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "SUCCESS");
            resp.put("username", user.getUsername());
            resp.put("role", user.getRole());
            resp.put("authMethod", "DATABASE");
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String role = request.get("role");

        try {
            User user = userService.createUser(username, password, role);

            // Simulation of SMS or Email verification trigger
            boolean smsEnabled = "true".equalsIgnoreCase(userService.getConfig("ENABLE_SMS_AUTH_SIGNUP", "false"));
            boolean emailEnabled = "true".equalsIgnoreCase(userService.getConfig("ENABLE_EMAIL_AUTH_SIGNUP", "false"));

            String notificationMsg = "";
            if (smsEnabled) {
                notificationMsg += "[SMS OTP Triggered] Send simulated verification code to user " + username + "\n";
            }
            if (emailEnabled) {
                notificationMsg += "[Email Activation Link Triggered] Send activation email to " + username + "@example.com\n";
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Account created successfully.");
            resp.put("username", user.getUsername());
            resp.put("notificationSimulated", notificationMsg);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        Optional<User> uOpt = userRepository.findByUsername(username);
        if (uOpt.isPresent()) {
            User u = uOpt.get();
            u.setPwdResetToken(UUID.randomUUID().toString());
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "Password reset token generated: " + u.getPwdResetToken()));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<User> uOpt = userRepository.findByUsername(username);
        if (uOpt.isPresent()) {
            User u = uOpt.get();
            if (u.getPwdResetToken() != null && u.getPwdResetToken().equals(token)) {
                userService.resetPassword(username, newPassword);
                u.setPwdResetToken(null);
                userRepository.save(u);
                return ResponseEntity.ok(Map.of("message", "Password reset successful"));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid token or username"));
    }
}
