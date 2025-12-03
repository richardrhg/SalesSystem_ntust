// 顯示通知函數
function showNotification(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  const toastId = "toast-" + Date.now();
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className = "toast";
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  let bgColor = "";
  let textColor = "";
  let icon = "";
  let title = "";
  let closeButtonClass = "";

  switch (type) {
    case "success":
      bgColor = "bg-success";
      textColor = "text-white";
      icon = "✓";
      title = "成功";
      closeButtonClass = "btn-close-white";
      break;
    case "error":
      bgColor = "bg-danger";
      textColor = "text-white";
      icon = "✕";
      title = "錯誤";
      closeButtonClass = "btn-close-white";
      break;
    case "warning":
      bgColor = "bg-warning";
      textColor = "text-dark";
      icon = "⚠";
      title = "警告";
      closeButtonClass = "";
      break;
    case "info":
      bgColor = "bg-info";
      textColor = "text-white";
      icon = "ℹ";
      title = "資訊";
      closeButtonClass = "btn-close-white";
      break;
    default:
      bgColor = "bg-primary";
      textColor = "text-white";
      icon = "ℹ";
      title = "通知";
      closeButtonClass = "btn-close-white";
  }

  toast.innerHTML = `
        <div class="toast-header ${bgColor} ${textColor}">
            <strong class="me-auto">${icon} ${title}</strong>
            <button type="button" class="btn-close ${closeButtonClass}" data-bs-dismiss="toast" aria-label="關閉"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

  container.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000,
  });

  bsToast.show();

  toast.addEventListener("hidden.bs.toast", function () {
    toast.remove();
  });
}

// 根據當前 URL 判斷應該獲取什麼資料
function getCurrentPageType() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop().toLowerCase();

  if (currentPage.includes("employeepage")) {
    return "employees";
  } else if (currentPage.includes("productpage")) {
    return "products";
  } else if (currentPage.includes("salespage")) {
    return "sales";
  } else if (currentPage.includes("reportpage")) {
    return "reports";
  }

  return null;
}

// 根據頁面類型獲取對應的 API 方法名稱
function getApiMethod(pageType) {
  const apiMap = {
    employees: "get_employees",
    products: "get_products",
    sales: "get_sales",
    reports: "get_reports",
  };

  return apiMap[pageType] || null;
}

// 從 API 獲取資料
async function fetchDataFromAPI(apiMethod) {
  try {
    let url = `api.php?do=${apiMethod}`;
    if (apiMethod === "get_reports") {
      url += `&report_type=1`;
    }
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("獲取資料失敗:", error);
    return null;
  }
}

// 自動根據當前頁面載入資料
async function loadPageData() {
  const pageType = getCurrentPageType();

  if (!pageType) {
    console.log("當前頁面不需要載入資料");
    return null;
  }

  const apiMethod = getApiMethod(pageType);
  if (!apiMethod) {
    console.error("無法找到對應的 API 方法");
    return null;
  }

  console.log(`正在載入 ${pageType} 資料...`);
  const data = await fetchDataFromAPI(apiMethod);

  if (data) {
    console.log(`成功載入 ${pageType} 資料:`, data);
    return { pageType, data };
  }

  return null;
}

// 通用分頁函數
function paginateData(data, page, size) {
  const start = (page - 1) * size;
  const end = start + size;
  return data.slice(start, end);
}

function renderPagination(
  totalItems,
  currentPageNum,
  pageSizeNum,
  paginationId,
  infoId,
  type
) {
  const totalPages = Math.ceil(totalItems / pageSizeNum);
  const pagination = document.getElementById(paginationId);
  const info = document.getElementById(infoId);

  if (!pagination || !info) return;

  // 更新分頁資訊
  const start = (currentPageNum - 1) * pageSizeNum + 1;
  const end = Math.min(currentPageNum * pageSizeNum, totalItems);
  info.textContent = `顯示 ${start}-${end} 筆，共 ${totalItems} 筆`;

  // 清空分頁
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  // 上一頁按鈕
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPageNum === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPageNum - 1
  }">上一頁</a>`;
  pagination.appendChild(prevLi);

  // 頁碼按鈕
  const maxVisible = 5;
  let startPage = Math.max(1, currentPageNum - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    const firstLi = document.createElement("li");
    firstLi.className = "page-item";
    firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
    pagination.appendChild(firstLi);

    if (startPage > 2) {
      const ellipsis = document.createElement("li");
      ellipsis.className = "page-item disabled";
      ellipsis.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPageNum ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    pagination.appendChild(li);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("li");
      ellipsis.className = "page-item disabled";
      ellipsis.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(ellipsis);
    }

    const lastLi = document.createElement("li");
    lastLi.className = "page-item";
    lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
    pagination.appendChild(lastLi);
  }

  // 下一頁按鈕
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPageNum === totalPages ? "disabled" : ""
  }`;
  nextLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPageNum + 1
  }">下一頁</a>`;
  pagination.appendChild(nextLi);

  // 綁定點擊事件
  pagination.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute("data-page"));
      if (page && page !== currentPageNum && page >= 1 && page <= totalPages) {
        currentPage[type] = page;
        refreshTable(type);
        // 滾動到表格頂部
        const tableContainer = document
          .querySelector(`#table-${type}`)
          ?.closest(".table-container");
        if (tableContainer) {
          tableContainer.scrollTop = 0;
        }
      }
    });
  });
}

