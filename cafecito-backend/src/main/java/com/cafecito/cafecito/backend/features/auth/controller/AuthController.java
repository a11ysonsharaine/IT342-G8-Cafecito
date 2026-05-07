package com.cafecito.cafecito.backend.features.auth.controller;

import com.cafecito.cafecito.backend.core.shared_models.ApiResponse;
import com.cafecito.cafecito.backend.core.base.UserRepository;
import com.cafecito.cafecito.backend.core.shared_models.User;
import com.cafecito.cafecito.backend.features.auth.dto.LoginRequest;
import com.cafecito.cafecito.backend.features.auth.dto.RegisterRequest;
import com.cafecito.cafecito.backend.features.auth.dto.TokenResponse;
import com.cafecito.cafecito.backend.features.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            ApiResponse response = authService.registerUser(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
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
            Object response = authService.loginUser(request);
            
            if (response instanceof TokenResponse) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Protected endpoint to validate the current JWT and return the matching application user.
     * Useful for debugging "Unauthorized" vs "Forbidden" from the frontend.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Unauthorized"));
        }

        User user = userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Unauthorized"));
        }

        return ResponseEntity.ok(new ApiResponse(true, "OK", java.util.Map.of(
                "email", user.getEmail(),
                "role", user.getRole() == null ? "customer" : user.getRole().trim().toLowerCase()
        )));
    }
}
