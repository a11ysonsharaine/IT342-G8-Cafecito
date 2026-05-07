package com.cafecito.cafecito.backend.features.menu.controller;

import com.cafecito.cafecito.backend.core.base.UserRepository;
import com.cafecito.cafecito.backend.core.integrations.SupabaseStorageClient;
import com.cafecito.cafecito.backend.core.utils.FileValidationUtil;
import com.cafecito.cafecito.backend.features.menu.dto.ProductAdminResponse;
import com.cafecito.cafecito.backend.features.menu.dto.ProductUpsertRequest;
import com.cafecito.cafecito.backend.features.menu.model.Category;
import com.cafecito.cafecito.backend.features.menu.model.Product;
import com.cafecito.cafecito.backend.features.menu.repository.CategoryRepository;
import com.cafecito.cafecito.backend.features.menu.repository.ProductRepository;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/menu")
public class MenuAdminController {

    private static final String PRODUCT_IMAGES_BUCKET = "product-images";
    private static final long PRODUCT_IMAGE_MAX_BYTES = 2L * 1024 * 1024; // 2MB

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageClient storageClient;
    private final Path uploadRoot;

    public MenuAdminController(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            SupabaseStorageClient storageClient,
            @Value("${cafecito.uploadDir:./uploads}") String uploadDir
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.storageClient = storageClient;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @GetMapping("/products")
    public List<ProductAdminResponse> listProducts() {
        requireAdmin();

        return productRepository.findAllByIsDeletedFalseOrderByNameAsc().stream().map(this::toAdminResponse).toList();
    }

    @PostMapping("/products")
    public ProductAdminResponse createProduct(@RequestBody ProductUpsertRequest request) {
        requireAdmin();

        Product product = new Product();
        applyUpsert(product, request, true);
        Product saved = productRepository.save(product);
        return toAdminResponse(saved);
    }

    @PutMapping("/products/{id}")
    public ProductAdminResponse updateProduct(@PathVariable UUID id, @RequestBody ProductUpsertRequest request) {
        requireAdmin();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        applyUpsert(product, request, false);
        Product saved = productRepository.save(product);
        return toAdminResponse(saved);
    }

    @PostMapping(value = "/products/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductAdminResponse uploadProductImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "deleteOld", defaultValue = "false") boolean deleteOld,
            HttpServletRequest httpRequest
    ) {
        requireAdmin();

        String validationError = FileValidationUtil.validateImageFile(file, PRODUCT_IMAGE_MAX_BYTES);
        if (validationError != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, validationError);
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        String oldUrl = product.getImageUrl();
        String objectKey = buildObjectKey(product.getName(), file.getContentType());

        String publicUrl;
        try {
            if (storageClient.isConfigured()) {
                try {
                    storageClient.upload(PRODUCT_IMAGES_BUCKET, objectKey, file.getBytes(), file.getContentType(), false);
                    publicUrl = storageClient.publicUrl(PRODUCT_IMAGES_BUCKET, objectKey);
                } catch (Exception supabaseError) {
                    // If Supabase is misconfigured or temporarily unavailable during local dev,
                    // fall back to local file storage so admin uploads still work.
                    publicUrl = uploadLocal(httpRequest, PRODUCT_IMAGES_BUCKET, objectKey, file);
                }
            } else {
                publicUrl = uploadLocal(httpRequest, PRODUCT_IMAGES_BUCKET, objectKey, file);
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to upload image", e);
        }

        product.setImageUrl(publicUrl);
        Product saved = productRepository.save(product);

        if (deleteOld) {
            String oldKey = null;
            boolean oldKeyIsLocal = false;
            try {
                if (storageClient.isConfigured()) {
                    oldKey = storageClient.tryExtractPublicObjectKey(oldUrl, PRODUCT_IMAGES_BUCKET);
                }
            } catch (Exception ignored) {
                oldKey = null;
            }

            if (oldKey == null) {
                oldKey = tryExtractLocalObjectKey(oldUrl, PRODUCT_IMAGES_BUCKET);
                oldKeyIsLocal = oldKey != null;
            }

            if (oldKey != null && !oldKey.isBlank() && !oldKey.equals(objectKey)) {
                if (storageClient.isConfigured() && !oldKeyIsLocal) {
                    try {
                        storageClient.delete(PRODUCT_IMAGES_BUCKET, oldKey);
                    } catch (Exception e) {
                        // Best-effort cleanup; don't fail the request if deletion fails.
                    }
                } else {
                    try {
                        deleteLocal(PRODUCT_IMAGES_BUCKET, oldKey);
                    } catch (Exception e) {
                        // Best-effort cleanup
                    }
                }
            }
        }

        return toAdminResponse(saved);
    }

    private String uploadLocal(HttpServletRequest request, String bucket, String objectKey, MultipartFile file) throws Exception {
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalArgumentException("bucket is required");
        }
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey is required");
        }

        Path target = uploadRoot.resolve(bucket).resolve(objectKey).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new IllegalStateException("Invalid upload path");
        }

