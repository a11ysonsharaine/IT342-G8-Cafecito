package com.cafecito.cafecito.backend.features.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private Integer priceCents;
    private Integer quantity;
    private String size;
    private String sugarLevel;
    private String milkType;
    private String imageUrl;
}
