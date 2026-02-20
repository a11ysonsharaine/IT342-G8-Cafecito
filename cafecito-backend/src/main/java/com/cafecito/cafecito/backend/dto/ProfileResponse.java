package com.cafecito.cafecito.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private UUID id;
    private String email;
    private String name;
    private String phoneNumber;
    private boolean hasPhoto;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