function refreshTable(type) {
  switch (type) {
    case "employees":
      fillEmployeeTable(employeesData);
      break;
    case "products":
      fillProductTable(productsData);
      break;
    case "sales":
      fillSaleTable(salesData);
      break;
  }
}

// 填充員工表格
function fillEmployeeTable(employees) {
  const table = document.getElementById("table-employees");
  if (!table) return;

  const tableBody = table.querySelector("tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  // 檢查是否有搜尋條件
  const searchInput = document.getElementById("search-employees");
  const hasSearchTerm = searchInput && searchInput.value.trim().length > 0;
  
  // 使用篩選後的數據（如果有搜尋條件，即使結果為空也要使用篩選後的數據）
  const dataToShow = hasSearchTerm ? filteredEmployeesData : employees;

  const paginatedData = paginateData(
    dataToShow,
    currentPage.employees,
    pageSize.employees
  );

  paginatedData.forEach((employee) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${employee.emp_id || ""}</td>
            <td>${employee.emp_name || ""}</td>
            <td>${employee.title || ""}</td>
            <td>${employee.hire_date || ""}</td>
            <td>
                <div class="btn-group">
                    <button onclick="editEmployee(${
                      employee.emp_id
                    })" class="btn btn-outline-primary btn-edit-employee" data-emp-id="${
      employee.emp_id
    }">編輯</button>
                    <button onclick="showDeleteConfirm(${employee.emp_id}, '${(
      employee.emp_name || ""
    ).replace(
      /'/g,
      "\\'"
    )}')" class="btn btn-outline-danger btn-delete-employee" data-emp-id="${
      employee.emp_id
    }">刪除</button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });

  renderPagination(
    dataToShow.length,
    currentPage.employees,
    pageSize.employees,
    "pagination-employees",
    "pagination-info-employees",
    "employees"
  );
}

// 全域變數：儲存當前要編輯或刪除的 ID
let currentEmployeeId = null;
let currentProductId = null;
let currentSaleId = null;
let employeesData = [];
let productsData = [];
let salesData = [];

// 篩選相關變數
let filteredEmployeesData = [];
let filteredProductsData = [];
let filteredSalesData = [];

// 分頁相關變數
let currentPage = {
  employees: 1,
  products: 1,
  sales: 1,
};
let pageSize = {
  employees: 10,
  products: 10,
  sales: 10,
};

// 初始化員工頁面的事件監聽
function initEmployeePage() {
  const pageType = getCurrentPageType();
  if (pageType !== "employees") return;

  const btnAddEmployee = document.getElementById("btn-add-employee");
  if (btnAddEmployee) {
    btnAddEmployee.addEventListener("click", function () {
      openEmployeeModal();
    });
  }

  const btnSaveEmployee = document.getElementById("btn-save-employee");
  if (btnSaveEmployee) {
    btnSaveEmployee.addEventListener("click", function () {
      saveEmployee();
    });
  }

  const btnConfirmDelete = document.getElementById("btn-confirm-delete");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", function () {
      confirmDeleteEmployee();
    });
  }

  const pageSizeSelect = document.getElementById("pageSize-employees");
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", function () {
      pageSize.employees = parseInt(this.value);
      currentPage.employees = 1;
      refreshTable("employees");
    });
  }

  // 搜尋功能
  const searchInput = document.getElementById("search-employees");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterEmployees();
    });
  }

  const clearSearchBtn = document.getElementById("btn-clear-search-employees");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
      document.getElementById("search-employees").value = "";
      filterEmployees();
    });
  }
}

// 打開新增/編輯員工 Modal
function openEmployeeModal(empId = null) {
  const modal = new bootstrap.Modal(document.getElementById("employeeModal"));
  const modalTitle = document.getElementById("employeeModalLabel");
  const form = document.getElementById("employeeForm");

  form.reset();
  document.getElementById("emp_id").value = "";

  if (empId) {
    modalTitle.textContent = "編輯員工";
    const employee = employeesData.find((emp) => emp.emp_id == empId);
    if (employee) {
      document.getElementById("emp_id").value = employee.emp_id;
      document.getElementById("emp_name").value = employee.emp_name || "";
      document.getElementById("title").value = employee.title || "";
      document.getElementById("hire_date").value = employee.hire_date || "";
    }
    currentEmployeeId = empId;
  } else {
    modalTitle.textContent = "新增員工";
    currentEmployeeId = null;
  }

  modal.show();
}

// 編輯員工
function editEmployee(empId) {
  openEmployeeModal(empId);
}

// 顯示刪除確認 Modal
function showDeleteConfirm(empId, empName) {
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  const deleteInfo = document.getElementById("deleteEmployeeInfo");

  currentEmployeeId = empId;
  deleteInfo.textContent = `員工：${empName} (ID: ${empId})`;

  modal.show();
}

// 確認刪除員工
async function confirmDeleteEmployee() {
  if (!currentEmployeeId) return;

  try {
    const response = await fetch(
      `api.php?do=delete_employee&emp_id=${currentEmployeeId}`
    );
    const result = await response.json();

    if (result.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deleteConfirmModal")
      );
      modal.hide();
      await reloadEmployeeData();
      showNotification("員工已成功刪除！", "success");
    } else {
      // 顯示詳細的錯誤訊息
      const errorMsg = result.error || "刪除失敗，請稍後再試。";
      showNotification(errorMsg, "error");
    }
  } catch (error) {
    console.error("刪除員工失敗:", error);
    showNotification("刪除失敗，請稍後再試。", "error");
  }
}

