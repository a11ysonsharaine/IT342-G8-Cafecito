package com.cafecito.cafecito.backend.core.integrations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class SupabaseStorageClient {

    private final HttpClient httpClient;
    private final String supabaseUrl;
    private final String serviceRoleKey;

    public SupabaseStorageClient(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.serviceRoleKey:}") String serviceRoleKey
    ) {
        this.supabaseUrl = trimTrailingSlash(supabaseUrl);
        this.serviceRoleKey = serviceRoleKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public String publicUrl(String bucket, String objectKey) {
        requireConfigured();
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalArgumentException("bucket is required");
        }
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey is required");
        }

        String encodedKey = encodePath(objectKey);
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + encodedKey;
    }

    /**
     * Attempts to extract the raw object key from a public URL.
     * Returns null if the URL doesn't match this project's configured Supabase URL + bucket.
     */
    public String tryExtractPublicObjectKey(String publicUrl, String bucket) {
        requireConfigured();
        if (publicUrl == null || publicUrl.isBlank()) return null;
        if (bucket == null || bucket.isBlank()) return null;

        String url = publicUrl.trim();
        int q = url.indexOf('?');
        if (q >= 0) {
            url = url.substring(0, q);
        }

        String prefix = supabaseUrl + "/storage/v1/object/public/" + bucket + "/";
        if (!url.startsWith(prefix)) return null;

        String encodedKey = url.substring(prefix.length());
        if (encodedKey.isBlank()) return null;

        return Arrays.stream(encodedKey.split("/"))
                .map(segment -> URLDecoder.decode(segment, StandardCharsets.UTF_8))
                .collect(Collectors.joining("/"));
    }

    public void upload(String bucket, String objectKey, byte[] bytes, String contentType, boolean upsert) {
        requireConfigured();
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalArgumentException("bucket is required");
        }
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey is required");
        }
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("bytes is required");
        }

        String encodedKey = encodePath(objectKey);
        String url = supabaseUrl + "/storage/v1/object/" + bucket + "/" + encodedKey;

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("apikey", serviceRoleKey)
                .header("x-upsert", upsert ? "true" : "false")
                .header("Content-Type", contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType)
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new IllegalStateException("Supabase Storage upload failed: HTTP " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Supabase Storage upload failed", e);
        }
    }

    public void delete(String bucket, String objectKey) {
        requireConfigured();
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalArgumentException("bucket is required");
        }
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey is required");
        }

        String encodedKey = encodePath(objectKey);
        String url = supabaseUrl + "/storage/v1/object/" + bucket + "/" + encodedKey;

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("apikey", serviceRoleKey)
                .DELETE()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new IllegalStateException("Supabase Storage delete failed: HTTP " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Supabase Storage delete failed", e);
        }
    }

    public boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.isBlank()
                && serviceRoleKey != null && !serviceRoleKey.isBlank();
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new IllegalStateException("Supabase Storage is not configured. Set supabase.url and supabase.serviceRoleKey.");
        }
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) return "";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static String encodePath(String path) {
        // Supabase Storage object keys are paths; encode each segment but keep '/'
        return Arrays.stream(path.split("/"))
                .map(segment -> URLEncoder.encode(segment, StandardCharsets.UTF_8))
                .collect(Collectors.joining("/"));
    }
}
