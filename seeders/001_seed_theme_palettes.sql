INSERT INTO theme_palettes (nama, slug, deskripsi, warna, is_default, is_active, urutan) VALUES
('Biru Langit', 'sky', 'Tema warna biru langit yang cerah dan menenangkan. Cocok untuk suasana profesional.',
 '{"50":"#f0f9ff","100":"#e0f2fe","200":"#bae6fd","300":"#7dd3fc","400":"#38bdf8","500":"#0ea5e9","600":"#0284c7","700":"#0369a1","800":"#075985","900":"#0c4a6e","950":"#082f49"}',
 TRUE, TRUE, 1),

('Hijau Zamrud', 'emerald', 'Tema warna hijau zamrud yang segar dan alami. Memberikan kesan sejuk dan modern.',
 '{"50":"#ecfdf5","100":"#d1fae5","200":"#a7f3d0","300":"#6ee7b7","400":"#34d399","500":"#10b981","600":"#059669","700":"#047857","800":"#065f46","900":"#064e3b","950":"#022c22"}',
 FALSE, TRUE, 2),

('Mawar', 'rose', 'Tema warna mawar yang elegan dan hangat. Cocok untuk tampilan yang berani.',
 '{"50":"#fff1f2","100":"#ffe4e6","200":"#fecdd3","300":"#fda4af","400":"#fb7185","500":"#f43f5e","600":"#e11d48","700":"#be123c","800":"#9f1239","900":"#881337","950":"#4c0519"}',
 FALSE, TRUE, 3),

('Ungu', 'violet', 'Tema warna ungu yang mewah dan kreatif. Memberikan nuansa elegan dan modern.',
 '{"50":"#f5f3ff","100":"#ede9fe","200":"#ddd6fe","300":"#c4b5fd","400":"#a78bfa","500":"#8b5cf6","600":"#7c3aed","700":"#6d28d9","800":"#5b21b6","900":"#4c1d95","950":"#2e1065"}',
 FALSE, TRUE, 4),

('Amber', 'amber', 'Tema warna amber yang hangat dan ceria. Memberikan kesan optimis dan energik.',
 '{"50":"#fffbeb","100":"#fef3c7","200":"#fde68a","300":"#fcd34d","400":"#fbbf24","500":"#f59e0b","600":"#d97706","700":"#b45309","800":"#92400e","900":"#78350f","950":"#451a03"}',
 FALSE, TRUE, 5),

('Teal', 'teal', 'Tema warna teal yang kalem dan profesional. Cocok untuk tampilan corporate yang modern.',
 '{"50":"#f0fdfa","100":"#ccfbf1","200":"#99f6e4","300":"#5eead4","400":"#2dd4bf","500":"#14b8a6","600":"#0d9488","700":"#0f766e","800":"#115e59","900":"#134e48","950":"#042f2e"}',
 FALSE, TRUE, 6)

ON DUPLICATE KEY UPDATE
  nama = VALUES(nama),
  deskripsi = VALUES(deskripsi),
  warna = VALUES(warna),
  is_active = VALUES(is_active),
  urutan = VALUES(urutan);

-- Set default theme in app_theme (only if table exists and is empty)
INSERT INTO app_theme (id, theme_palette_id, is_dark_mode)
SELECT 1, id, FALSE FROM theme_palettes WHERE is_default = TRUE
AND NOT EXISTS (SELECT 1 FROM app_theme WHERE id = 1);
