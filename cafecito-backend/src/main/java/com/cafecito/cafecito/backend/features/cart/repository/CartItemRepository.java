package com.cafecito.cafecito.backend.features.cart.repository;

import com.cafecito.cafecito.backend.features.cart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByUserId(UUID userId);
    
    Optional<CartItem> findByUserIdAndProductIdAndSizeAndSugarLevelAndMilkType(
        UUID userId, UUID productId, String size, String sugarLevel, String milkType);
    
    void deleteByUserId(UUID userId);
    
    Long countByUserId(UUID userId);
}
