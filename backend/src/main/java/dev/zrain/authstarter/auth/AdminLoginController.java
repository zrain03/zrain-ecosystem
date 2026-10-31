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
public class AdminLoginController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService tokens;
    private final LoginThrottle throttle;

    public AdminLoginController(UserRepository users, PasswordEncoder encoder, JwtService tokens, LoginThrottle throttle) {
        this.users = users;
        this.encoder = encoder;
        this.tokens = tokens;
        this.throttle = throttle;
    }

    @PostMapping("/login")
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

    public record AdminIdentity(String id, String email, String role) {}
}
