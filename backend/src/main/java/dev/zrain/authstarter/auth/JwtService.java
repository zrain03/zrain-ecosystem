/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/auth/JwtService.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menandatangani token pentadbir berjangka pendek dengan tuntutan issuer serta tempoh tamat yang dikawal.
 * EN: Issues short-lived administrator JWTs with controlled issuer claims and expiration.
 */
package dev.zrain.authstarter.auth;

import dev.zrain.authstarter.auth.dto.TokenResponse;
import dev.zrain.authstarter.config.JwtProperties;
import dev.zrain.authstarter.user.AppUser;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
// BM: JwtService: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menandatangani token pentadbir berjangka pendek dengan tuntutan issuer serta tempoh tamat yang dikawal.
// EN: JwtService: Isolates one operation so it can be reviewed and tested. Module purpose: issues short-lived administrator JWTs with controlled issuer claims and expiration.
public class JwtService {
    private final JwtEncoder encoder;
    private final JwtProperties properties;

    public JwtService(JwtEncoder encoder, JwtProperties properties) {
        this.encoder = encoder;
        this.properties = properties;
    }

    // BM: generateAccessToken: Menghasilkan representasi yang diperlukan tanpa mengubah input asal secara tidak sengaja. Tujuan modul: menandatangani token pentadbir berjangka pendek dengan tuntutan issuer serta tempoh tamat yang dikawal. Input: AppUser user.
    // EN: generateAccessToken: Produces the required representation without unintentionally mutating the input. Module purpose: issues short-lived administrator JWTs with controlled issuer claims and expiration. Inputs: AppUser user.
    public TokenResponse generateAccessToken(AppUser user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(user.getId().toString())
                .audience(List.of(properties.audience()))
                .issuedAt(now)
                .expiresAt(now.plus(properties.accessMinutes(), ChronoUnit.MINUTES))
                .claim("roles", List.of(user.getRole().name()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return new TokenResponse(encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue(),
                "Bearer", properties.accessMinutes() * 60);
    }
}
