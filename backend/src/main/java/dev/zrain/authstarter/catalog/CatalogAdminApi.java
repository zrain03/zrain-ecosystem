package dev.zrain.authstarter.catalog;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;

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

    @PostMapping("/logo")
    public CatalogPublisher.UploadResult logo(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a logo image.");
        if (file.getSize() > 2_000_000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Logo must be under 2 MB.");
        try { return publisher.upload(file.getBytes(), file.getContentType()); }
        catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read logo.");
        }
    }
}
