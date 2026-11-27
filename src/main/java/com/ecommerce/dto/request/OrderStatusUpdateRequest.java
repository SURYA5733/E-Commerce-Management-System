package com.ecommerce.dto.request;

import com.ecommerce.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "Order status is required")
    private OrderStatus status;
}
