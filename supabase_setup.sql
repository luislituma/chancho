-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase

CREATE TABLE IF NOT EXISTS chancho_state (
  id integer PRIMARY KEY,
  data jsonb NOT NULL
);

-- Insertar los datos iniciales
INSERT INTO chancho_state (id, data) VALUES (
  1,
  '[
    {"id": "0", "name": "Alicia Quezada", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]},
    {"id": "1", "name": "Manuel Lituma", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]},
    {"id": "2", "name": "Teresa Lituma", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]},
    {"id": "3", "name": "Galo Jimenez", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]},
    {"id": "4", "name": "Yuliana Vicente", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]},
    {"id": "5", "name": "Paola Vicente", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]},
    {"id": "6", "name": "Luis Lituma", "payments": [{"paid": false, "month": "Agosto", "amount": 10}, {"paid": false, "month": "Septiembre", "amount": 10}, {"paid": false, "month": "Octubre", "amount": 10}, {"paid": false, "month": "Noviembre", "amount": 10}, {"paid": false, "month": "Diciembre", "amount": 10}]}
  ]'::jsonb
);

-- Para que la app web pueda leer y escribir libremente sin autenticación de Supabase (el login está en el frontend):
ALTER TABLE chancho_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a todos" 
ON chancho_state FOR SELECT 
USING (true);

CREATE POLICY "Permitir actualizacion a todos" 
ON chancho_state FOR UPDATE 
USING (true);
