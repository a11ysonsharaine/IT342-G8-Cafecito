package com.cafecito.cafecito.backend.features.cart.controller;

import com.cafecito.cafecito.backend.core.shared_models.ApiResponse;
import com.cafecito.cafecito.backend.features.cart.dto.CartItemResponse;
import com.cafecito.cafecito.backend.features.cart.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Add item to cart
     * POST /api/cart/add?productId=uuid&quantity=1&size=large&sugarLevel=low&milkType=almond
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestParam UUID productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String sugarLevel,
            @RequestParam(required = false) String milkType) {
        try {
            CartItemResponse item = cartService.addToCart(productId, quantity, size, sugarLevel, milkType);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to add item to cart: " + e.getMessage()));
        }
    }

    /**
     * Get user's cart
     * GET /api/cart
     */
    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            List<CartItemResponse> items = cartService.getCart();
            return ResponseEntity.ok(items);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to fetch cart: " + e.getMessage()));
        }
    }

    /**
     * Update quantity of cart item
     * PUT /api/cart/{itemId}?quantity=5
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable UUID itemId,
            @RequestParam Integer quantity) {
        try {
            cartService.updateQuantity(itemId, quantity);
            return ResponseEntity.ok(new ApiResponse(true, "Quantity updated"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to update quantity: " + e.getMessage()));
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/{itemId}
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable UUID itemId) {
        try {
            cartService.removeItem(itemId);
            return ResponseEntity.ok(new ApiResponse(true, "Item removed from cart"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to remove item: " + e.getMessage()));
        }
    }

    /**
     * Clear entire cart
     * POST /api/cart/clear
     */
    @PostMapping("/clear")
    public ResponseEntity<?> clearCart() {
        try {
            cartService.clearCart();
            return ResponseEntity.ok(new ApiResponse(true, "Cart cleared"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to clear cart: " + e.getMessage()));
        }
    }
}
