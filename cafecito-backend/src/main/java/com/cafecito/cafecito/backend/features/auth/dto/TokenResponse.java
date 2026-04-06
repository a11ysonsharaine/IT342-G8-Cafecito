package com.cafecito.cafecito.backend.features.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String token;
    private String type = "Bearer";
    private String message;

    // Optional user snapshot (helps client decide routing/role without extra call)
    private UUID id;
    private String email;
    private String name;
    private String role;
    
    public TokenResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }
}
