package com.cafecito.cafecito.backend.features.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class PlaceOrderRequest {

    private String fulfillment; // delivery | pickup

    private String paymentMethod;

    @Min(0)
    private Integer discountCents;

    private Map<String, Object> shippingInfo;

    @NotEmpty
    private List<@Valid PlaceOrderItemRequest> items;
}
