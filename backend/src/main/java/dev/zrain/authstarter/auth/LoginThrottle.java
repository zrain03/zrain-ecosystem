package dev.zrain.authstarter.auth;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class LoginThrottle {
    private static final int LIMIT = 5;
    private static final long WINDOW_SECONDS = 600;
    private final ConcurrentHashMap<String, Attempt> failures = new ConcurrentHashMap<>();
    record Attempt(int count, long until) {}

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

    public void clear(String key) { failures.remove(key); }
}
