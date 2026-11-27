package com.ecommerce.dto.response;

import com.ecommerce.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderTrackingNumber;
    private Long customerId;
    private String customerUsername;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private List<CartItemResponse> items;
    private LocalDateTime createdAt;
}