        Files.createDirectories(target.getParent());
        Files.write(target, file.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String encodedKey = encodePath(objectKey);
        return baseUrl + "/uploads/" + bucket + "/" + encodedKey;
    }

    private void deleteLocal(String bucket, String objectKey) throws Exception {
        Path target = uploadRoot.resolve(bucket).resolve(objectKey).normalize();
        if (!target.startsWith(uploadRoot)) {
            return;
        }
        Files.deleteIfExists(target);
    }

    private static String tryExtractLocalObjectKey(String publicUrl, String bucket) {
        if (publicUrl == null || publicUrl.isBlank()) return null;
        if (bucket == null || bucket.isBlank()) return null;

        try {
            URI uri = URI.create(publicUrl.trim());
            String path = uri.getPath();
            if (path == null) return null;
            String prefix = "/uploads/" + bucket + "/";
            int idx = path.indexOf(prefix);
            if (idx < 0) return null;
            String encodedKey = path.substring(idx + prefix.length());
            if (encodedKey.isBlank()) return null;
            return Arrays.stream(encodedKey.split("/"))
                    .map(seg -> URLDecoder.decode(seg, StandardCharsets.UTF_8))
                    .collect(Collectors.joining("/"));
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String encodePath(String path) {
        return Arrays.stream(path.split("/"))
                .map(segment -> URLEncoder.encode(segment, StandardCharsets.UTF_8))
                .collect(Collectors.joining("/"));
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable UUID id) {
        requireAdmin();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // Soft-delete marker so disable/enable remains distinct from delete.
        product.setActive(false);
        product.setDeleted(true);
        productRepository.save(product);
    }

    private void applyUpsert(Product product, ProductUpsertRequest request, boolean creating) {
        requireRequestBody(request);

        applyName(product, request, creating);
        applyPrice(product, request, creating);
        applyDescription(product, request);
        applyImageUrl(product, request);
        applyFeatured(product, request);
        applyActive(product, request, creating);
        applyCategory(product, request, creating);
    }

    private void requireRequestBody(ProductUpsertRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body required");
        }
    }

    private void applyName(Product product, ProductUpsertRequest request, boolean creating) {
        if (!creating && request.getName() == null) return;

        String name = request.getName() == null ? null : request.getName().trim();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        product.setName(name);
    }

    private void applyPrice(Product product, ProductUpsertRequest request, boolean creating) {
        if (!creating && request.getPriceCents() == null) return;

        Integer price = request.getPriceCents();
        if (price == null || price < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceCents must be >= 0");
        }
        product.setPriceCents(price);
    }

    private void applyDescription(Product product, ProductUpsertRequest request) {
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
    }

    private void applyImageUrl(Product product, ProductUpsertRequest request) {
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
    }

    private void applyFeatured(Product product, ProductUpsertRequest request) {
        if (request.getFeatured() != null) {
            product.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        }
    }

    private void applyActive(Product product, ProductUpsertRequest request, boolean creating) {
        if (request.getActive() != null) {
            product.setActive(Boolean.TRUE.equals(request.getActive()));
            return;
        }

        if (creating) {
            product.setActive(true);
        }
    }

    private void applyCategory(Product product, ProductUpsertRequest request, boolean creating) {
        if (!creating && request.getCategoryName() == null) return;

        String categoryName = request.getCategoryName() == null ? null : request.getCategoryName().trim();
        if (categoryName == null || categoryName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "categoryName is required");
        }

        Category category = categoryRepository.findByNameIgnoreCase(categoryName)
                .orElseGet(() -> categoryRepository.save(new Category(null, categoryName, null, null)));
        product.setCategory(category);
    }

    private ProductAdminResponse toAdminResponse(Product p) {
        Category c = p.getCategory();
        return new ProductAdminResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPriceCents() == null ? 0 : p.getPriceCents(),
                p.getImageUrl(),
                p.isFeatured(),
                c == null ? null : c.getId(),
                c == null ? null : c.getName(),
                p.isActive()
        );
    }

    private static String buildObjectKey(String productName, String contentType) {
        String slug = slugify(productName);
        String ext = fileExtensionFromContentType(contentType);
        long ts = System.currentTimeMillis();
        return "products/" + slug + "-" + ts + ext;
    }

    private static String fileExtensionFromContentType(String contentType) {
        if (contentType == null) return ".bin";
        String ct = contentType.trim().toLowerCase();
        if (ct.equals("image/png")) return ".png";
        if (ct.equals("image/jpeg") || ct.equals("image/jpg")) return ".jpg";
        return ".bin";
    }

    private static String slugify(String input) {
        if (input == null) return "product";
        String cleaned = input.trim().toLowerCase();
        cleaned = cleaned.replaceAll("[^a-z0-9]+", "-");
        cleaned = cleaned.replaceAll("-+", "-");
        cleaned = cleaned.replaceAll("(^-)|(-$)", "");
        return cleaned.isBlank() ? "product" : cleaned;
    }

    private void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        var user = userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        String role = user == null || user.getRole() == null ? "" : user.getRole().trim().toLowerCase();
        if (!"admin".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
