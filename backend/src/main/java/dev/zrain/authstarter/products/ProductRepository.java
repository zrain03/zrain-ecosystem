/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/products/ProductRepository.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan carian pangkalan data produk termasuk urutan dan keunikan.
 * EN: Provides product persistence queries including ordering and uniqueness.
 */
package dev.zrain.authstarter.products;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

// BM: ProductRepository: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan carian pangkalan data produk termasuk urutan dan keunikan.
// EN: ProductRepository: Isolates one operation so it can be reviewed and tested. Module purpose: provides product persistence queries including ordering and uniqueness.
public interface ProductRepository extends JpaRepository<Product, UUID> {
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, UUID id);
    List<Product> findAllByOrderBySortOrderAscNameAsc();
    List<Product> findByStatusOrderBySortOrderAscNameAsc(Product.Status status);
}
