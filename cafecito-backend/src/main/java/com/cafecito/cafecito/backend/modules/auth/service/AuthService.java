package com.cafecito.cafecito.backend.modules.auth.service;

import com.cafecito.cafecito.backend.common.dto.ApiResponse;
import com.cafecito.cafecito.backend.modules.auth.dto.LoginRequest;
import com.cafecito.cafecito.backend.modules.auth.dto.RegisterRequest;
import com.cafecito.cafecito.backend.modules.auth.dto.TokenResponse;
import com.cafecito.cafecito.backend.modules.auth.entity.User;
import com.cafecito.cafecito.backend.modules.auth.repository.UserRepository;
import com.cafecito.cafecito.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Transactional
    public ApiResponse registerUser(RegisterRequest request) {
        try {
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return new ApiResponse(false, "Email already registered");
            }

            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getName());
            user.setPhoneNumber(request.getPhoneNumber());

            User savedUser = userRepository.save(user);

            // Verify the user was actually saved
            if (savedUser.getId() == null) {
                return new ApiResponse(false, "Failed to save user - ID not generated");
            }

            Map<String, String> userData = new LinkedHashMap<>();
            userData.put("id", savedUser.getId().toString());
            userData.put("name", savedUser.getName());
            userData.put("email", savedUser.getEmail());

            return new ApiResponse(true, "Account created successfully!", userData);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse(false, "Registration failed: " + e.getMessage());
        }
    }

    public Object loginUser(LoginRequest request) {
        User user = findByEmail(request.getEmail());
        
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new ApiResponse(false, "Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new TokenResponse(token, "Login successful");
    }
}
