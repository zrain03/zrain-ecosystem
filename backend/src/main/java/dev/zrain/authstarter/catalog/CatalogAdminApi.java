package dev.zrain.authstarter.catalog;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/catalog")
public class CatalogAdminApi {
    private final CatalogPublisher publisher;
    public CatalogAdminApi(CatalogPublisher publisher) { this.publisher = publisher; }

    @GetMapping("/status")
    public CatalogStatus status() { return new CatalogStatus(publisher.configured()); }
    public record CatalogStatus(boolean configured) {}

    @PostMapping("/sync")
    public CatalogPublisher.SyncResult sync() { return publisher.publish(); }

}
