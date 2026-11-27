package com.ecommerce.controller;

import com.ecommerce.dto.request.OrderCreateRequest;
import com.ecommerce.dto.request.OrderStatusUpdateRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Orders", description = "Checkout, Order tracking, and Status management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Checkout and create order from current cart (CUSTOMER)")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(orderService.createOrder(authentication.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get current customer's order history")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.getCustomerOrders(authentication.getName(), pageable));
    }

    @GetMapping("/tracking/{trackingNumber}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Track order details by tracking number (Owner or ADMIN)")
    public ResponseEntity<OrderResponse> getOrderByTrackingNumber(
            @PathVariable String trackingNumber,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrderByTrackingNumber(trackingNumber, authentication.getName()));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Get orders containing products sold by current seller")
    public ResponseEntity<List<OrderResponse>> getSellerOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrdersForSeller(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all platform orders (ADMIN only)")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Update order status (e.g. PROCESSING, SHIPPED, DELIVERED)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request, authentication.getName()));
    }
}
