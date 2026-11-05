/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/products/ProductInput.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memvalidasi data produk sebelum sistem menerima perubahan katalog.
 * EN: Validates product data before the catalogue accepts mutations.
 */
package dev.zrain.authstarter.products;

import jakarta.validation.constraints.*;
import java.net.URI;

// BM: ProductInput: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memvalidasi data produk sebelum sistem menerima perubahan katalog.
// EN: ProductInput: Isolates one operation so it can be reviewed and tested. Module purpose: validates product data before the catalogue accepts mutations.
public record ProductInput(
        @NotBlank @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") @Size(max = 80) String slug,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 300) String description,
        @NotNull Product.Category category,
        @NotBlank @Size(max = 500) String logoUrl,
        @NotNull Product.Action primaryAction,
        @NotBlank @Size(max = 50) String primaryLabel,
        @NotBlank @Size(max = 500) String primaryUrl,
        @Size(max = 50) String secondaryLabel,
        @Size(max = 500) String secondaryUrl,
        Integer sortOrder
) {
    // BM: safeUrl: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memvalidasi data produk sebelum sistem menerima perubahan katalog. Input: String raw.
    // EN: safeUrl: Isolates one operation so it can be reviewed and tested. Module purpose: validates product data before the catalogue accepts mutations. Inputs: String raw.
    static String safeUrl(String raw) {
        try {
            URI uri = URI.create(raw.strip());
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                    || uri.getUserInfo() != null || uri.getPort() != -1)
                throw new IllegalArgumentException("Use a valid HTTPS URL without credentials or custom port.");
            return uri.toString();
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Use a valid HTTPS destination URL.");
        }
    }
    // BM: safeLogo: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memvalidasi data produk sebelum sistem menerima perubahan katalog. Input: String raw.
    // EN: safeLogo: Isolates one operation so it can be reviewed and tested. Module purpose: validates product data before the catalogue accepts mutations. Inputs: String raw.
    static String safeLogo(String raw) {
        String value = raw.strip();
        if (value.startsWith("/") && !value.startsWith("//") && !value.contains("..") &&
                value.matches("/[a-zA-Z0-9_./-]+")) return value;
        return safeUrl(value);
    }
}
