package com.cafecito.cafecito.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String token;
    private String type = "Bearer";
    private String message;
    
    public TokenResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }
}
