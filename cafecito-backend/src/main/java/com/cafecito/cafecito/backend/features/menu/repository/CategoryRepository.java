package com.cafecito.cafecito.backend.features.menu.repository;

import com.cafecito.cafecito.backend.features.menu.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByOrderByNameAsc();

    Optional<Category> findByNameIgnoreCase(String name);
}
