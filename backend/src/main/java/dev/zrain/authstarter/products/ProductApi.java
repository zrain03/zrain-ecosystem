package dev.zrain.authstarter.products;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ProductApi {
    private final ProductRepository products;
    public ProductApi(ProductRepository products) { this.products = products; }

    @GetMapping("/api/products")
    public List<Product> publicCatalog() {
        return products.findByStatusOrderBySortOrderAscNameAsc(Product.Status.PUBLISHED);
    }
    @GetMapping("/api/admin/products")
    public List<Product> adminList() {
        return products.findAllByOrderBySortOrderAscNameAsc();
    }
    @PostMapping("/api/admin/products")
    public Product add(@Valid @RequestBody ProductInput input) {
        if (products.existsBySlug(input.slug())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug is already in use.");
        Product product = new Product(input);
        // Position numbers are internal only. New products appear after existing products in their category.
        product.setSortOrder(nextPosition(input.category()));
        return products.saveAndFlush(product);
    }
    private int nextPosition(Product.Category category) {
        return products.findAllByOrderBySortOrderAscNameAsc().stream()
                .filter(p -> p.getCategory() == category && p.getStatus() != Product.Status.ARCHIVED)
                .mapToInt(Product::getSortOrder).max().orElse(0) + 10;
    }

    public record ImportResult(int added, int skipped, int totalAvailable) {}

    @Transactional
    @PostMapping("/api/admin/products/import-existing")
    public ImportResult importExisting() {
        int created = 0;
        for (ProductInput input : ExistingProducts.all()) {
            if (products.existsBySlug(input.slug())) continue;
            products.save(new Product(input)); // DRAFT; never publish automatically.
            created++;
        }
        return new ImportResult(created, ExistingProducts.all().size() - created, ExistingProducts.all().size());
    }

    @PutMapping("/api/admin/products/{id}")
    public Product edit(@PathVariable UUID id, @Valid @RequestBody ProductInput input) {
        if (products.existsBySlugAndIdNot(input.slug(), id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug is already in use.");
        Product product = require(id);
        int newPosition = product.getCategory() == input.category() ? product.getSortOrder()
                : nextPosition(input.category());
        product.update(input);
        product.setSortOrder(newPosition);
        return products.saveAndFlush(product);
    }
    @PostMapping("/api/admin/products/{id}/publish")
    public Product publish(@PathVariable UUID id) { return status(id, Product.Status.PUBLISHED); }
    @PostMapping("/api/admin/products/{id}/unpublish")
    public Product unpublish(@PathVariable UUID id) { return status(id, Product.Status.DRAFT); }
    @PostMapping("/api/admin/products/{id}/archive")
    public Product archive(@PathVariable UUID id) { return status(id, Product.Status.ARCHIVED); }

    private Product status(UUID id, Product.Status state) {
        Product product = require(id);
        product.setStatus(state);
        return products.saveAndFlush(product);
    }
    private Product require(UUID id) {
        return products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));
    }
}
