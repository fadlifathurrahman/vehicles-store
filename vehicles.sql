DROP DATABASE vehicles;
CREATE DATABASE IF NOT EXISTS vehicles;
USE vehicles;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE vehicle_brands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL
);

CREATE TABLE vehicle_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL,
  brand_id INT NOT NULL,
  FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id)
);

CREATE TABLE vehicle_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  YEAR INT NOT NULL
);

CREATE TABLE vehicle_models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL,
  type_id INT NOT NULL,
  FOREIGN KEY (type_id) REFERENCES vehicle_types(id)
);

CREATE TABLE pricelists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  CODE VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  year_id INT NOT NULL,
  model_id INT NOT NULL,
  FOREIGN KEY (year_id) REFERENCES vehicle_years(id),
  FOREIGN KEY (model_id) REFERENCES vehicle_models(id)
);

INSERT INTO users (NAME, is_admin) VALUES ("Fathur", FALSE);
INSERT INTO users (NAME, is_admin) VALUES ("Fadli", TRUE);

INSERT INTO vehicle_brands (NAME) VALUES ("Toyota");
INSERT INTO vehicle_brands (NAME) VALUES ("Honda");

INSERT INTO vehicle_types (NAME, brand_id) VALUES ("Camry", 1);
INSERT INTO vehicle_types (NAME, brand_id) VALUES ("Civic", 2);

INSERT INTO vehicle_years (YEAR) VALUES (2023);
INSERT INTO vehicle_years (YEAR) VALUES (2022);

INSERT INTO vehicle_models (NAME, type_id) VALUES ("LE", 1);
INSERT INTO vehicle_models (NAME, type_id) VALUES ("Si", 2);

INSERT INTO pricelists (CODE, price, year_id, model_id) VALUES ("T23LE", 120000000, 1, 1);
INSERT INTO pricelists (CODE, price, year_id, model_id) VALUES ("H23Si", 210000000, 2, 2);

SELECT a.code, a.`price`, b.year FROM pricelists a, vehicle_years b WHERE b.id = a.id;

SELECT a.code, a.`price`, b.year, c.name AS model_name, d.name AS type_name, e.name AS brand_name 
FROM pricelists a, vehicle_years b, vehicle_models c, vehicle_types d, vehicle_brands e 
WHERE   c.`id` = d.`id` AND d.`id` = e.`id` AND b.id = a.id
GROUP BY a.`code`;


SELECT a.code, a.`price`, b.year
FROM pricelists a, vehicle_years b
WHERE b.id = a.id AND 
	(SELECT c.name, d.name 
	FROM vehicle_models c, vehicle_types d
	WHERE c.id = d.id);
	
SELECT
  p.code,
  p.price,
  vy.year,
  vm.name AS model_name,
  vt.name AS type_name,
  vb.name AS brand_name
FROM pricelists p
JOIN vehicle_years vy ON p.year_id = vy.id
JOIN vehicle_models vm ON p.model_id = vm.id
JOIN vehicle_types vt ON vm.type_id = vt.id
JOIN vehicle_brands vb ON vt.brand_id = vb.id;