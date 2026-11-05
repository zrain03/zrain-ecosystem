/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/catalog/CatalogAdminApi.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengendalikan tindakan katalog terhad pentadbir dan mengesahkan autorisasi sebelum perubahan disimpan.
 * EN: Handles privileged catalogue mutations and verifies authorization before persisting changes.
 */
package dev.zrain.authstarter.catalog;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/catalog")
// BM: CatalogAdminApi: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengendalikan tindakan katalog terhad pentadbir dan mengesahkan autorisasi sebelum perubahan disimpan.
// EN: CatalogAdminApi: Isolates one operation so it can be reviewed and tested. Module purpose: handles privileged catalogue mutations and verifies authorization before persisting changes.
public class CatalogAdminApi {
    private final CatalogPublisher publisher;
    public CatalogAdminApi(CatalogPublisher publisher) { this.publisher = publisher; }

    @GetMapping("/status")
    public CatalogStatus status() { return new CatalogStatus(publisher.configured()); }
    // BM: CatalogStatus: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengendalikan tindakan katalog terhad pentadbir dan mengesahkan autorisasi sebelum perubahan disimpan.
    // EN: CatalogStatus: Isolates one operation so it can be reviewed and tested. Module purpose: handles privileged catalogue mutations and verifies authorization before persisting changes.
    public record CatalogStatus(boolean configured) {}

    @PostMapping("/sync")
    public CatalogPublisher.SyncResult sync() { return publisher.publish(); }

}
