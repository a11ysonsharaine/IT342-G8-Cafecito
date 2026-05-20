package com.cafecito.cafecito.backend.features.menu.controller;

import com.cafecito.cafecito.backend.features.menu.dto.CategoryResponse;
import com.cafecito.cafecito.backend.features.menu.dto.ProductResponse;
import com.cafecito.cafecito.backend.features.menu.model.Category;
import com.cafecito.cafecito.backend.features.menu.model.Product;
import com.cafecito.cafecito.backend.features.menu.repository.CategoryRepository;
import com.cafecito.cafecito.backend.features.menu.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/menu")
public class MenuController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public MenuController(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }

    @GetMapping("/products")
    public List<ProductResponse> listProducts(@RequestParam(name = "categoryId", required = false) UUID categoryId) {
        List<Product> products = (categoryId == null)
                ? productRepository.findAllByIsActiveTrueAndIsDeletedFalseOrderByNameAsc()
                : productRepository.findAllByIsActiveTrueAndIsDeletedFalseAndCategory_IdOrderByNameAsc(categoryId);

        return products.stream().map(p -> {
            Category c = p.getCategory();
            return new ProductResponse(
                    p.getId(),
                    p.getName(),
                    p.getDescription(),
                    p.getPriceCents() == null ? 0 : p.getPriceCents(),
                    p.getImageUrl(),
                    p.isFeatured(),
                    c == null ? null : c.getId(),
                    c == null ? null : c.getName()
            );
        }).toList();
    }

    @GetMapping("/products/{id}")
    public ProductResponse getProduct(@PathVariable UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.isDeleted() || !product.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }

        Category c = product.getCategory();
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPriceCents() == null ? 0 : product.getPriceCents(),
                product.getImageUrl(),
                product.isFeatured(),
                c == null ? null : c.getId(),
                c == null ? null : c.getName()
        );
    }
}
