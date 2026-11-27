package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    Page<ProductResponse> getAllProducts(Pageable pageable);
    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);
    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getProductsBySeller(Long sellerId);
    ProductResponse createProduct(ProductRequest request, String sellerUsername);
    ProductResponse updateProduct(Long id, ProductRequest request, String currentUsername);
    void deleteProduct(Long id, String currentUsername);
}
