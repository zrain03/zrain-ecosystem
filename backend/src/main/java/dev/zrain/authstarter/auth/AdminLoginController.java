/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/auth/AdminLoginController.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memproses login pentadbir sahaja dan mendelegasikan pengesahan kata laluan kepada servis selamat.
 * EN: Handles administrator-only login and delegates password verification to secured services.
 */
package dev.zrain.authstarter.auth;

import dev.zrain.authstarter.auth.dto.LoginRequest;
import dev.zrain.authstarter.auth.dto.TokenResponse;
import dev.zrain.authstarter.user.Role;
import dev.zrain.authstarter.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/auth")
// BM: AdminLoginController: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memproses login pentadbir sahaja dan mendelegasikan pengesahan kata laluan kepada servis selamat.
// EN: AdminLoginController: Isolates one operation so it can be reviewed and tested. Module purpose: handles administrator-only login and delegates password verification to secured services.
public class AdminLoginController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService tokens;
    private final LoginThrottle throttle;

    // BM: AdminLoginController: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memproses login pentadbir sahaja dan mendelegasikan pengesahan kata laluan kepada servis selamat. Input: UserRepository users, PasswordEncoder encoder, JwtService tokens, LoginThrottle th....
    // EN: AdminLoginController: Isolates one operation so it can be reviewed and tested. Module purpose: handles administrator-only login and delegates password verification to secured services. Inputs: UserRepository users, PasswordEncoder encoder, JwtService tokens, LoginThrottle th....
    public AdminLoginController(UserRepository users, PasswordEncoder encoder, JwtService tokens, LoginThrottle throttle) {
        this.users = users;
        this.encoder = encoder;
        this.tokens = tokens;
        this.throttle = throttle;
    }

    @PostMapping("/login")
    // BM: login: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memproses login pentadbir sahaja dan mendelegasikan pengesahan kata laluan kepada servis selamat. Input: @Valid @RequestBody LoginRequest form, HttpServletRequest request.
    // EN: login: Isolates one operation so it can be reviewed and tested. Module purpose: handles administrator-only login and delegates password verification to secured services. Inputs: @Valid @RequestBody LoginRequest form, HttpServletRequest request.
    public TokenResponse login(@Valid @RequestBody LoginRequest form, HttpServletRequest request) {
        String email = form.email().trim().toLowerCase(Locale.ROOT);
        String key = request.getRemoteAddr() + ":" + email;
        if (!throttle.allowed(key)) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Try again later");
        var user = users.findByEmail(email).orElse(null);
        if (user == null || user.getRole() != Role.ADMIN || !encoder.matches(form.password(), user.getPasswordHash())) {
            throttle.recordFailure(key);
            throw new BadCredentialsException("Invalid email or password");
        }
        throttle.clear(key);
        return tokens.generateAccessToken(user);
    }

    @GetMapping("/me")
    public AdminIdentity me(@org.springframework.security.core.annotation.AuthenticationPrincipal
                            org.springframework.security.oauth2.jwt.Jwt jwt) {
        return users.findById(java.util.UUID.fromString(jwt.getSubject()))
                .filter(user -> user.getRole() == Role.ADMIN)
                .map(user -> new AdminIdentity(user.getId().toString(), user.getEmail(), "ADMIN"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized"));
    }

    // BM: AdminIdentity: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memproses login pentadbir sahaja dan mendelegasikan pengesahan kata laluan kepada servis selamat.
    // EN: AdminIdentity: Isolates one operation so it can be reviewed and tested. Module purpose: handles administrator-only login and delegates password verification to secured services.
    public record AdminIdentity(String id, String email, String role) {}
}
