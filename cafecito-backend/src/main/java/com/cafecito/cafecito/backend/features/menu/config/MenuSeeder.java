package com.cafecito.cafecito.backend.features.menu.config;

import com.cafecito.cafecito.backend.features.menu.model.Category;
import com.cafecito.cafecito.backend.features.menu.model.Product;
import com.cafecito.cafecito.backend.features.menu.repository.CategoryRepository;
import com.cafecito.cafecito.backend.features.menu.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
public class MenuSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MenuSeeder.class);
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public MenuSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        try {
            long existing = productRepository.count();
            if (existing > 0) {
                log.info("MenuSeeder: skipping (products already exist: {})", existing);
                return;
            }
            log.info("MenuSeeder: seeding default menu items...");
            Category hotCoffee = ensureCategory("Hot Coffee");
            Category icedCoffee = ensureCategory("Iced Coffee");
            ensureCategory("Specialty");
            ensureCategory("Frappe");
            ensureCategory("Non-Coffee");
            List<Product> seed = List.of(
                newProduct(hotCoffee, "Caffe Latte", "Smooth espresso with steamed milk", 150, null, false, true),
                newProduct(hotCoffee, "Americano", "Espresso shots topped with hot water", 150, null, false, true),
                newProduct(hotCoffee, "Caffe Mocha", "Espresso, chocolate, and steamed milk", 150, null, true, true),
                newProduct(hotCoffee, "Flat White", "Velvety microfoam over espresso", 150, null, false, true),
                newProduct(hotCoffee, "Hot Matcha Latte", "Premium matcha green tea with steamed milk", 150, null, false, true),
                newProduct(icedCoffee, "Iced Latte", "Chilled espresso with cold milk", 180, null, true, true),
                newProduct(icedCoffee, "Iced Americano", "Espresso shots over ice with cold water", 180, null, false, true),
                newProduct(icedCoffee, "Iced Caramel", "Sweet caramel blended with espresso and ice", 180, null, false, true),
                newProduct(icedCoffee, "Iced Spanish Latte", "Sweetened condensed milk with espresso over ice", 180, null, false, true),
                newProduct(icedCoffee, "Iced Matcha Latte", "Refreshing matcha green tea with cold milk", 180, null, false, true)
            );
            productRepository.saveAll(seed);
            log.info("MenuSeeder: seeded {} products", seed.size());
        } catch (Exception e) {
            log.warn("MenuSeeder: skipped - {}", e.getMessage());
        }
    }

    private Category ensureCategory(String name) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> categoryRepository.save(new Category(null, name, null, null)));
    }

    private Product newProduct(Category category, String name, String description,
                               int price, String imageUrl, boolean featured, boolean active) {
        Product product = new Product();
        product.setCategory(category);
        product.setName(name);
        product.setDescription(description);
        product.setPriceCents(price);
        product.setImageUrl(imageUrl);
        product.setFeatured(featured);
        product.setActive(active);
        return product;
    }
}