// 儲存員工（新增或更新）
async function saveEmployee() {
  const form = document.getElementById("employeeForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const empId = document.getElementById("emp_id").value;
  const empName = document.getElementById("emp_name").value;
  const title = document.getElementById("title").value;
  const hireDate = document.getElementById("hire_date").value;

  try {
    let url;
    if (empId) {
      url = `api.php?do=update_employee&emp_id=${empId}&emp_name=${encodeURIComponent(
        empName
      )}&title=${encodeURIComponent(title)}&hire_date=${encodeURIComponent(
        hireDate
      )}`;
    } else {
      url = `api.php?do=add_employee&emp_name=${encodeURIComponent(
        empName
      )}&title=${encodeURIComponent(title)}&hire_date=${encodeURIComponent(
        hireDate
      )}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("employeeModal")
      );
      modal.hide();
      await reloadEmployeeData();
      showNotification(
        empId ? "員工資料已成功更新！" : "員工已成功新增！",
        "success"
      );
    } else {
      showNotification("儲存失敗，請稍後再試。", "error");
    }
  } catch (error) {
    console.error("儲存員工失敗:", error);
    showNotification("儲存失敗，請稍後再試。", "error");
  }
}

// 重新載入員工資料
async function reloadEmployeeData() {
  const data = await fetchDataFromAPI("get_employees");
  if (data) {
    currentPage.employees = 1;
    employeesData = data;
    fillEmployeeTable(data);
  }
}

// 更新 handlePageData 函數以儲存員工資料
function handlePageData(pageType, data) {
  switch (pageType) {
    case "employees":
      currentPage.employees = 1;
      if (data && data.length > 0) {
        console.log("員工資料:", data);
        employeesData = data;
        fillEmployeeTable(data);
      } else {
        employeesData = [];
        fillEmployeeTable([]);
      }
      break;
    case "products":
      currentPage.products = 1;
      if (data && data.length > 0) {
        console.log("產品資料:", data);
        productsData = data;
        fillProductTable(data);
      } else {
        productsData = [];
        fillProductTable([]);
      }
      break;
    case "sales":
      currentPage.sales = 1;
      if (data && data.length > 0) {
        console.log("銷售資料:", data);
        salesData = data;
        fillSaleTable(data);
      } else {
        salesData = [];
        fillSaleTable([]);
      }
      break;
    case "reports":
      if (data && data.length > 0) {
        console.log("報表資料:", data);
      }
      break;
  }
}

// 填充產品表格
function fillProductTable(products) {
  const table = document.getElementById("table-products");
  if (!table) return;

  const tableBody = table.querySelector("tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  // 使用篩選後的數據
  const dataToShow = filteredProductsData.length > 0 ? filteredProductsData : products;

  const paginatedData = paginateData(
    dataToShow,
    currentPage.products,
    pageSize.products
  );

  paginatedData.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.product_id || ""}</td>
            <td>${product.product_name || ""}</td>
            <td>$${parseFloat(product.unit_price || 0).toFixed(2)}</td>
            <td>
                <div class="btn-group">
                    <button onclick="editProduct(${
                      product.product_id
                    })" class="btn btn-outline-primary">編輯</button>
                    <button onclick="showDeleteProductConfirm(${
                      product.product_id
                    }, '${(product.product_name || "").replace(
      /'/g,
      "\\'"
    )}')" class="btn btn-outline-danger">刪除</button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });

  renderPagination(
    dataToShow.length,
    currentPage.products,
    pageSize.products,
    "pagination-products",
    "pagination-info-products",
    "products"
  );
}

// 填充銷售表格
function fillSaleTable(sales) {
  const table = document.getElementById("table-sales");
  if (!table) return;

  const tableBody = table.querySelector("tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  // 使用篩選後的數據
  const dataToShow = filteredSalesData.length > 0 ? filteredSalesData : sales;

  const paginatedData = paginateData(dataToShow, currentPage.sales, pageSize.sales);

  paginatedData.forEach((sale) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${sale.sale_id || ""}</td>
            <td>${sale.empName || ""}</td>
            <td>${sale.productName || ""}</td>
            <td>${sale.quantity || ""}</td>
            <td>${sale.sale_date || ""}</td>
            <td>
                <div class="btn-group">
                    <button onclick="editSale(${
                      sale.sale_id
                    })" class="btn btn-outline-primary">編輯</button>
                    <button onclick="showDeleteSaleConfirm(${
                      sale.sale_id
                    })" class="btn btn-outline-danger">刪除</button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });

  renderPagination(
    dataToShow.length,
    currentPage.sales,
    pageSize.sales,
    "pagination-sales",
    "pagination-info-sales",
    "sales"
  );
}

// 初始化產品頁面的事件監聽
function initProductPage() {
  const pageType = getCurrentPageType();
  if (pageType !== "products") return;

  const btnAddProduct = document.getElementById("btn-add-product");
  if (btnAddProduct) {
    btnAddProduct.addEventListener("click", function () {
      openProductModal();
    });
  }

  const btnSaveProduct = document.getElementById("btn-save-product");
  if (btnSaveProduct) {
    btnSaveProduct.addEventListener("click", function () {
      saveProduct();
    });
  }

  const btnConfirmDelete = document.getElementById(
    "btn-confirm-delete-product"
  );
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", function () {
      confirmDeleteProduct();
    });
  }

  const pageSizeSelect = document.getElementById("pageSize-products");
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", function () {
      pageSize.products = parseInt(this.value);
      currentPage.products = 1;
      refreshTable("products");
    });
  }

  // 搜尋功能
  const searchInput = document.getElementById("search-products");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterProducts();
    });
  }

  const clearSearchBtn = document.getElementById("btn-clear-search-products");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
      document.getElementById("search-products").value = "";
      filterProducts();
    });
  }
}

// 初始化銷售頁面的事件監聽
function initSalePage() {
  const pageType = getCurrentPageType();
  if (pageType !== "sales") return;

  const btnAddSale = document.getElementById("btn-add-sale");
  if (btnAddSale) {
    btnAddSale.addEventListener("click", function () {
      openSaleModal();
    });
  }

  const btnSaveSale = document.getElementById("btn-save-sale");
  if (btnSaveSale) {
    btnSaveSale.addEventListener("click", function () {
      saveSale();
    });
  }

  const btnConfirmDelete = document.getElementById("btn-confirm-delete-sale");
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener("click", function () {
      confirmDeleteSale();
    });
  }

  const pageSizeSelect = document.getElementById("pageSize-sales");
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", function () {
      pageSize.sales = parseInt(this.value);
      currentPage.sales = 1;
      refreshTable("sales");
    });
  }

  // 載入員工和產品選項
  loadEmployeesForSaleFilter();
  loadProductsForSaleFilter();

  // 搜尋和篩選功能
  const searchInput = document.getElementById("search-sales");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterSales();
    });
  }

  const filterEmployee = document.getElementById("filter-employee-sales");
  if (filterEmployee) {
    filterEmployee.addEventListener("change", function () {
      filterSales();
    });
  }

  const filterProduct = document.getElementById("filter-product-sales");
  if (filterProduct) {
    filterProduct.addEventListener("change", function () {
      filterSales();
    });
  }

  const clearSearchBtn = document.getElementById("btn-clear-search-sales");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
      document.getElementById("search-sales").value = "";
      document.getElementById("filter-employee-sales").value = "";
      document.getElementById("filter-product-sales").value = "";
      filterSales();
    });
  }
}

// 產品相關函數
function openProductModal(productId = null) {
  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  const modalTitle = document.getElementById("productModalLabel");
  const form = document.getElementById("productForm");

  form.reset();
  document.getElementById("product_id").value = "";

  if (productId) {
    modalTitle.textContent = "編輯產品";
    const product = productsData.find((p) => p.product_id == productId);
    if (product) {
      document.getElementById("product_id").value = product.product_id;
      document.getElementById("product_name").value =
        product.product_name || "";
      document.getElementById("unit_price").value = product.unit_price || "";
    }
    currentProductId = productId;
  } else {
    modalTitle.textContent = "新增產品";
    currentProductId = null;
  }

  modal.show();
}

function editProduct(productId) {
  openProductModal(productId);
}

function showDeleteProductConfirm(productId, productName) {
  const modal = new bootstrap.Modal(
    document.getElementById("deleteProductConfirmModal")
  );
  const deleteInfo = document.getElementById("deleteProductInfo");

  currentProductId = productId;
  deleteInfo.textContent = `產品：${productName} (ID: ${productId})`;

  modal.show();
}

async function confirmDeleteProduct() {
  if (!currentProductId) return;

  try {
    const response = await fetch(
      `api.php?do=delete_product&product_id=${currentProductId}`
    );
    const result = await response.json();

    if (result.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deleteProductConfirmModal")
      );
      modal.hide();
      await reloadProductData();
      showNotification("產品已成功刪除！", "success");
    } else {
      // 顯示詳細的錯誤訊息
      const errorMsg = result.error || "刪除失敗，請稍後再試。";
      showNotification(errorMsg, "error");
    }
  } catch (error) {
    console.error("刪除產品失敗:", error);
    showNotification("刪除失敗，請稍後再試。", "error");
  }
}

async function saveProduct() {
  const form = document.getElementById("productForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const productId = document.getElementById("product_id").value;
  const productName = document.getElementById("product_name").value;
  const unitPrice = document.getElementById("unit_price").value;

  try {
    let url;
    if (productId) {
      url = `api.php?do=update_product&product_id=${productId}&product_name=${encodeURIComponent(
        productName
      )}&unit_price=${encodeURIComponent(unitPrice)}`;
    } else {
      url = `api.php?do=add_product&product_name=${encodeURIComponent(
        productName
      )}&unit_price=${encodeURIComponent(unitPrice)}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("productModal")
      );
      modal.hide();
      await reloadProductData();
      showNotification(
        productId ? "產品資料已成功更新！" : "產品已成功新增！",
        "success"
      );
    } else {
      showNotification("儲存失敗，請稍後再試。", "error");
    }
  } catch (error) {
    console.error("儲存產品失敗:", error);
    showNotification("儲存失敗，請稍後再試。", "error");
  }
}

