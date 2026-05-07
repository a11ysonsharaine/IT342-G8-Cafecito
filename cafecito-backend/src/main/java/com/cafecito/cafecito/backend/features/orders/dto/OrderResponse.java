package com.cafecito.cafecito.backend.features.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private String fulfillment;
    private String status;
    private String paymentMethod;

    private int subtotalCents;
    private int deliveryFeeCents;
    private int discountCents;
    private int totalCents;

    private Map<String, Object> shippingInfo;
    private List<OrderItemResponse> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
