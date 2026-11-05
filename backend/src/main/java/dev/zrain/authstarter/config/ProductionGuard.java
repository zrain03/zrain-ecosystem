/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/config/ProductionGuard.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menghalang konfigurasi pembangunan atau rahsia lemah daripada digunakan tanpa sengaja pada production.
 * EN: Prevents development settings or weak secrets from accidentally reaching production.
 */
package dev.zrain.authstarter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import jakarta.annotation.PostConstruct;

@Configuration
@Profile("prod")
// BM: ProductionGuard: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghalang konfigurasi pembangunan atau rahsia lemah daripada digunakan tanpa sengaja pada production.
// EN: ProductionGuard: Isolates one operation so it can be reviewed and tested. Module purpose: prevents development settings or weak secrets from accidentally reaching production.
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
    // BM: require: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghalang konfigurasi pembangunan atau rahsia lemah daripada digunakan tanpa sengaja pada production. Input: String name.
    // EN: require: Isolates one operation so it can be reviewed and tested. Module purpose: prevents development settings or weak secrets from accidentally reaching production. Inputs: String name.
    private void require(String name) {
        if (System.getenv(name) == null || System.getenv(name).isBlank())
            throw new IllegalStateException("Missing required production setting: " + name);
    }
}
