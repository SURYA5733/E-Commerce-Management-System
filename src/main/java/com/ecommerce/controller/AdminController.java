package com.ecommerce.controller;

import com.ecommerce.dto.response.MessageResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Platform management, user controls, and system analytics")
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    @Operation(summary = "Get all registered users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable user account")
    public ResponseEntity<MessageResponse> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        userService.toggleUserStatus(id, enabled);
        return ResponseEntity.ok(new MessageResponse("User status updated successfully"));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform-wide dashboard analytics (Users, Products, Orders, Revenue)")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(userService.getSystemAnalytics());
    }
}
