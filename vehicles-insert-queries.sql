USE vehicles;

DELETE FROM users;
INSERT INTO users (`name`, email, `password`, is_admin) VALUES
('user1', 'user1@example.com', 'user1', FALSE), 
('user12', 'user2@example.com', 'user2', FALSE),
('user13', 'user3@example.com', 'user3', FALSE),
('admin1', 'admin1@example.com', 'admin1', TRUE),
('admin2', 'admin2@example.com', 'admin2', TRUE);

INSERT INTO vehicle_brands (`name`) VALUES
  ('Toyota'),
  ('Honda'),
  ('Mitsubishi'),
  ('Suzuki'),
  ('Daihatsu');

INSERT INTO vehicle_types (`name`, brand_id) VALUES
  ('Avanza', (SELECT id FROM vehicle_brands WHERE `name` = 'Toyota')),
  ('Civic', (SELECT id FROM vehicle_brands WHERE `name` = 'Honda')),
  ('Xpander', (SELECT id FROM vehicle_brands WHERE `name` = 'Mitsubishi')),
  ('Ertiga', (SELECT id FROM vehicle_brands WHERE `name` = 'Suzuki')),
  ('Ayla', (SELECT id FROM vehicle_brands WHERE `name` = 'Daihatsu'));

INSERT INTO vehicle_years (YEAR) VALUES
  (2023),
  (2022),
  (2021),
  (2020),
  (2019);

INSERT INTO vehicle_models (`name`, type_id) VALUES
  ('Altis', (SELECT id FROM vehicle_types WHERE `name` = 'Avanza')), 
  ('CR-V', (SELECT id FROM vehicle_types WHERE `name` = 'Civic')),
  ('Pajero Sport', (SELECT id FROM vehicle_types WHERE `name` = 'Xpander')),  
  ('Swift', (SELECT id FROM vehicle_types WHERE `name` = 'Ertiga')),  
  ('Sirion', (SELECT id FROM vehicle_types WHERE `name` = 'Ayla'));  

INSERT INTO pricelists (CODE, price, year_id, model_id) VALUES
  ('AVZ-MT-2023', 300000000, (SELECT id FROM vehicle_years WHERE YEAR = 2023), (SELECT id FROM vehicle_models WHERE `name` = 'Altis')), 
  ('CVIC-EX-2022', 350000000, (SELECT id FROM vehicle_years WHERE YEAR = 2022), (SELECT id FROM vehicle_models WHERE `name` = 'CR-V')),
  ('PAJ-Dakar-2021', 550000000, (SELECT id FROM vehicle_years WHERE YEAR = 2021), (SELECT id FROM vehicle_models WHERE `name` = 'Pajero Sport')), 
  ('SWIFT-GS-2020', 220000000, (SELECT id FROM vehicle_years WHERE YEAR = 2020), (SELECT id FROM vehicle_models WHERE `name` = 'Swift')),
  ('AYLA-X-2023', 180000000, (SELECT id FROM vehicle_years WHERE YEAR = 2023), (SELECT id FROM vehicle_models WHERE `name` = 'Sirion'));  