async function reloadProductData() {
  const data = await fetchDataFromAPI("get_products");
  if (data) {
    currentPage.products = 1;
    productsData = data;
    fillProductTable(data);
  }
}

// 銷售相關函數
async function openSaleModal(saleId = null) {
  const modal = new bootstrap.Modal(document.getElementById("saleModal"));
  const modalTitle = document.getElementById("saleModalLabel");
  const form = document.getElementById("saleForm");

  await loadEmployeesForSale();
  await loadProductsForSale();

  form.reset();
  document.getElementById("sale_id").value = "";

  if (saleId) {
    modalTitle.textContent = "編輯銷售";
    const sale = salesData.find((s) => s.sale_id == saleId);
    if (sale) {
      document.getElementById("sale_id").value = sale.sale_id;
      document.getElementById("emp_id").value = sale.emp_id || "";
      document.getElementById("product_id").value = sale.product_id || "";
      document.getElementById("quantity").value = sale.quantity || "";
      document.getElementById("sale_date").value = sale.sale_date || "";
    }
    currentSaleId = saleId;
  } else {
    modalTitle.textContent = "新增銷售";
    currentSaleId = null;
  }

  modal.show();
}

async function loadEmployeesForSale() {
  const empSelect = document.getElementById("emp_id");
  if (!empSelect) return;

  const data = await fetchDataFromAPI("get_employees");
  if (data) {
    const currentValue = empSelect.value;
    empSelect.innerHTML = '<option value="">請選擇員工</option>';
    data.forEach((emp) => {
      const option = document.createElement("option");
      option.value = emp.emp_id;
      option.textContent = `${emp.emp_name} (ID: ${emp.emp_id})`;
      empSelect.appendChild(option);
    });
    if (currentValue) {
      empSelect.value = currentValue;
    }
  }
}

