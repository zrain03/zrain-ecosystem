package dev.zrain.authstarter.config;

import dev.zrain.authstarter.user.Role;
import dev.zrain.authstarter.user.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, UserRepository users,
                                            @Value("${zrain.allowed-origin}") String allowedOrigin) throws Exception {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        // IMPORTANT: Look up the current account on each request, never trust stale ADMIN role claims alone.
        jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            try {
                UUID id = UUID.fromString(jwt.getSubject());
                return users.findById(id).filter(user -> user.getRole() == Role.ADMIN)
                        .map(user -> List.<org.springframework.security.core.GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .orElseGet(List::of);
            } catch (IllegalArgumentException ex) {
                return List.of();
            }
        });

        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(allowedOrigin));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);

        return http
                .csrf(AbstractHttpConfigurer::disable) // Bearer token in memory, never cookie-based auth.
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(c -> c.configurationSource(source))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.POST, "/api/admin/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/health").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().denyAll())
                .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtConverter)))
                .build();
    }
}
