package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(String username);
    CartResponse addItemToCart(String username, CartItemRequest request);
    CartResponse updateItemQuantity(String username, Long productId, Integer quantity);
    CartResponse removeItemFromCart(String username, Long productId);
    void clearCart(String username);
}
