package com.cafecito.cafecito.backend.controller;

import com.cafecito.cafecito.backend.dto.*;
import com.cafecito.cafecito.backend.entity.User;
import com.cafecito.cafecito.backend.repository.UserRepository;
import com.cafecito.cafecito.backend.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getName());
            user.setPhoneNumber(request.getPhoneNumber());

            userRepository.save(user);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "User registered successfully"));

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(false, "Email already registered"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Find user by email
            User user = userRepository.findByEmail(request.getEmail())
                    .orElse(null);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid email or password"));
            }

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid email or password"));
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok(new TokenResponse(token, "Login successful"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Login failed: " + e.getMessage()));
        }
    }
}
