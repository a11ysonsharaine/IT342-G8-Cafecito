package com.cafecito.cafecito.backend.features.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class OrderItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private int unitPriceCents;
    private String productImageUrl;
    private int quantity;
    private String size;
    private String sugarLevel;
    private String milkType;
}
