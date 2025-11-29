-- 建立資料庫
CREATE DATABASE IF NOT EXISTS salesSystem
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE salesSystem;

-- 若已存在就先刪掉
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS employees;

-- 員工資料表
CREATE TABLE employees (
  emp_id     INT AUTO_INCREMENT PRIMARY KEY,
  emp_name   VARCHAR(50) NOT NULL,
  title      VARCHAR(50),
  hire_date  DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 產品資料表
CREATE TABLE products (
  product_id    INT AUTO_INCREMENT PRIMARY KEY,
  product_name  VARCHAR(100) NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 銷售資料表
CREATE TABLE sales (
  sale_id     INT AUTO_INCREMENT PRIMARY KEY,
  emp_id      INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  sale_date   DATE NOT NULL,
  CONSTRAINT fk_sales_emp
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
  CONSTRAINT fk_sales_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 以下是範例資料

INSERT INTO employees (emp_name, title, hire_date) VALUES
('張志明', '業務經理', '2022-03-15'),
('林雅婷', '業務專員', '2023-01-10'),
('陳建宏', '業務專員', '2023-05-20'),
('黃美玲', '業務專員', '2023-08-12'),
('吳文傑', '業務專員', '2024-02-01'),
('劉佳欣', '業務助理', '2024-06-15');

INSERT INTO products (product_name, unit_price) VALUES
('筆記型電腦 Pro 15吋', 35900.00),
('無線藍牙耳機', 2490.00),
('智慧型手機 128GB', 18900.00),
('平板電腦 10.9吋', 12900.00),
('機械式鍵盤', 3290.00),
('無線滑鼠', 890.00),
('行動電源 20000mAh', 1290.00),
('USB-C 傳輸線', 390.00);

INSERT INTO sales (emp_id, product_id, quantity, sale_date) VALUES
(1, 1, 3, '2024-10-05'),
(1, 3, 5, '2024-10-08'),
(2, 2, 12, '2024-10-10'),
(2, 4, 8, '2024-10-12'),
(2, 6, 25, '2024-10-15'),
(3, 1, 2, '2024-10-18'),
(3, 3, 6, '2024-10-20'),
(3, 5, 15, '2024-10-22'),
(4, 2, 20, '2024-10-25'),
(4, 7, 30, '2024-10-28'),
(4, 8, 50, '2024-10-30'),
(5, 1, 1, '2024-11-02'),
(5, 4, 4, '2024-11-05'),
(5, 6, 18, '2024-11-08'),
(6, 2, 8, '2024-11-10'),
(6, 7, 20, '2024-11-12'),
(1, 2, 10, '2024-11-15'),
(2, 3, 4, '2024-11-18'),
(3, 4, 6, '2024-11-20'),
(4, 5, 12, '2024-11-22');