async function loadEmployeesForReport5() {
  const empSelect = document.getElementById("empFilter-report5");
  if (!empSelect) return Promise.resolve();

  const data = await fetchDataFromAPI("get_employees");
  if (data) {
    const currentValue = empSelect.value;
    empSelect.innerHTML = '<option value="">全部員工</option>';
    data.forEach((emp) => {
      const option = document.createElement("option");
      option.value = emp.emp_id;
      option.textContent = `${emp.emp_name}`;
      empSelect.appendChild(option);
    });
    if (currentValue) {
      empSelect.value = currentValue;
    }
  }
  return Promise.resolve();
}

let topProductsChart = null;

function renderTopProductsChart(topProducts) {
  const ctx = document.getElementById("topProductsChart");
  if (!ctx) return;

  if (topProductsChart) {
    topProductsChart.destroy();
  }

  const labels = topProducts.map((p) => p["產品名稱"] || "未知");
  const values = topProducts.map((p) => parseFloat(p["銷售額"] || 0));

  const colors = [
    "rgba(255, 206, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
  ];

  topProductsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "銷售額",
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors
            .slice(0, labels.length)
            .map((c) => c.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                "銷售額: $" +
                context.parsed.y.toLocaleString("zh-TW", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              );
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return (
                "$" +
                value.toLocaleString("zh-TW", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              );
            },
          },
        },
      },
    },
  });
}

async function loadProductsForSale() {
  const productSelect = document.getElementById("product_id");
  if (!productSelect) return;

  const data = await fetchDataFromAPI("get_products");
  if (data) {
    const currentValue = productSelect.value;
    productSelect.innerHTML = '<option value="">請選擇產品</option>';
    data.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.product_id;
      option.textContent = `${product.product_name} (ID: ${product.product_id})`;
      productSelect.appendChild(option);
    });
    if (currentValue) {
      productSelect.value = currentValue;
    }
  }
}

function editSale(saleId) {
  openSaleModal(saleId);
}

function showDeleteSaleConfirm(saleId) {
  const modal = new bootstrap.Modal(
    document.getElementById("deleteSaleConfirmModal")
  );
  const deleteInfo = document.getElementById("deleteSaleInfo");

  currentSaleId = saleId;
  deleteInfo.textContent = `銷售記錄 ID: ${saleId}`;

  modal.show();
}

async function confirmDeleteSale() {
  if (!currentSaleId) return;

  try {
    const response = await fetch(
      `api.php?do=delete_sale&sale_id=${currentSaleId}`
    );
    const result = await response.json();

    if (result.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deleteSaleConfirmModal")
      );
      modal.hide();
      await reloadSaleData();
      showNotification("銷售記錄已成功刪除！", "success");
    } else {
      showNotification("刪除失敗，請稍後再試。", "error");
    }
  } catch (error) {
    console.error("刪除銷售記錄失敗:", error);
    showNotification("刪除失敗，請稍後再試。", "error");
  }
}

