/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/config/JwtConfig.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Membina encoder dan decoder JWT serta memaksa secret dan validasi token yang selamat.
 * EN: Builds JWT encoders and decoders while enforcing safe secrets and token validation.
 */
package dev.zrain.authstarter.config;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
// BM: JwtConfig: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membina encoder dan decoder JWT serta memaksa secret dan validasi token yang selamat.
// EN: JwtConfig: Isolates one operation so it can be reviewed and tested. Module purpose: builds JWT encoders and decoders while enforcing safe secrets and token validation.
public class JwtConfig {
    @Bean
    public SecretKey jwtSigningKey(JwtProperties properties) {
        if (properties.secretBase64() == null || properties.secretBase64().isBlank()) {
            throw new IllegalStateException("ZRAIN_JWT_SECRET_BASE64 must be configured");
        }
        if (properties.issuer() == null || properties.issuer().isBlank()
                || properties.audience() == null || properties.audience().isBlank()
                || properties.accessMinutes() < 1 || properties.accessMinutes() > 60) {
            throw new IllegalStateException("JWT issuer, audience and lifetime (1-60 min) must be valid");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(properties.secretBase64());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("JWT secret must be Base64", ex);
        }
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT signing key must contain at least 32 random bytes");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSigningKey) {
        return NimbusJwtEncoder.withSecretKey(jwtSigningKey).algorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSigningKey, JwtProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtSigningKey)
                .macAlgorithm(MacAlgorithm.HS256).build();
        OAuth2TokenValidator<Jwt> audience = token -> token.getAudience().contains(properties.audience())
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Incorrect audience", null));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(properties.issuer()), audience));
        return decoder;
    }
}
