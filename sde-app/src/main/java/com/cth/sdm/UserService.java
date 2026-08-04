package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppConfigRepository appConfigRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void initSeedData() {
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", passwordEncoder.encode("admin123"), "ADMIN", LocalDateTime.now().plusDays(90)));
            userRepository.save(new User("maker", passwordEncoder.encode("admin123"), "MAKER", LocalDateTime.now().plusDays(90)));
            userRepository.save(new User("checker", passwordEncoder.encode("admin123"), "CHECKER", LocalDateTime.now().plusDays(90)));
        }

        addConfigIfAbsent("APP_NAME", "Software Development Document Environment");
        addConfigIfAbsent("DEFAULT_APP_CODE", "SDE");
        addConfigIfAbsent("POLLING_DIR", "./polling_folder");
        addConfigIfAbsent("ENABLE_SMS_AUTH_SIGNUP", "false");
        addConfigIfAbsent("ENABLE_EMAIL_AUTH_SIGNUP", "false");
        addConfigIfAbsent("ENABLE_APPROVER_SMS_NOTIFY", "false");
        addConfigIfAbsent("ENABLE_APPROVER_EMAIL_NOTIFY", "false");
    }

    private void addConfigIfAbsent(String key, String val) {
        if (!appConfigRepository.existsById(key)) {
            appConfigRepository.save(new AppConfig(key, val));
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(String username, String password, String role) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        User user = new User(username, passwordEncoder.encode(password), role, LocalDateTime.now().plusDays(90));
        return userRepository.save(user);
    }

    public void lockUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsLocked("Y");
        userRepository.save(user);
    }

    public void unlockUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsLocked("N");
        userRepository.save(user);
    }

    public void resetPassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPwdExpiryDate(LocalDateTime.now().plusDays(90));
        userRepository.save(user);
    }

    public String getConfig(String key, String defaultVal) {
        return appConfigRepository.findById(key).map(AppConfig::getConfigValue).orElse(defaultVal);
    }

    public void saveConfig(String key, String val) {
        appConfigRepository.save(new AppConfig(key, val));
    }
}
