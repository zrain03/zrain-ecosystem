/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/common/AdminApiErrors.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyeragamkan ralat HTTP pentadbir supaya butiran keselamatan dalaman tidak terbocor.
 * EN: Standardizes administrator HTTP errors without leaking internal security details.
 */
package dev.zrain.authstarter.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
// BM: AdminApiErrors: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyeragamkan ralat HTTP pentadbir supaya butiran keselamatan dalaman tidak terbocor.
// EN: AdminApiErrors: Isolates one operation so it can be reviewed and tested. Module purpose: standardizes administrator HTTP errors without leaking internal security details.
public class AdminApiErrors {
    public record Error(String error) {}
    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<Error> badCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new Error("Invalid email or password."));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Error> invalid() {
        return ResponseEntity.badRequest().body(new Error("Please check the supplied fields."));
    }
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Error> illegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new Error(ex.getMessage()));
    }
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Error> status(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(new Error(ex.getReason() == null ? "Request rejected." : ex.getReason()));
    }
}
