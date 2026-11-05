/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/config/AdminBootstrap.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan bootstrap pentadbir terkawal bagi persekitaran yang telah dikonfigurasi.
 * EN: Performs controlled administrator bootstrap in properly configured environments.
 */
package dev.zrain.authstarter.config;

import dev.zrain.authstarter.user.AppUser;
import dev.zrain.authstarter.user.Role;
import dev.zrain.authstarter.user.UserRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
// BM: AdminBootstrap: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan bootstrap pentadbir terkawal bagi persekitaran yang telah dikonfigurasi.
// EN: AdminBootstrap: Isolates one operation so it can be reviewed and tested. Module purpose: performs controlled administrator bootstrap in properly configured environments.
public class AdminBootstrap {
    @Bean
    ApplicationRunner provisionAdmin(UserRepository users, PasswordEncoder encoder,
                                     @Value("${zrain.admin.email:}") String email,
                                     @Value("${zrain.admin.password:}") String password) {
        return args -> {
            // Provision exactly one account when explicitly configured. Never open public registration.
            if (email.isBlank() || password.isBlank()) return;
            if (password.length() < 16) throw new IllegalStateException("Admin password must have 16+ characters");
            String normalized = email.trim().toLowerCase(Locale.ROOT);
            if (users.existsByEmail(normalized)) return;
            users.saveAndFlush(new AppUser(normalized, encoder.encode(password), Role.ADMIN));
        };
    }
}
