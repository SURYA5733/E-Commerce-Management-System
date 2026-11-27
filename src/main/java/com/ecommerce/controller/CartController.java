package com.ecommerce.controller;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Shopping Cart", description = "Customer shopping cart operations")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get active customer's cart")
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the shopping cart")
    public ResponseEntity<CartResponse> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(cartService.addItemToCart(authentication.getName(), request));
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        return ResponseEntity.ok(cartService.updateItemQuantity(authentication.getName(), productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @PathVariable Long productId,
            Authentication authentication) {
        return ResponseEntity.ok(cartService.removeItemFromCart(authentication.getName(), productId));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from the cart")
    public ResponseEntity<MessageResponse> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully"));
    }
}
