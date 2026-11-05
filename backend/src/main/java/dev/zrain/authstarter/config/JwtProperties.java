/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/config/JwtProperties.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengikat secret, issuer, audience dan hayat token daripada konfigurasi aplikasi.
 * EN: Binds secret, issuer, audience and token lifetime from application configuration.
 */
package dev.zrain.authstarter.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "zrain.jwt")
// BM: JwtProperties: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengikat secret, issuer, audience dan hayat token daripada konfigurasi aplikasi.
// EN: JwtProperties: Isolates one operation so it can be reviewed and tested. Module purpose: binds secret, issuer, audience and token lifetime from application configuration.
public record JwtProperties(String secretBase64, String issuer, String audience, long accessMinutes) {}
