package com.cafecito.cafecito.backend.common.util;

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
        if (file == null || file.isEmpty()) {
            return "File is empty";
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "Only JPG, JPEG, and PNG files are allowed";
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return "File size must not exceed 5MB";
        }

        return null; // Validation passed
    }
}
