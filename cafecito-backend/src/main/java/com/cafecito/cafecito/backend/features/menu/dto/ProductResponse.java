package com.cafecito.cafecito.backend.features.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private int priceCents;
    private String imageUrl;
    private boolean featured;
    private UUID categoryId;
    private String categoryName;
}
