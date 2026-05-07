package com.cafecito.cafecito.backend.features.orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PlaceOrderItemRequest {

    @NotNull
    private UUID productId;

    @Min(1)
    private int quantity;

    private String size;

    private String sugarLevel;

    private String milkType;
}
