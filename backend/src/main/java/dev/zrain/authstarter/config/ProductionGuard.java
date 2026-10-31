package dev.zrain.authstarter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import jakarta.annotation.PostConstruct;

@Configuration
@Profile("prod")
public class ProductionGuard {
    @PostConstruct
    public void checkProductionConfiguration() {
        for (String name : new String[]{
                "JDBC_DATABASE_URL", "JDBC_DATABASE_USERNAME", "JDBC_DATABASE_PASSWORD",
                "ZRAIN_JWT_SECRET_BASE64", "ZRAIN_ADMIN_EMAIL", "ZRAIN_ADMIN_PASSWORD",
                "ZRAIN_CATALOG_WORKER_URL", "ZRAIN_CATALOG_PUBLISH_KEY"}) {
            require(name);
        }
        if (!System.getenv("JDBC_DATABASE_URL").startsWith("jdbc:postgresql:"))
            throw new IllegalStateException("Production only supports PostgreSQL");
        if (System.getenv("ZRAIN_CATALOG_PUBLISH_KEY").length() < 32)
            throw new IllegalStateException("Catalog secret too short");
        if (System.getenv("ZRAIN_ADMIN_PASSWORD").length() < 16)
            throw new IllegalStateException("Admin password too short");
    }
    private void require(String name) {
        if (System.getenv(name) == null || System.getenv(name).isBlank())
            throw new IllegalStateException("Missing required production setting: " + name);
    }
}
