package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                // Seed if empty
                userService.initSeedData();

                // Check LDAP Toggle
                String authMethod = userService.getConfig("AUTH_METHOD", "DATABASE");
                if ("LDAP".equalsIgnoreCase(authMethod)) {
                    // Simulating LDAP lookup / authentication
                    if ("admin".equalsIgnoreCase(username) || "maker".equalsIgnoreCase(username) || "checker".equalsIgnoreCase(username)) {
                        return org.springframework.security.core.userdetails.User.withUsername(username)
                                .password(passwordEncoder.encode("admin123"))
                                .roles("admin".equals(username) ? "ADMIN" : "maker".equals(username) ? "MAKER" : "CHECKER")
                                .build();
                    }
                }

                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

                if ("Y".equals(user.getIsLocked())) {
                    throw new RuntimeException("User account is locked.");
                }

                if (user.getPwdExpiryDate().isBefore(LocalDateTime.now())) {
                    throw new RuntimeException("Password expired. Please contact admin.");
                }

                return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                        .password(user.getPassword())
                        .roles(user.getRole())
                        .build();
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**", "/h2-console/**").permitAll()
                .anyRequest().permitAll() // Allow local API requests, we can authenticate manually/Basic
            )
            .headers(headers -> headers.frameOptions(opts -> opts.disable())) // Needed for H2 Console
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
