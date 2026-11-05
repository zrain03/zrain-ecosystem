/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/AuthStarterApplication.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memulakan Spring Boot dan pemuatan konfigurasi backend katalog yang dilindungi.
 * EN: Bootstraps Spring Boot and loads configuration for the protected catalogue backend.
 */
package dev.zrain.authstarter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
// BM: AuthStarterApplication: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memulakan Spring Boot dan pemuatan konfigurasi backend katalog yang dilindungi.
// EN: AuthStarterApplication: Isolates one operation so it can be reviewed and tested. Module purpose: bootstraps Spring Boot and loads configuration for the protected catalogue backend.
public class AuthStarterApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthStarterApplication.class, args);
    }
}
