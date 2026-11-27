package com.ecommerce.service;

import com.ecommerce.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Map;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse getUserById(Long id);
    void toggleUserStatus(Long id, boolean enabled);
    Map<String, Object> getSystemAnalytics();
}
