/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/user/UserRepository.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan akses data identiti admin tanpa memintas servis keselamatan.
 * EN: Provides administrator identity persistence without bypassing security services.
 */
package dev.zrain.authstarter.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

// BM: UserRepository: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan akses data identiti admin tanpa memintas servis keselamatan.
// EN: UserRepository: Isolates one operation so it can be reviewed and tested. Module purpose: provides administrator identity persistence without bypassing security services.
public interface UserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
