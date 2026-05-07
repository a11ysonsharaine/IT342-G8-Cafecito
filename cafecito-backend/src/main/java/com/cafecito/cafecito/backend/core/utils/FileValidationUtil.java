package com.cafecito.cafecito.backend.core.utils;

import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class FileValidationUtil {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", 
        "image/png", 
        "image/jpg"
    );
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Validates an image file for type and size constraints
     * @param file the file to validate
     * @return error message if validation fails, null if validation passes
     */
    public static String validateImageFile(MultipartFile file) {
        return validateImageFile(file, MAX_FILE_SIZE);
    }

    /**
     * Validates an image file for type and size constraints
     * @param file the file to validate
     * @param maxBytes max allowed size in bytes
     * @return error message if validation fails, null if validation passes
     */
    public static String validateImageFile(MultipartFile file, long maxBytes) {
        if (file == null || file.isEmpty()) {
            return "File is empty";
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "Only JPG, JPEG, and PNG files are allowed";
        }

        if (maxBytes > 0 && file.getSize() > maxBytes) {
            long maxMb = Math.max(1, maxBytes / (1024 * 1024));
            return "File size must not exceed " + maxMb + "MB";
        }

        return null; // Validation passed
    }
}
