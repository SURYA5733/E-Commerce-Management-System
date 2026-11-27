package com.ecommerce.service;

import com.ecommerce.dto.request.OrderCreateRequest;
import com.ecommerce.dto.request.OrderStatusUpdateRequest;
import com.ecommerce.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(String customerUsername, OrderCreateRequest request);
    Page<OrderResponse> getCustomerOrders(String customerUsername, Pageable pageable);
    OrderResponse getOrderByTrackingNumber(String trackingNumber, String currentUsername);
    List<OrderResponse> getOrdersForSeller(String sellerUsername);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String currentUsername);
}
