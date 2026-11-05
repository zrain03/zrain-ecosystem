/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/auth/LoginThrottle.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menghadkan cubaan login supaya percubaan kata laluan berulang tidak boleh diteruskan tanpa had.
 * EN: Throttles login attempts to prevent unlimited repeated password guessing.
 */
package dev.zrain.authstarter.auth;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
// BM: LoginThrottle: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghadkan cubaan login supaya percubaan kata laluan berulang tidak boleh diteruskan tanpa had.
// EN: LoginThrottle: Isolates one operation so it can be reviewed and tested. Module purpose: throttles login attempts to prevent unlimited repeated password guessing.
public class LoginThrottle {
    private static final int LIMIT = 5;
    private static final long WINDOW_SECONDS = 600;
    private final ConcurrentHashMap<String, Attempt> failures = new ConcurrentHashMap<>();
    record Attempt(int count, long until) {}

    // BM: allowed: Mengesahkan prasyarat atau syarat keselamatan sebelum meneruskan aliran. Tujuan modul: menghadkan cubaan login supaya percubaan kata laluan berulang tidak boleh diteruskan tanpa had. Input: String key.
    // EN: allowed: Checks a precondition or safety invariant before allowing the flow to continue. Module purpose: throttles login attempts to prevent unlimited repeated password guessing. Inputs: String key.
    public boolean allowed(String key) {
        Attempt attempt = failures.get(key);
        return attempt == null || Instant.now().getEpochSecond() >= attempt.until() || attempt.count() < LIMIT;
    }

    public void recordFailure(String key) {
        long now = Instant.now().getEpochSecond();
        failures.compute(key, (k, previous) -> previous == null || now >= previous.until()
                ? new Attempt(1, now + WINDOW_SECONDS)
                : new Attempt(previous.count() + 1, previous.until()));
    }

    // BM: clear: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghadkan cubaan login supaya percubaan kata laluan berulang tidak boleh diteruskan tanpa had. Input: String key.
    // EN: clear: Isolates one operation so it can be reviewed and tested. Module purpose: throttles login attempts to prevent unlimited repeated password guessing. Inputs: String key.
    public void clear(String key) { failures.remove(key); }
}
