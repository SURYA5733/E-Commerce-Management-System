package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"category", "seller"})
    Page<Product> findByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "seller"})
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "seller"})
    List<Product> findBySellerId(Long sellerId);

    @EntityGraph(attributePaths = {"category", "seller"})
    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"category", "seller"})
    Optional<Product> findById(Long id);
}
