package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name cannot be blank")
    @Size(max = 100, message = "Category name cannot exceed 100 characters")
    private String name;

    private String description;
}
