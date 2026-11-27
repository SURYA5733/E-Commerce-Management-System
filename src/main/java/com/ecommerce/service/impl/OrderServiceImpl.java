package com.ecommerce.service.impl;

import com.ecommerce.dto.request.OrderCreateRequest;
import com.ecommerce.dto.request.OrderStatusUpdateRequest;
import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(String customerUsername, OrderCreateRequest request) {
        User customer = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerUsername));

        Cart cart = cartRepository.findByUserId(customer.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty cart");
        }

        // Validate stock and compute total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderTrackingNumber(UUID.randomUUID().toString())
                .user(customer)
                .status(OrderStatus.PAID) // Mock instant successful payment
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("COMPLETED")
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal itemPrice = product.getPrice();
            BigDecimal subtotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(itemPrice)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Empty customer cart
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    public Page<OrderResponse> getCustomerOrders(String customerUsername, Pageable pageable) {
        User customer = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerUsername));

        return orderRepository.findByUserId(customer.getId(), pageable).map(this::mapToOrderResponse);
    }

    @Override
    public OrderResponse getOrderByTrackingNumber(String trackingNumber, String currentUsername) {
        Order order = orderRepository.findByOrderTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with tracking number: " + trackingNumber));

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN);
        boolean isOwner = order.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Access denied to view this order");
        }

        return mapToOrderResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersForSeller(String sellerUsername) {
        User seller = userRepository.findByUsername(sellerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerUsername));

        return orderRepository.findOrdersContainingSellerProducts(seller.getId()).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToOrderResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String currentUsername) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN);
        boolean isSeller = currentUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_SELLER);

        if (!isAdmin && !isSeller) {
            throw new AccessDeniedException("Only Admins or Sellers can update order status");
        }

        order.setStatus(request.getStatus());
        return mapToOrderResponse(orderRepository.save(order));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<CartItemResponse> items = order.getOrderItems().stream().map(oi -> CartItemResponse.builder()
                .id(oi.getId())
                .productId(oi.getProduct().getId())
                .productName(oi.getProduct().getName())
                .productImageUrl(oi.getProduct().getImageUrl())
                .unitPrice(oi.getPrice())
                .quantity(oi.getQuantity())
                .subtotal(oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity())))
                .build()).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderTrackingNumber(order.getOrderTrackingNumber())
                .customerId(order.getUser().getId())
                .customerUsername(order.getUser().getUsername())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
