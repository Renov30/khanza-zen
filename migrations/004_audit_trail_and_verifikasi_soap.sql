CREATE TABLE IF NOT EXISTS `pemeriksaan_ranap_audit_trail` (
  `id_log` bigint(20) NOT NULL AUTO_INCREMENT,
  `no_rawat` varchar(17) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tgl_perawatan` date NOT NULL,
  `jam_rawat` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `ket_edit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `ket_hapus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  PRIMARY KEY (`id_log`),
  KEY `no_rawat` (`no_rawat`),
  KEY `tgl_perawatan` (`tgl_perawatan`),
  KEY `jam_rawat` (`jam_rawat`),
  CONSTRAINT `pemeriksaan_ranap_ibfk_audit_trail_1` FOREIGN KEY (`no_rawat`, `tgl_perawatan`, `jam_rawat`) REFERENCES `pemeriksaan_ranap` (`no_rawat`, `tgl_perawatan`, `jam_rawat`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci ROW_FORMAT=Dynamic;

CREATE TABLE IF NOT EXISTS `pemeriksaan_ralan_audit_trail` (
  `id_log` bigint(20) NOT NULL AUTO_INCREMENT,
  `no_rawat` varchar(17) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tgl_perawatan` date NOT NULL,
  `jam_rawat` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `ket_edit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `ket_hapus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  PRIMARY KEY (`id_log`),
  KEY `no_rawat` (`no_rawat`),
  KEY `tgl_perawatan` (`tgl_perawatan`),
  KEY `jam_rawat` (`jam_rawat`),
  KEY `pemeriksaan_ralan_ibfk_audit_trail_1` (`no_rawat`, `tgl_perawatan`, `jam_rawat`),
  CONSTRAINT `pemeriksaan_ralan_ibfk_audit_trail_1` FOREIGN KEY (`no_rawat`, `tgl_perawatan`, `jam_rawat`) REFERENCES `pemeriksaan_ralan` (`no_rawat`, `tgl_perawatan`, `jam_rawat`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci ROW_FORMAT=Dynamic;

CREATE TABLE IF NOT EXISTS `verifikasi_soap_ranap` (
  `no_rawat` varchar(17) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tgl_perawatan` date NOT NULL,
  `jam_rawat` time NOT NULL,
  `verifikasi` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tgl_verifikasi` datetime NOT NULL,
  PRIMARY KEY (`no_rawat`, `tgl_perawatan`, `jam_rawat`),
  KEY `no_rawat` (`no_rawat`),
  KEY `verifikasi` (`verifikasi`),
  CONSTRAINT `verifikasi_soap_ranap_ibfk_1` FOREIGN KEY (`no_rawat`) REFERENCES `reg_periksa` (`no_rawat`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci ROW_FORMAT=Dynamic;

CREATE TABLE IF NOT EXISTS `verifikasi_soap_ralan` (
  `no_rawat` varchar(17) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tgl_perawatan` date NOT NULL,
  `jam_rawat` time NOT NULL,
  `verifikasi` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `tgl_verifikasi` datetime NOT NULL,
  PRIMARY KEY (`no_rawat`, `tgl_perawatan`, `jam_rawat`),
  KEY `no_rawat` (`no_rawat`),
  KEY `verifikasi` (`verifikasi`),
  CONSTRAINT `verifikasi_soap_ralan_ibfk_1` FOREIGN KEY (`no_rawat`) REFERENCES `reg_periksa` (`no_rawat`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci ROW_FORMAT=Dynamic;
