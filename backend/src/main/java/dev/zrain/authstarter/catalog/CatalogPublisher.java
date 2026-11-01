package dev.zrain.authstarter.catalog;

import dev.zrain.authstarter.products.Product;
import dev.zrain.authstarter.products.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;
import java.time.Duration;

@Service
public class CatalogPublisher {
    private final ProductRepository products;
    private final JsonMapper json;
    private final URI worker;
    private final String key;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NEVER).build();

    public CatalogPublisher(ProductRepository products, JsonMapper json,
            @Value("${zrain.catalog.worker-url:}") String workerUrl,
            @Value("${zrain.catalog.publish-key:}") String publishKey) {
        this.products = products;
        this.json = json;
        this.key = publishKey;
        this.worker = parseWorkerUrl(workerUrl);
    }

    private static URI parseWorkerUrl(String value) {
        if (value == null || value.isBlank()) return null;
        URI uri = URI.create(value.strip().replaceAll("/+$", ""));
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null ||
                uri.getPort() != -1 || uri.getUserInfo() != null ||
                uri.getRawQuery() != null || uri.getFragment() != null || !uri.getPath().isEmpty())
            throw new IllegalStateException("Catalog worker URL must be an HTTPS origin");
        return uri;
    }

    public boolean configured() { return worker != null && key != null && key.length() >= 32; }
    private void ensureReady() {
        if (!configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Catalog publishing is not configured yet.");
    }
    private HttpRequest.Builder request(String path) {
        ensureReady();
        return HttpRequest.newBuilder(worker.resolve(path))
                .timeout(Duration.ofSeconds(17))
                .header("Authorization", "Bearer " + key);
    }

    public record PublicProduct(String slug, String name, String description, String category,
            String logoUrl, String primaryAction, String primaryLabel, String primaryUrl,
            String secondaryLabel, String secondaryUrl, int sortOrder, String status) {
        static PublicProduct from(Product p) {
            return new PublicProduct(p.getSlug(), p.getName(), p.getDescription(),
                    p.getCategory().name(), p.getLogoUrl(), p.getPrimaryAction().name(),
                    p.getPrimaryLabel(), p.getPrimaryUrl(), p.getSecondaryLabel(), p.getSecondaryUrl(),
                    p.getSortOrder(), p.getStatus().name());
        }
    }
    public record SyncResult(int published, boolean success) {}

    public SyncResult publish() {
        var published = products.findByStatusOrderBySortOrderAscNameAsc(Product.Status.PUBLISHED)
                .stream().map(PublicProduct::from).toList();
        String data = json.writeValueAsString(published);
        HttpRequest req = request("/api/catalog")
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(data)).build();
        send(req);
        return new SyncResult(published.size(), true);
    }

    private String send(HttpRequest request) {
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300)
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Catalog storage rejected the operation. Try again from Admin.");
            return response.body();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Catalog request interrupted.");
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Catalog storage could not be reached. Retry the publish step.");
        }
    }
}
