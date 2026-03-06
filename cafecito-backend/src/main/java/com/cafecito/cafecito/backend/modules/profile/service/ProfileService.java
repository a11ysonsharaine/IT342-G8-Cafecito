package com.cafecito.cafecito.backend.modules.profile.service;

import com.cafecito.cafecito.backend.common.dto.ApiResponse;
import com.cafecito.cafecito.backend.common.util.FileValidationUtil;
import com.cafecito.cafecito.backend.modules.auth.entity.User;
import com.cafecito.cafecito.backend.modules.auth.repository.UserRepository;
import com.cafecito.cafecito.backend.modules.profile.dto.ChangePasswordRequest;
import com.cafecito.cafecito.backend.modules.profile.dto.ProfileResponse;
import com.cafecito.cafecito.backend.modules.profile.dto.UpdateProfileRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Service
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public ProfileResponse getProfileResponse(String email) {
        User user = findByEmail(email);
        
        if (user == null) {
            return null;
        }

        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setHasPhoto(user.getPhotoBytes() != null);
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        return response;
    }

    @org.springframework.transaction.annotation.Transactional
    public ApiResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);

        if (user == null) {
            return new ApiResponse(false, "User not found");
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        User saved = userRepository.save(user);

        ProfileResponse profileResponse = new ProfileResponse();
        profileResponse.setId(saved.getId());
        profileResponse.setEmail(saved.getEmail());
        profileResponse.setName(saved.getName());
        profileResponse.setPhoneNumber(saved.getPhoneNumber());
        profileResponse.setHasPhoto(saved.getPhotoBytes() != null);
        profileResponse.setCreatedAt(saved.getCreatedAt());
        profileResponse.setUpdatedAt(saved.getUpdatedAt());

        return new ApiResponse(true, "Profile updated successfully", profileResponse);
    }

    @org.springframework.transaction.annotation.Transactional
    public ApiResponse changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);

        if (user == null) {
            return new ApiResponse(false, "User not found");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return new ApiResponse(false, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User saved = userRepository.save(user);

        ProfileResponse profileResponse = new ProfileResponse();
        profileResponse.setId(saved.getId());
        profileResponse.setEmail(saved.getEmail());
        profileResponse.setName(saved.getName());
        profileResponse.setPhoneNumber(saved.getPhoneNumber());
        profileResponse.setHasPhoto(saved.getPhotoBytes() != null);
        profileResponse.setCreatedAt(saved.getCreatedAt());
        profileResponse.setUpdatedAt(saved.getUpdatedAt());

        return new ApiResponse(true, "Password changed successfully", profileResponse);
    }

    @org.springframework.transaction.annotation.Transactional
    public ApiResponse uploadPhoto(String email, MultipartFile file) throws IOException {
        logger.info("Starting photo upload for email: {}", email);

        User user = findByEmail(email);

        if (user == null) {
            logger.error("User not found: {}", email);
            return new ApiResponse(false, "User not found");
        }

        if (file.isEmpty()) {
            logger.error("File is empty");
            return new ApiResponse(false, "File is empty");
        }

        // Validate file using utility
        String validationError = FileValidationUtil.validateImageFile(file);
        if (validationError != null) {
            logger.error("File validation failed: {}", validationError);
            return new ApiResponse(false, validationError);
        }

        byte[] photoBytes = file.getBytes();
        String fileName = file.getOriginalFilename();

        logger.info("Uploading photo: {} bytes, filename: {}", photoBytes.length, fileName);

        // Use JdbcTemplate for direct database access (bypasses Hibernate byte array detection issues with PgBouncer)
        String sql = "UPDATE users SET photo_bytes = ?, photo_file_name = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?";
        int rowsUpdated = jdbcTemplate.update(sql, photoBytes, fileName, email);

        if (rowsUpdated == 0) {
            logger.error("No rows updated for email: {}", email);
            return new ApiResponse(false, "Failed to update photo");
        }

        logger.info("Photo uploaded successfully for user: {}", email);
        return new ApiResponse(true, "Photo uploaded successfully");
    }

    public byte[] getUserPhoto(String email) {
        User user = findByEmail(email);
        return (user != null) ? user.getPhotoBytes() : null;
    }

    public String getPhotoFileName(String email) {
        User user = findByEmail(email);
        return (user != null) ? user.getPhotoFileName() : null;
    }
}
