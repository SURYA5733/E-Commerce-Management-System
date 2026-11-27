package com.ecommerce.service.impl;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponse getCart(String username) {
        Cart cart = getOrCreateCart(username);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(String username, CartItemRequest request) {
        Cart cart = getOrCreateCart(username);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is currently unavailable");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Total quantity exceeds available stock (" + product.getStockQuantity() + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(item);
            cart.getItems().add(item);
        }

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(String username, Long productId, Integer quantity) {
        if (quantity <= 0) {
            return removeItemFromCart(username, productId);
        }

        Cart cart = getOrCreateCart(username);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(String username, Long productId) {
        Cart cart = getOrCreateCart(username);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return mapToCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    @Transactional
    public void clearCart(String username) {
        Cart cart = getOrCreateCart(username);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {
            BigDecimal subtotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(subtotal);
            totalItems += item.getQuantity();

            itemResponses.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productImageUrl(item.getProduct().getImageUrl())
                    .unitPrice(item.getProduct().getPrice())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build());
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }
}
