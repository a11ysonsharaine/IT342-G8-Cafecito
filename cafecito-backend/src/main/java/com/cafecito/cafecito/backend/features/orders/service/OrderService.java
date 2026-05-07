package com.cafecito.cafecito.backend.features.orders.service;

import com.cafecito.cafecito.backend.core.base.UserRepository;
import com.cafecito.cafecito.backend.features.menu.model.Product;
import com.cafecito.cafecito.backend.features.menu.repository.ProductRepository;
import com.cafecito.cafecito.backend.features.orders.dto.OrderItemResponse;
import com.cafecito.cafecito.backend.features.orders.dto.OrderResponse;
import com.cafecito.cafecito.backend.features.orders.dto.PlaceOrderItemRequest;
import com.cafecito.cafecito.backend.features.orders.dto.PlaceOrderRequest;
import com.cafecito.cafecito.backend.features.orders.model.Order;
import com.cafecito.cafecito.backend.features.orders.model.OrderItem;
import com.cafecito.cafecito.backend.features.orders.repository.OrderRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    private static final SecureRandom random = new SecureRandom();

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private static String normalizeFulfillment(String fulfillment) {
        if (fulfillment == null) return "delivery";
        String normalized = fulfillment.trim().toLowerCase();
        return normalized.isBlank() ? "delivery" : normalized;
    }

    private static String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null) return "cash-on-delivery";
        String normalized = paymentMethod.trim().toLowerCase();
        return normalized.isBlank() ? "cash-on-delivery" : normalized;
    }

    private static int normalizeDiscount(Integer discountCents) {
        return discountCents == null ? 0 : Math.max(0, discountCents);
    }

    private static Map<String, Object> normalizeShippingInfo(Map<String, Object> shippingInfo) {
        return shippingInfo == null ? new HashMap<>() : shippingInfo;
    }

    private static String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth == null) ? null : auth.getName();
    }

    private String generateOrderNumber() {
        // CAF-12345 style
        for (int i = 0; i < 10; i++) {
            int n = random.nextInt(90000) + 10000;
            String candidate = "CAF-" + n;
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        // Extremely unlikely fallback
        return "CAF-" + (System.currentTimeMillis() % 1000000);
    }

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        String email = currentEmail();
        if (email == null) {
            throw new IllegalStateException("Not authenticated");
        }

        var user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String fulfillment = normalizeFulfillment(request.getFulfillment());
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        int discountCents = normalizeDiscount(request.getDiscountCents());
        Map<String, Object> shippingInfo = normalizeShippingInfo(request.getShippingInfo());

        // Compute subtotal from DB product prices (do not trust client totals)
        int subtotalCents = 0;
        for (PlaceOrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid product: " + item.getProductId()));

            int unitPrice = product.getPriceCents() == null ? 0 : product.getPriceCents();
            subtotalCents += unitPrice * item.getQuantity();
        }

    int deliveryFeeCents = fulfillment.equals("delivery") ? 20 : 0;
        int totalCents = Math.max(0, subtotalCents + deliveryFeeCents - discountCents);

        Order order = new Order();
        order.setUserId(user.getId() == null ? null : user.getId().toString());
        order.setOrderNumber(generateOrderNumber());
        order.setFulfillment(fulfillment);
        order.setStatus("Preparing");
        order.setPaymentMethod(paymentMethod);
        order.setSubtotalCents(subtotalCents);
        order.setDeliveryFeeCents(deliveryFeeCents);
        order.setDiscountCents(discountCents);
        order.setTotalCents(totalCents);
        order.setShippingInfo(shippingInfo);

        if (order.getItems() == null) {
            order.setItems(new java.util.ArrayList<>());
        }

        // Create items with snapshots and attach to the order BEFORE saving.
        // CascadeType.ALL on Order.items will persist these OrderItem rows.
        for (PlaceOrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid product: " + item.getProductId()));

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setProductName(product.getName());
            oi.setUnitPriceCents(product.getPriceCents() == null ? 0 : product.getPriceCents());
            oi.setProductImageUrl(product.getImageUrl());
            oi.setQuantity(item.getQuantity());
            oi.setSize(item.getSize());
            oi.setSugarLevel(item.getSugarLevel());
            oi.setMilkType(item.getMilkType());

            order.getItems().add(oi);
        }

        Order savedWithItems = orderRepository.save(order);
        return toResponse(savedWithItems);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listMyOrders() {
        String email = currentEmail();
        if (email == null) {
            throw new IllegalStateException("Not authenticated");
        }

        var user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String userId = user.getId() == null ? null : user.getId().toString();
        if (userId == null) {
            throw new IllegalStateException("User id missing");
        }

        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(UUID orderId) {
        String email = currentEmail();
        if (email == null) {
            throw new IllegalStateException("Not authenticated");
        }

        var user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String userId = user.getId() == null ? null : user.getId().toString();
        if (userId == null) {
            throw new IllegalStateException("User id missing");
        }

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = (order.getItems() == null ? List.<OrderItem>of() : order.getItems())
                .stream()
                .map(oi -> new OrderItemResponse(
                        oi.getId(),
                        oi.getProduct() == null ? null : oi.getProduct().getId(),
                        oi.getProductName(),
                        oi.getUnitPriceCents(),
                        oi.getProductImageUrl(),
                        oi.getQuantity(),
                        oi.getSize(),
                        oi.getSugarLevel(),
                        oi.getMilkType()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getFulfillment(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getSubtotalCents(),
                order.getDeliveryFeeCents(),
                order.getDiscountCents(),
                order.getTotalCents(),
                order.getShippingInfo(),
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
