package com.cafecito.cafecito.backend.features.orders.controller;

import com.cafecito.cafecito.backend.core.shared_models.ApiResponse;
import com.cafecito.cafecito.backend.features.orders.dto.OrderResponse;
import com.cafecito.cafecito.backend.features.orders.dto.PlaceOrderRequest;
import com.cafecito.cafecito.backend.features.orders.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        try {
            OrderResponse placed = orderService.placeOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(placed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to place order: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> myOrders() {
        try {
            List<OrderResponse> orders = orderService.listMyOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to fetch orders: " + e.getMessage()));
        }
    }

    @GetMapping("/my/{orderId}")
    public ResponseEntity<?> myOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getMyOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to fetch order: " + e.getMessage()));
        }
    }
}