async function saveSale() {
  const form = document.getElementById("saleForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const saleId = document.getElementById("sale_id").value;
  const empId = document.getElementById("emp_id").value;
  const productId = document.getElementById("product_id").value;
  const quantity = document.getElementById("quantity").value;
  const saleDate = document.getElementById("sale_date").value;

  try {
    let url;
    if (saleId) {
      url = `api.php?do=update_sale&sale_id=${saleId}&emp_id=${encodeURIComponent(
        empId
      )}&product_id=${encodeURIComponent(
        productId
      )}&quantity=${encodeURIComponent(
        quantity
      )}&sale_date=${encodeURIComponent(saleDate)}`;
    } else {
      url = `api.php?do=add_sale&emp_id=${encodeURIComponent(
        empId
      )}&product_id=${encodeURIComponent(
        productId
      )}&quantity=${encodeURIComponent(
        quantity
      )}&sale_date=${encodeURIComponent(saleDate)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON 解析失敗，響應內容:", text);
      throw new Error("伺服器返回了無效的 JSON 格式。可能是 PHP 錯誤。");
    }

    if (result.success) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("saleModal")
      );
      modal.hide();
      await reloadSaleData();
      showNotification(
        saleId ? "銷售記錄已成功更新！" : "銷售記錄已成功新增！",
        "success"
      );
    } else {
      showNotification("儲存失敗，請稍後再試。", "error");
    }
  } catch (error) {
    console.error("儲存銷售記錄失敗:", error);
    showNotification("儲存失敗：" + error.message, "error");
  }
}

async function reloadSaleData() {
  const data = await fetchDataFromAPI("get_sales");
  if (data) {
    currentPage.sales = 1;
    salesData = data;
    fillSaleTable(data);
  }
}

// 報表相關函數
let reportChart = null;

// 獲取排名圖標
function getRankIcon(rank) {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "🏅";
  }
}

function initReportPage() {
  const pageType = getCurrentPageType();
  if (pageType !== "reports") return;

  const btnLoadReport = document.getElementById("btn-load-report");
  if (btnLoadReport) {
    btnLoadReport.addEventListener("click", function () {
      loadReport();
    });
  }

  const reportType = document.getElementById("reportType");
  if (reportType) {
    reportType.addEventListener("change", function () {
      if (this.value) {
        loadReport();
      }
    });
  }
}

async function loadReport() {
  const reportType = document.getElementById("reportType").value;
  if (!reportType) {
    showNotification("請選擇報表類型", "warning");
    return;
  }

  try {
    let url = `api.php?do=get_reports&report_type=${reportType}`;

    // 如果是報表類型5，添加員工篩選參數
    if (reportType === "5") {
      const empFilter = document.getElementById("empFilter-report5");
      if (empFilter && empFilter.value) {
        url += `&emp_id=${empFilter.value}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }
    const responseData = await response.json();

    // 處理新的數據結構（包含 data、average、stats）
    let data, average, stats;
    if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
      average = responseData.average;
      stats = responseData.stats;
    } else if (Array.isArray(responseData)) {
      data = responseData;
      average = null;
      stats = null;
    } else {
      data = [];
      average = null;
      stats = null;
    }

    if (data && data.length > 0) {
      await displayReport(data, reportType, average, stats);
    } else {
      showReportEmpty();
    }
  } catch (error) {
    console.error("載入報表失敗:", error);
    showNotification("載入報表失敗，請稍後再試。", "error");
  }
}

