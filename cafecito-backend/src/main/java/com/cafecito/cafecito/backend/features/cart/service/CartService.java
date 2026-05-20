package com.cafecito.cafecito.backend.features.cart.service;

import com.cafecito.cafecito.backend.core.base.UserRepository;
import com.cafecito.cafecito.backend.core.shared_models.User;
import com.cafecito.cafecito.backend.features.cart.dto.CartItemResponse;
import com.cafecito.cafecito.backend.features.cart.model.CartItem;
import com.cafecito.cafecito.backend.features.cart.repository.CartItemRepository;
import com.cafecito.cafecito.backend.features.menu.model.Product;
import com.cafecito.cafecito.backend.features.menu.repository.ProductRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private static String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth == null) ? null : auth.getName();
    }

    private User getCurrentUser() {
        String email = currentEmail();
        if (email == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public CartItemResponse addToCart(UUID productId, Integer quantity, 
                                      String size, String sugarLevel, String milkType) {
        User currentUser = getCurrentUser();
        
        // Validate product exists and is active
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        
        if (product.isDeleted() || !product.isActive()) {
            throw new IllegalArgumentException("Product is not available");
        }

        // Check if item already exists in cart with same customizations
        CartItem existingItem = cartItemRepository.findByUserIdAndProductIdAndSizeAndSugarLevelAndMilkType(
                currentUser.getId(), productId, size, sugarLevel, milkType).orElse(null);

        CartItem cartItem;
        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItem = cartItemRepository.save(existingItem);
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setUserId(currentUser.getId());
            cartItem.setProductId(productId);
            cartItem.setProductName(product.getName());
            cartItem.setPriceCents(product.getPriceCents());
            cartItem.setQuantity(quantity);
            cartItem.setSize(size);
            cartItem.setSugarLevel(sugarLevel);
            cartItem.setMilkType(milkType);
            cartItem.setImageUrl(product.getImageUrl());
            cartItem = cartItemRepository.save(cartItem);
        }

        return mapToResponse(cartItem);
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCart() {
        User currentUser = getCurrentUser();
        return cartItemRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void updateQuantity(UUID cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        User currentUser = getCurrentUser();
        if (!item.getUserId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        if (quantity <= 0) {
            cartItemRepository.deleteById(cartItemId);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
    }

    @Transactional
    public void removeItem(UUID cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        User currentUser = getCurrentUser();
        if (!item.getUserId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }

        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart() {
        User currentUser = getCurrentUser();
        cartItemRepository.deleteByUserId(currentUser.getId());
    }

    private CartItemResponse mapToResponse(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getProductId(),
                item.getProductName(),
                item.getPriceCents(),
                item.getQuantity(),
                item.getSize(),
                item.getSugarLevel(),
                item.getMilkType(),
                item.getImageUrl()
        );
    }
}
