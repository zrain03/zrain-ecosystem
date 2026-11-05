/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/catalog/HealthApi.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memberi pemeriksaan kesediaan perkhidmatan tanpa mendedahkan data pengguna atau pentadbir.
 * EN: Provides service readiness checks without exposing user or administrator data.
 */
package dev.zrain.authstarter.catalog;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
// BM: HealthApi: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memberi pemeriksaan kesediaan perkhidmatan tanpa mendedahkan data pengguna atau pentadbir.
// EN: HealthApi: Isolates one operation so it can be reviewed and tested. Module purpose: provides service readiness checks without exposing user or administrator data.
public class HealthApi {
    @GetMapping("/api/health")
    public Map<String,String> health() { return Map.of("status","ok"); }
}