async function displayReport(data, reportType, average = null, stats = null) {
  const reportContent = document.getElementById("reportContent");
  if (!reportContent) return;

  if (reportChart) {
    reportChart.destroy();
    reportChart = null;
  }

  let title = "";
  let chartType = "bar";
  let labels = [];
  let values = [];
  let isTable = false;

  switch (reportType) {
    case "1":
      title = "每個員工的銷售數量";
      labels = data.map((item) => item["員工姓名"] || "未知");
      values = data.map((item) => parseInt(item["銷售數量"] || 0));
      break;
    case "2":
      title = "每個產品的銷售數量";
      labels = data.map((item) => item["產品名稱"] || "未知");
      values = data.map((item) => parseInt(item["銷售數量"] || 0));
      chartType = "pie";
      break;
    case "3":
      title = "每位員工銷售平均數量";
      labels = data.map((item) => item["員工姓名"] || "未知");
      values = data.map((item) => parseFloat(item["平均銷售數量"] || 0));
      break;
    case "4":
      title = "每種產品平均銷售數量";
      labels = data.map((item) => item["產品名稱"] || "未知");
      values = data.map((item) => parseFloat(item["平均銷售數量"] || 0));
      chartType = "pie";
      break;
    case "5":
      title = "員工銷售紀錄資料";
      isTable = true;
      break;
    case "6":
      title = "必推銷售產品（前五名）";
      labels = data.map((item) => item["產品名稱"] || "未知");
      values = data.map((item) => parseFloat(item["銷售額"] || 0));
      break;
  }

  if (isTable) {
    // 報表類型5：員工銷售紀錄資料（帶篩選和統計）
    if (reportType === "5") {
      // 先載入員工列表
      const employeesData = await fetchDataFromAPI("get_employees");

      // 獲取當前選中的員工ID（如果存在）
      const currentEmpFilter = document.getElementById("empFilter-report5");
      const selectedEmpId = currentEmpFilter ? currentEmpFilter.value : "";

      let employeeOptions = '<option value="">全部員工</option>';
      if (employeesData && employeesData.length > 0) {
        employeesData.forEach((emp) => {
          const selected =
            selectedEmpId === String(emp.emp_id) ? " selected" : "";
          employeeOptions += `<option value="${emp.emp_id}"${selected}>${emp.emp_name}</option>`;
        });
      }

      let statsHtml = "";
      let chartHtml = "";

      // 統計資訊卡片
      if (stats) {
        const avgSales = parseFloat(stats["平均銷售額"] || 0);
        const totalSales = parseFloat(stats["總銷售額"] || 0);
        const salesCount = parseInt(stats["銷售筆數"] || 0);

        statsHtml = `
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2">平均銷售額</h6>
                                    <h3 class="card-title">$${avgSales.toLocaleString(
                                      "zh-TW",
                                      {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }
                                    )}</h3>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2">總銷售額</h6>
                                    <h3 class="card-title">$${totalSales.toLocaleString(
                                      "zh-TW",
                                      {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }
                                    )}</h3>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <h6 class="card-subtitle mb-2">銷售筆數</h6>
                                    <h3 class="card-title">${salesCount}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        // 最大宗商品圖表
        if (stats.top_products && stats.top_products.length > 0) {
          const topProductLabels = stats.top_products.map(
            (p) => p["產品名稱"] || "未知"
          );
          const topProductValues = stats.top_products.map((p) =>
            parseFloat(p["銷售額"] || 0)
          );

          chartHtml = `
                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="mb-0">銷售最大宗商品（前5名）</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-12 col-lg-8">
                                                <canvas id="topProductsChart"></canvas>
                                            </div>
                                            <div class="col-12 col-lg-4">
                                                <div class="table-responsive">
                                                    <table class="table table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>排名</th>
                                                                <th>產品名稱</th>
                                                                <th>銷售額</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${topProductLabels
                                                              .map(
                                                                (
                                                                  label,
                                                                  index
                                                                ) => {
                                                                  const rank =
                                                                    index + 1;
                                                                  const rankIcon =
                                                                    getRankIcon(
                                                                      rank
                                                                    );
                                                                  return `
                                                                <tr>
                                                                    <td><strong>${rankIcon} ${rank}</strong></td>
                                                                    <td>${label}</td>
                                                                    <td>$${topProductValues[
                                                                      index
                                                                    ].toLocaleString(
                                                                      "zh-TW",
                                                                      {
                                                                        minimumFractionDigits: 0,
                                                                        maximumFractionDigits: 0,
                                                                      }
                                                                    )}</td>
                                                                </tr>
                                                            `;
                                                                }
                                                              )
                                                              .join("")}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        }
      }

      reportContent.innerHTML = `
                <div class="card mb-4">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">${title}</h5>
                            <div class="d-flex align-items-center gap-2">
                                <label for="empFilter-report5" class="form-label mb-0">篩選員工：</label>
                                <select class="form-select form-select-sm" id="empFilter-report5" style="width: 200px;">
                                    ${employeeOptions}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        ${statsHtml}
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>員工姓名</th>
                                        <th>產品名稱</th>
                                        <th>銷售數量</th>
                                        <th>銷售額</th>
                                        <th>銷售日期</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data
                                      .map(
                                        (item) => `
                                        <tr>
                                            <td>${item["員工姓名"] || ""}</td>
                                            <td>${item["產品名稱"] || ""}</td>
                                            <td>${item["銷售數量"] || ""}</td>
                                            <td>$${parseFloat(
                                              item["銷售額"] || 0
                                            ).toLocaleString("zh-TW", {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 0,
                                            })}</td>
                                            <td>${item["銷售日期"] || ""}</td>
                                        </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                        ${chartHtml}
                    </div>
                </div>
            `;

      // 綁定員工篩選事件
      setTimeout(() => {
        const empFilter = document.getElementById("empFilter-report5");
        if (empFilter) {
          // 直接綁定事件（每次重新生成HTML時會自動移除舊的）
          empFilter.onchange = function () {
            loadReport();
          };
        }
      }, 100);

      // 繪製最大宗商品圖表
      if (stats && stats.top_products && stats.top_products.length > 0) {
        setTimeout(() => {
          renderTopProductsChart(stats.top_products);
        }, 200);
      }
    } else {
      // 其他表格類型的報表
      reportContent.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">${title}</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>銷售編號</th>
                                        <th>員工姓名</th>
                                        <th>產品名稱</th>
                                        <th>銷售數量</th>
                                        <th>銷售日期</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data
                                      .map(
                                        (item) => `
                                        <tr>
                                            <td>${item["銷售編號"] || ""}</td>
                                            <td>${item["員工姓名"] || ""}</td>
                                            <td>${item["產品名稱"] || ""}</td>
                                            <td>${item["銷售數量"] || ""}</td>
                                            <td>${item["銷售日期"] || ""}</td>
                                        </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
    }
  } else {
    const chartColClass =
      chartType === "pie" ? "col-12 col-lg-5" : "col-12 col-lg-8";
    const tableColClass =
      chartType === "pie" ? "col-12 col-lg-7" : "col-12 col-lg-4";

    reportContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">${title}</h5>
                </div>
                <div class="card-body" style="position: relative;">
                    <div class="row">
                        <div class="${chartColClass}">
                            <div style="max-width: ${
                              chartType === "pie" ? "400px" : "100%"
                            }; margin: 0 auto;">
                                <canvas id="reportChart"></canvas>
                            </div>
                        </div>
                        <div class="${tableColClass}">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            ${
                                              reportType === "6"
                                                ? "<th>排名</th>"
                                                : ""
                                            }
                                            <th>名稱</th>
                                            <th>${
                                              reportType === "6"
                                                ? "銷售額"
                                                : "數值"
                                            }</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${labels
                                          .map((label, index) => {
                                            let value;
                                            if (reportType === "6") {
                                              // 銷售額格式化為貨幣
                                              value = `$${values[
                                                index
                                              ].toLocaleString("zh-TW", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                              })}`;
                                            } else {
                                              value =
                                                typeof values[index] ===
                                                  "number" &&
                                                values[index] % 1 !== 0
                                                  ? values[index].toFixed(2)
                                                  : values[index];
                                            }
                                            const rank = index + 1;
                                            const rankIcon =
                                              reportType === "6"
                                                ? getRankIcon(rank)
                                                : "";
                                            return `
                                            <tr>
                                                ${
                                                  reportType === "6"
                                                    ? `<td class="text-center"><strong>${rankIcon} ${rank}</strong></td>`
                                                    : ""
                                                }
                                                <td>${label}</td>
                                                <td>${value}</td>
                                            </tr>
                                        `;
                                          })
                                          .join("")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    ${
                      reportType === "6" && average !== null
                        ? `
                        <div style="position: absolute; bottom: 15px; right: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">平均銷售額</div>
                            <div style="font-size: 24px; font-weight: bold;">$${average.toLocaleString(
                              "zh-TW",
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }
                            )}</div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;

    const ctx = document.getElementById("reportChart");
    if (ctx) {
      const colors = [
        "rgba(255, 206, 86, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 99, 132, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
        "rgba(199, 199, 199, 0.8)",
        "rgba(83, 102, 255, 0.8)",
        "rgba(255, 99, 255, 0.8)",
        "rgba(99, 255, 132, 0.8)",
      ];

      const chartLabels =
        reportType === "6"
          ? labels.map(
              (label, index) =>
                `${getRankIcon(index + 1)} ${index + 1}. ${label}`
            )
          : labels;

      reportChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: title,
              data: values,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: colors
                .slice(0, labels.length)
                .map((c) => c.replace("0.8", "1")),
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: chartType === "pie" ? false : true,
          aspectRatio: chartType === "pie" ? 1 : undefined,
          animation: {
            duration: 1500,
            easing: "easeOutQuart",
          },
          plugins: {
            legend: {
              display: chartType === "pie",
              position: "bottom",
            },
            title: {
              display: false,
            },
          },
          scales:
            chartType === "bar"
              ? {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                }
              : {},
        },
      });
    }
  }
}

function showReportEmpty() {
  const reportContent = document.getElementById("reportContent");
  if (!reportContent) return;

  reportContent.innerHTML = `
        <div class="card">
            <div class="card-body text-center text-muted">
                <p class="mb-0">目前沒有資料</p>
            </div>
        </div>
    `;
}

// 員工篩選函數
function filterEmployees() {
  const searchInput = document.getElementById("search-employees");
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    filteredEmployeesData = [];
  } else {
    filteredEmployeesData = employeesData.filter((emp) => {
      const empName = (emp.emp_name || "").toLowerCase();
      const title = (emp.title || "").toLowerCase();
      return empName.includes(searchTerm) || title.includes(searchTerm);
    });
  }
  
  currentPage.employees = 1;
  fillEmployeeTable(employeesData);
}

// 產品篩選函數
function filterProducts() {
  const searchTerm = document.getElementById("search-products")?.value.toLowerCase() || "";
  
  if (!searchTerm) {
    filteredProductsData = [];
  } else {
    filteredProductsData = productsData.filter((product) => {
      const productName = (product.product_name || "").toLowerCase();
      return productName.includes(searchTerm);
    });
  }
  
  currentPage.products = 1;
  fillProductTable(productsData);
}

// 銷售篩選函數
function filterSales() {
  const searchTerm = document.getElementById("search-sales")?.value.toLowerCase() || "";
  const filterEmployee = document.getElementById("filter-employee-sales")?.value || "";
  const filterProduct = document.getElementById("filter-product-sales")?.value || "";
  
  const hasFilter = searchTerm || filterEmployee || filterProduct;
  
  if (!hasFilter) {
    filteredSalesData = [];
  } else {
    filteredSalesData = salesData.filter((sale) => {
      // 文字搜尋
      if (searchTerm) {
        const empName = (sale.empName || "").toLowerCase();
        const productName = (sale.productName || "").toLowerCase();
        if (!empName.includes(searchTerm) && !productName.includes(searchTerm)) {
          return false;
        }
      }
      
      // 員工篩選
      if (filterEmployee && String(sale.emp_id) !== filterEmployee) {
        return false;
      }
      
      // 產品篩選
      if (filterProduct && String(sale.product_id) !== filterProduct) {
        return false;
      }
      
      return true;
    });
  }
  
  currentPage.sales = 1;
  fillSaleTable(salesData);
}

// 載入員工選項到銷售篩選器
async function loadEmployeesForSaleFilter() {
  const select = document.getElementById("filter-employee-sales");
  if (!select) return;
  
  const data = await fetchDataFromAPI("get_employees");
  if (data && data.length > 0) {
    select.innerHTML = '<option value="">全部員工</option>';
    data.forEach((emp) => {
      const option = document.createElement("option");
      option.value = emp.emp_id;
      option.textContent = emp.emp_name;
      select.appendChild(option);
    });
  }
}

// 載入產品選項到銷售篩選器
async function loadProductsForSaleFilter() {
  const select = document.getElementById("filter-product-sales");
  if (!select) return;
  
  const data = await fetchDataFromAPI("get_products");
  if (data && data.length > 0) {
    select.innerHTML = '<option value="">全部產品</option>';
    data.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.product_id;
      option.textContent = product.product_name;
      select.appendChild(option);
    });
  }
}

// 更新 DOMContentLoaded 事件監聽器
document.addEventListener("DOMContentLoaded", function () {
  loadPageData().then((result) => {
    if (result) {
      handlePageData(result.pageType, result.data);
    }
  });

  initEmployeePage();
  initProductPage();
  initSalePage();
  initReportPage();
});
