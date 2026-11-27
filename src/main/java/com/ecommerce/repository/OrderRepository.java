package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user"})
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user"})
    Optional<Order> findByOrderTrackingNumber(String orderTrackingNumber);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user"})
    List<Order> findByStatus(OrderStatus status);

    @Override
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user"})
    Page<Order> findAll(Pageable pageable);

    @Query("SELECT o FROM Order o JOIN o.orderItems oi WHERE oi.product.seller.id = :sellerId")
    List<Order> findOrdersContainingSellerProducts(Long sellerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal calculateTotalRevenue();
}
