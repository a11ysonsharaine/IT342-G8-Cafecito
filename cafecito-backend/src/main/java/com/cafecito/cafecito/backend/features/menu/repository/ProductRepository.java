package com.cafecito.cafecito.backend.features.menu.repository;

import com.cafecito.cafecito.backend.features.menu.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findAllByIsActiveTrueAndIsDeletedFalseOrderByNameAsc();
    List<Product> findAllByIsActiveTrueAndIsDeletedFalseAndCategory_IdOrderByNameAsc(UUID categoryId);

    List<Product> findAllByIsDeletedFalseOrderByNameAsc();
}
