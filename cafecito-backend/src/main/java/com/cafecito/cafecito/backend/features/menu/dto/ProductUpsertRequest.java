package com.cafecito.cafecito.backend.features.menu.dto;

import lombok.Data;

@Data
public class ProductUpsertRequest {
    private String name;
    private String description;
    private Integer priceCents;
    private String imageUrl;
    private String categoryName;
    private Boolean featured;
    private Boolean active;
}
