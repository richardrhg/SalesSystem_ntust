<?php
$pdo = new PDO('mysql:host=localhost;dbname=salesSystem', 'admin', '1234');
session_start();

switch ($_GET["do"]) {
    case "get_employees":
        $stmt = $pdo->query("SELECT * FROM employees");
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($employees);
        break;
    case "get_products":
        $stmt = $pdo->query("SELECT * FROM products");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
        break;
    case "get_sales":
        $stmt = $pdo->query("SELECT * FROM sales");
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $salesData = [];
        foreach ($sales as $sale) {
            $sale["empName"] = $pdo->query("SELECT emp_name FROM employees WHERE emp_id = " . $sale["emp_id"])->fetchColumn();
            $sale["productName"] = $pdo->query("SELECT product_name FROM products WHERE product_id = " . $sale["product_id"])->fetchColumn();
            $salesData[] = $sale;
        }
        echo json_encode($salesData);
        break;
    case "add_employee":
        $stmt = $pdo->prepare("INSERT INTO employees (emp_name, title, hire_date) VALUES (?, ?, ?)");
        $stmt->execute([$_GET["emp_name"], $_GET["title"], $_GET["hire_date"]]);
        echo json_encode(["success" => true]);
        break;
    case "add_product":
        $stmt = $pdo->prepare("INSERT INTO products (product_name, unit_price) VALUES (?, ?)");
        $stmt->execute([$_GET["product_name"], $_GET["unit_price"]]);
        echo json_encode(["success" => true]);
        break;
    case "add_sale":
        $stmt = $pdo->prepare("INSERT INTO sales (emp_id, product_id, quantity, sale_date) VALUES (?, ?, ?, ?)");
        $stmt->execute([$_GET["emp_id"], $_GET["product_id"], $_GET["quantity"], $_GET["sale_date"]]);
        echo json_encode(["success" => true]);
        break;
    case "add_report":
        $stmt = $pdo->prepare("INSERT INTO reports (report_name, report_date) VALUES (?, ?)");
        $stmt->execute([$_GET["report_name"], $_GET["report_date"]]);
        echo json_encode(["success" => true]);
        break;
    case "update_employee":
        $stmt = $pdo->prepare("UPDATE employees SET emp_name = ?, title = ?, hire_date = ? WHERE emp_id = ?");
        $stmt->execute([$_GET["emp_name"], $_GET["title"], $_GET["hire_date"], $_GET["emp_id"]]);
        echo json_encode(["success" => true]);
        break;
    case "update_product":
        $stmt = $pdo->prepare("UPDATE products SET product_name = ?, unit_price = ? WHERE product_id = ?");
        $stmt->execute([$_GET["product_name"], $_GET["unit_price"], $_GET["product_id"]]);
        echo json_encode(["success" => true]);
        break;
    case "update_sale":
        $stmt = $pdo->prepare("UPDATE sales SET emp_id = ?, product_id = ?, quantity = ?, sale_date = ? WHERE sale_id = ?");
        $stmt->execute([$_GET["emp_id"], $_GET["product_id"], $_GET["quantity"], $_GET["sale_date"], $_GET["sale_id"]]);
        echo json_encode(["success" => true]);
        break;
    case "delete_employee":
        try {
            $empId = (int)$_GET["emp_id"];
            
            // 檢查是否有相關的銷售記錄
            $checkStmt = $pdo->prepare("SELECT COUNT(*) as count FROM sales WHERE emp_id = ?");
            $checkStmt->execute([$empId]);
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && $result['count'] > 0) {
                // 如果有銷售記錄，返回錯誤訊息
                echo json_encode([
                    "success" => false,
                    "error" => "無法刪除此員工，因為已有 " . $result['count'] . " 筆相關的銷售記錄。請先刪除相關的銷售記錄後再試。"
                ]);
            } else {
                // 沒有銷售記錄，可以安全刪除
                $stmt = $pdo->prepare("DELETE FROM employees WHERE emp_id = ?");
                $stmt->execute([$empId]);
                echo json_encode(["success" => true]);
            }
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "error" => "刪除員工失敗：" . $e->getMessage()
            ]);
        }
        break;
    case "delete_product":
        try {
            $productId = (int)$_GET["product_id"];
            
            // 檢查是否有相關的銷售記錄
            $checkStmt = $pdo->prepare("SELECT COUNT(*) as count FROM sales WHERE product_id = ?");
            $checkStmt->execute([$productId]);
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && $result['count'] > 0) {
                // 如果有銷售記錄，返回錯誤訊息
                echo json_encode([
                    "success" => false,
                    "error" => "無法刪除此產品，因為已有 " . $result['count'] . " 筆相關的銷售記錄。請先刪除相關的銷售記錄後再試。"
                ]);
            } else {
                // 沒有銷售記錄，可以安全刪除
                $stmt = $pdo->prepare("DELETE FROM products WHERE product_id = ?");
                $stmt->execute([$productId]);
                echo json_encode(["success" => true]);
            }
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "error" => "刪除產品失敗：" . $e->getMessage()
            ]);
        }
        break;
    case "delete_sale":
        $stmt = $pdo->prepare("DELETE FROM sales WHERE sale_id = ?");
        $stmt->execute([$_GET["sale_id"]]);
        echo json_encode(["success" => true]);
        break;
    case "get_reports":
        // 取得6種不同sql篩選結果
        switch ($_GET["report_type"]) {
            case "1":
                // 查詢每個員工的銷售數量
                $stmt = $pdo->query("select e.emp_id as '員工編號', e.emp_name as '員工姓名', count(*) as '銷售數量' from sales s left join employees e on s.emp_id = e.emp_id group by e.emp_id, e.emp_name");
                $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reports);
                break;
            case "2":
                // 查詢每個產品的銷售數量
                $stmt = $pdo->query("select p.product_id as '產品編號', p.product_name as '產品名稱', sum(s.quantity) as '銷售數量' from sales s left join products p on s.product_id = p.product_id group by p.product_id, p.product_name order by sum(s.quantity) desc");
                $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reports);
                break;
            case "3":
                // 查詢每位員工銷售平均數量
                $stmt = $pdo->query("select e.emp_id as '員工編號', e.emp_name as '員工姓名', avg(s.quantity) as '平均銷售數量' from sales s left join employees e on s.emp_id = e.emp_id group by e.emp_id, e.emp_name order by avg(s.quantity) desc");
                $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reports);
                break;
            case "4":
                // 查詢每種產品平均銷售數量
                $stmt = $pdo->query("select 
                    p.product_id as '產品編號', p.product_name as '產品名稱', avg(s.quantity) as '平均銷售數量' 
                    from sales s left join products p on s.product_id = p.product_id 
                    group by p.product_id, p.product_name order by avg(s.quantity) desc");
                $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reports);
                break;
            case "5":
                // 查詢員工銷售紀錄資料（支援員工篩選）
                $empId = isset($_GET["emp_id"]) ? $_GET["emp_id"] : null;
                $whereClause = $empId ? "WHERE s.emp_id = " . intval($empId) : "";
                
                // 查詢銷售紀錄
                $stmt = $pdo->query("
                    SELECT s.sale_id AS '銷售編號', e.emp_name AS '員工姓名', p.product_name AS '產品名稱', 
                           s.quantity AS '銷售數量', s.sale_date AS '銷售日期',
                           s.quantity * p.unit_price AS '銷售額'
                    FROM sales s 
                    LEFT JOIN employees e ON s.emp_id = e.emp_id 
                    LEFT JOIN products p ON s.product_id = p.product_id
                    $whereClause
                    ORDER BY s.sale_date DESC
                ");
                $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // 如果有篩選員工，計算統計資訊
                $stats = null;
                if ($empId) {
                    // 計算平均銷售額和總銷售額
                    $statsStmt = $pdo->query("
                        SELECT 
                            AVG(s.quantity * p.unit_price) AS '平均銷售額',
                            SUM(s.quantity * p.unit_price) AS '總銷售額',
                            COUNT(*) AS '銷售筆數'
                        FROM sales s
                        LEFT JOIN products p ON s.product_id = p.product_id
                        WHERE s.emp_id = " . intval($empId)
                    );
                    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
                    
                    // 查詢最大宗商品（按銷售額）
                    $topProductStmt = $pdo->query("
                        SELECT p.product_name AS '產品名稱', 
                               SUM(s.quantity * p.unit_price) AS '銷售額',
                               SUM(s.quantity) AS '銷售數量'
                        FROM sales s
                        LEFT JOIN products p ON s.product_id = p.product_id
                        WHERE s.emp_id = " . intval($empId) . "
                        GROUP BY p.product_id, p.product_name
                        ORDER BY SUM(s.quantity * p.unit_price) DESC
                        LIMIT 5
                    ");
                    $topProducts = $topProductStmt->fetchAll(PDO::FETCH_ASSOC);
                    $stats['top_products'] = $topProducts;
                }
                
                $response = [
                    'data' => $reports,
                    'stats' => $stats
                ];
                
                echo json_encode($response);
                break;
            case "6":
                // 查詢必推銷售產品（按銷售額取前五）
                $stmt = $pdo->query("
                    SELECT 
                        p.product_id AS '產品編號', 
                        p.product_name AS '產品名稱', 
                        SUM(s.quantity) AS '銷售數量',
                        SUM(s.quantity * p.unit_price) AS '銷售額'
                    FROM sales s 
                    LEFT JOIN products p ON s.product_id = p.product_id
                    GROUP BY p.product_id, p.product_name 
                    ORDER BY SUM(s.quantity * p.unit_price) DESC 
                    LIMIT 5
                ");
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // 計算平均銷售額
                $avgStmt = $pdo->query("
                    SELECT AVG(total_sales) AS avg_sales
                    FROM (
                        SELECT SUM(s.quantity * p.unit_price) AS total_sales
                        FROM sales s
                        LEFT JOIN products p ON s.product_id = p.product_id
                        GROUP BY s.product_id
                    ) AS subquery
                ");
                $avgResult = $avgStmt->fetch(PDO::FETCH_ASSOC);
                $average = round($avgResult['avg_sales'], 2);
                
                // 將平均值加入結果中
                $response = [
                    'data' => $result,
                    'average' => $average
                ];
                
                echo json_encode($response);
                break;
            default:
                echo json_encode([]);
                break;
        }
        break;
    case "get_dashboard_stats":
        // 獲取儀表板統計數據
        try {
            // 員工總數
            $empStmt = $pdo->query("SELECT COUNT(*) as count FROM employees");
            $empCount = $empStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            // 產品總數
            $productStmt = $pdo->query("SELECT COUNT(*) as count FROM products");
            $productCount = $productStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            // 銷售記錄總數
            $saleStmt = $pdo->query("SELECT COUNT(*) as count FROM sales");
            $saleCount = $saleStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            // 總銷售額
            $totalSalesStmt = $pdo->query("
                SELECT SUM(s.quantity * p.unit_price) as total_sales
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.product_id
            ");
            $totalSales = $totalSalesStmt->fetch(PDO::FETCH_ASSOC)['total_sales'] ?? 0;
            
            // 最近5筆銷售記錄
            $recentSalesStmt = $pdo->query("
                SELECT s.sale_id, e.emp_name, p.product_name, s.quantity, s.sale_date,
                       s.quantity * p.unit_price as sales_amount
                FROM sales s
                LEFT JOIN employees e ON s.emp_id = e.emp_id
                LEFT JOIN products p ON s.product_id = p.product_id
                ORDER BY s.sale_date DESC, s.sale_id DESC
                LIMIT 5
            ");
            $recentSales = $recentSalesStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $stats = [
                'employee_count' => (int)$empCount,
                'product_count' => (int)$productCount,
                'sale_count' => (int)$saleCount,
                'total_sales' => (float)$totalSales,
                'recent_sales' => $recentSales
            ];
            
            echo json_encode($stats);
        } catch (Exception $e) {
            echo json_encode([
                'employee_count' => 0,
                'product_count' => 0,
                'sale_count' => 0,
                'total_sales' => 0,
                'recent_sales' => []
            ]);
        }
        break;
    default:
        echo json_encode([]);
        break;
}
