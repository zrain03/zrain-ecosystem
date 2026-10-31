package dev.zrain.authstarter.products;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, UUID id);
    List<Product> findAllByOrderBySortOrderAscNameAsc();
    List<Product> findByStatusOrderBySortOrderAscNameAsc(Product.Status status);
}
