/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/auth/dto/LoginRequest.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengisytiharkan bentuk permintaan login dan validasi input pentadbir.
 * EN: Declares the administrator login request shape and input validation.
 */
package dev.zrain.authstarter.auth.dto;

import jakarta.validation.constraints.NotBlank;

// BM: LoginRequest: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengisytiharkan bentuk permintaan login dan validasi input pentadbir.
// EN: LoginRequest: Isolates one operation so it can be reviewed and tested. Module purpose: declares the administrator login request shape and input validation.
public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
