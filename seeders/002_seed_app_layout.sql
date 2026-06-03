INSERT INTO app_layout (id, layout_mode)
SELECT 1, 'classic'
WHERE NOT EXISTS (SELECT 1 FROM app_layout WHERE id = 1);
