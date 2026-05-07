package com.cafecito.cafecito.backend.features.orders.repository;

import com.cafecito.cafecito.backend.features.orders.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
}
