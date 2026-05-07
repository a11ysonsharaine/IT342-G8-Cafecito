package com.cafecito.cafecito.backend.features.menu;

import com.cafecito.cafecito.backend.config.security.JwtUtil;
import com.cafecito.cafecito.backend.core.base.UserRepository;
import com.cafecito.cafecito.backend.core.integrations.SupabaseStorageClient;
import com.cafecito.cafecito.backend.core.shared_models.User;
import com.cafecito.cafecito.backend.features.menu.model.Product;
import com.cafecito.cafecito.backend.features.menu.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MenuAdminImageUploadAuthTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ProductRepository productRepository;

    @MockitoBean
    SupabaseStorageClient storageClient;

    @Test
    void uploadImage_requiresAuth() throws Exception {
        UUID productId = seedProduct();

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "a.png",
                "image/png",
                new byte[]{1, 2, 3}
        );

        mockMvc.perform(
                        multipart("/api/admin/menu/products/{id}/image", productId)
                                .file(file)
                                .param("deleteOld", "true")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void uploadImage_withValidJwtAndAdmin_allowsUpload() throws Exception {
        UUID productId = seedProduct();
        seedAdmin("admin@example.com");

        String token = jwtUtil.generateToken("admin@example.com");

        when(storageClient.isConfigured()).thenReturn(true);
        doNothing().when(storageClient).upload(anyString(), anyString(), any(byte[].class), anyString(), anyBoolean());
        when(storageClient.publicUrl(anyString(), anyString())).thenReturn("https://example.test/product.png");
        when(storageClient.tryExtractPublicObjectKey(anyString(), anyString())).thenReturn(null);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "a.png",
                "image/png",
                new byte[]{1, 2, 3}
        );

        mockMvc.perform(
                        multipart("/api/admin/menu/products/{id}/image", productId)
                                .file(file)
                                .param("deleteOld", "true")
                                .header("Authorization", "Bearer " + token)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.imageUrl").value("https://example.test/product.png"));
    }

    private UUID seedProduct() {
        Product p = new Product();
        p.setName("Test Product");
        p.setDescription("Test");
        p.setPriceCents(100);
        p.setActive(true);
        p.setDeleted(false);
        return productRepository.save(p).getId();
    }

    private void seedAdmin(String email) {
        User u = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.setEmail(email);
        u.setRole("admin");
        // Password is irrelevant for JWT auth filter; set a placeholder.
        u.setPassword("{noop}x");
        userRepository.save(u);
    }
}
