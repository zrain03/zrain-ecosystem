/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/auth/dto/TokenResponse.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Membungkus token dan metadata minimum untuk pemanggil login yang sah.
 * EN: Encapsulates the token and minimal metadata returned to an authenticated caller.
 */
package dev.zrain.authstarter.auth.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresIn) {}
