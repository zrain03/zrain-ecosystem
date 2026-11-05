/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/products/Product.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan.
 * EN: Models persisted products, categories, actions and Published/Draft state.
 */
package dev.zrain.authstarter.products;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "products")
// BM: Product: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan.
// EN: Product: Isolates one operation so it can be reviewed and tested. Module purpose: models persisted products, categories, actions and Published/Draft state.
public class Product {
    public enum Category { GAMES, DEVELOPER_TOOLS, ONLINE_SERVICES, WEB_UTILITIES }
    public enum Action { CONSOLE, WEBSITE, GITHUB, PLAY_STORE, DOCUMENTATION, SHOWCASE }
    public enum Status { DRAFT, PUBLISHED, ARCHIVED }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true, length = 80)
    private String slug;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, length = 300)
    private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30)
    private Category category;
    @Column(name = "logo_url", nullable = false, length = 500)
    private String logoUrl;
    @Enumerated(EnumType.STRING) @Column(name = "primary_action", nullable = false, length = 30)
    private Action primaryAction;
    @Column(name = "primary_label", nullable = false, length = 50)
    private String primaryLabel;
    @Column(name = "primary_url", nullable = false, length = 500)
    private String primaryUrl;
    @Column(name = "secondary_label", length = 50)
    private String secondaryLabel;
    @Column(name = "secondary_url", length = 500)
    private String secondaryUrl;
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Status status = Status.DRAFT;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // BM: Product: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan.
    // EN: Product: Isolates one operation so it can be reviewed and tested. Module purpose: models persisted products, categories, actions and Published/Draft state.
    protected Product() {}
    public Product(ProductInput input) {
        status = Status.DRAFT;
        createdAt = Instant.now();
        update(input);
        this.sortOrder = input.sortOrder() == null ? 0 : input.sortOrder();
    }
    // BM: update: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan. Input: ProductInput input.
    // EN: update: Mutates relevant state only after input and access conditions are verified. Module purpose: models persisted products, categories, actions and Published/Draft state. Inputs: ProductInput input.
    public void update(ProductInput input) {
        this.slug = input.slug().strip();
        this.name = input.name().strip();
        this.description = input.description().strip();
        this.category = input.category();
        this.logoUrl = ProductInput.safeLogo(input.logoUrl());
        this.primaryAction = input.primaryAction();
        this.primaryLabel = input.primaryLabel().strip();
        this.primaryUrl = ProductInput.safeUrl(input.primaryUrl());
        this.secondaryLabel = input.secondaryLabel() == null || input.secondaryLabel().isBlank() ? null : input.secondaryLabel().strip();
        this.secondaryUrl = input.secondaryUrl() == null || input.secondaryUrl().isBlank() ? null : ProductInput.safeUrl(input.secondaryUrl());
        if ((secondaryLabel == null) != (secondaryUrl == null)) throw new IllegalArgumentException("Secondary label and URL must both be supplied.");
        this.updatedAt = Instant.now();
    }
    // BM: getId: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan.
    // EN: getId: Reads relevant records and returns a bounded result to the caller. Module purpose: models persisted products, categories, actions and Published/Draft state.
    public UUID getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Category getCategory() { return category; }
    public String getLogoUrl() { return logoUrl; }
    // BM: getPrimaryAction: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan.
    // EN: getPrimaryAction: Reads relevant records and returns a bounded result to the caller. Module purpose: models persisted products, categories, actions and Published/Draft state.
    public Action getPrimaryAction() { return primaryAction; }
    public String getPrimaryLabel() { return primaryLabel; }
    public String getPrimaryUrl() { return primaryUrl; }
    public String getSecondaryLabel() { return secondaryLabel; }
    public String getSecondaryUrl() { return secondaryUrl; }
    public int getSortOrder() { return sortOrder; }
    // BM: setSortOrder: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mewakili produk, kategori, aksi dan status Published/Draft sebagai entiti tersimpan. Input: int order.
    // EN: setSortOrder: Isolates one operation so it can be reviewed and tested. Module purpose: models persisted products, categories, actions and Published/Draft state. Inputs: int order.
    public void setSortOrder(int order) { this.sortOrder = order; this.updatedAt = Instant.now(); }
    public Status getStatus() { return status; }
    public void setStatus(Status value) { status = value; updatedAt = Instant.now(); }
}
