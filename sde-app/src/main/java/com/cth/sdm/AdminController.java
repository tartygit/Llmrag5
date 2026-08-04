package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users/{username}/lock")
    public ResponseEntity<?> lockUser(@PathVariable String username) {
        userService.lockUser(username);
        return ResponseEntity.ok(Map.of("message", "User locked successfully"));
    }

    @PostMapping("/users/{username}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable String username) {
        userService.unlockUser(username);
        return ResponseEntity.ok(Map.of("message", "User unlocked successfully"));
    }

    @PostMapping("/users/{username}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String username, @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        userService.resetPassword(username, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/configs")
    public ResponseEntity<?> getConfigs() {
        Map<String, String> configs = new HashMap<>();
        configs.put("APP_NAME", userService.getConfig("APP_NAME", "Software Development Document Environment"));
        configs.put("DEFAULT_APP_CODE", userService.getConfig("DEFAULT_APP_CODE", "SDE"));
        configs.put("AUTH_METHOD", userService.getConfig("AUTH_METHOD", "DATABASE"));
        configs.put("POLLING_DIR", userService.getConfig("POLLING_DIR", "./polling_folder"));
        configs.put("ENABLE_SMS_AUTH_SIGNUP", userService.getConfig("ENABLE_SMS_AUTH_SIGNUP", "false"));
        configs.put("ENABLE_EMAIL_AUTH_SIGNUP", userService.getConfig("ENABLE_EMAIL_AUTH_SIGNUP", "false"));
        configs.put("ENABLE_APPROVER_SMS_NOTIFY", userService.getConfig("ENABLE_APPROVER_SMS_NOTIFY", "false"));
        configs.put("ENABLE_APPROVER_EMAIL_NOTIFY", userService.getConfig("ENABLE_APPROVER_EMAIL_NOTIFY", "false"));
        return ResponseEntity.ok(configs);
    }

    @PostMapping("/configs")
    public ResponseEntity<?> updateConfigs(@RequestBody Map<String, String> configs) {
        configs.forEach((key, val) -> userService.saveConfig(key, val));
        return ResponseEntity.ok(Map.of("message", "Configurations updated successfully"));
    }
}
