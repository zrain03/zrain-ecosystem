/*
 * Fail / File: backend/src/main/java/dev/zrain/authstarter/user/AppUser.java
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mewakili identiti admin yang disimpan dengan hash kata laluan dan role.
 * EN: Models persisted administrator identity with password hash and role.
 */
package dev.zrain.authstarter.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
// BM: AppUser: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mewakili identiti admin yang disimpan dengan hash kata laluan dan role.
// EN: AppUser: Isolates one operation so it can be reviewed and tested. Module purpose: models persisted administrator identity with password hash and role.
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // BM: AppUser: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mewakili identiti admin yang disimpan dengan hash kata laluan dan role.
    // EN: AppUser: Isolates one operation so it can be reviewed and tested. Module purpose: models persisted administrator identity with password hash and role.
    protected AppUser() {}

    public AppUser(String email, String passwordHash, Role role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = Instant.now();
    }

    // BM: getId: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: mewakili identiti admin yang disimpan dengan hash kata laluan dan role.
    // EN: getId: Reads relevant records and returns a bounded result to the caller. Module purpose: models persisted administrator identity with password hash and role.
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}
