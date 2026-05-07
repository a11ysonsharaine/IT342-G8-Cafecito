package com.cafecito.cafecito.backend.features.orders.repository;

import com.cafecito.cafecito.backend.features.orders.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    boolean existsByOrderNumber(String orderNumber);

    List<Order> findAllByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Order> findByIdAndUserId(UUID id, String userId);
}
