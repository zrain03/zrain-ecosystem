-- Fail / File: backend/src/main/resources/db/migration/V1__initialize_admin_and_products.sql
-- Pembangun / Developer: Zrain
-- Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
-- Dikemas kini / Last updated: 2026-11-05
-- BM: Membina jadual identiti admin dan produk yang diperlukan oleh katalog.
-- EN: Creates administrator identity and product tables required by the catalogue.
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE products (
  id UUID PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(300) NOT NULL,
  category VARCHAR(30) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  primary_action VARCHAR(30) NOT NULL,
  primary_label VARCHAR(50) NOT NULL,
  primary_url VARCHAR(500) NOT NULL,
  secondary_label VARCHAR(50),
  secondary_url VARCHAR(500),
  sort_order INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
