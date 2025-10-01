document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return (window.location.href = "login.html");

  const username = currentUser.username; // use username to scope data
  const expensesKey = `expenses_${username}`;

  const form = document.getElementById("form");
  const recentTransactionsList = document.getElementById("recentTransactions");
  const categorySelect = document.getElementById("category");
  const totalExpenseEl = document.getElementById("totalExpense");
  const viewAllBtn = document.getElementById("viewAllBtn");

  const addCategoryContainer = document.getElementById("addCategoryContainer");
  const newCategoryInput = document.getElementById("newCategory");
  const addCategoryBtn = document.getElementById("addCategoryBtn");

  const menuButton = document.getElementById("menuButton");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  // Sidebar toggle
  menuButton?.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  });
  overlay?.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  });

  // Guest user logout
  document.querySelectorAll(".logout").forEach((btn) => {
    if (currentUser.role === "guest") {
      btn.textContent = "Login";
      btn.classList.remove("bg-red-600", "hover:bg-red-700");
      btn.classList.add("bg-blue-600", "text-white", "hover:bg-blue-500");
      btn.addEventListener(
        "click",
        () => (window.location.href = "login.html")
      );
    } else {
      btn.addEventListener("click", () => {
        localStorage.removeItem("rememberMe");
        window.location.href = "login.html";
      });
    }
  });

  // Default date
  const dateInput = document.getElementById("date");
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

  // Show add category if "Other" selected
  categorySelect?.addEventListener("change", () => {
    if (categorySelect.value === "Other") {
      addCategoryContainer.classList.remove("hidden");
    } else {
      addCategoryContainer.classList.add("hidden");
    }
  });

  // Add new category dynamically
  addCategoryBtn?.addEventListener("click", () => {
    const newCategory = newCategoryInput.value.trim();
    if (!newCategory) return alert("Enter a valid category name.");

    const existingCategories = Array.from(categorySelect.options).map((o) =>
      o.value.toLowerCase()
    );
    if (existingCategories.includes(newCategory.toLowerCase()))
      return alert("Category already exists.");

    const option = document.createElement("option");
    option.value = newCategory;
    option.textContent = newCategory;
    categorySelect.appendChild(option);

    categorySelect.value = newCategory;
    newCategoryInput.value = "";
    addCategoryContainer.classList.add("hidden");
    alert("Category added successfully!");
  });

  // Load recent transactions
  function loadRecentTransactions(limit = 5) {
    const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    recentTransactionsList.innerHTML = "";

    if (expenses.length === 0) {
      recentTransactionsList.innerHTML = `<li class="text-gray-500 text-center py-2">No recent transactions found.</li>`;
      totalExpenseEl.textContent = "₹0.00";
      return;
    }

    let total = 0;
    const validExpenses = expenses
      .slice(-limit)
      .reverse()
      .filter(
        (exp) => exp && typeof exp.amount === "number" && !isNaN(exp.amount)
      );

    if (validExpenses.length === 0) {
      recentTransactionsList.innerHTML = `<li class="text-gray-500 text-center py-2">No valid transactions found.</li>`;
      totalExpenseEl.textContent = "₹0.00";
      return;
    }

    validExpenses.forEach((exp) => {
      const amount = Number(exp.amount) || 0;
      total += amount;

      const li = document.createElement("li");
      li.classList.add(
        "py-2",
        "flex",
        "flex-col",
        "md:flex-row",
        "justify-between",
        "items-center"
      );
      li.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4">
          <span>${exp.date || "No date"} - ${
        exp.category || "Uncategorized"
      }</span>
          <span>${exp.description || "No description"}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-semibold text-red-600">₹${amount.toFixed(2)}</span>
          <button class="deleteBtn bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" data-id="${
            exp.id || "unknown"
          }">Delete</button>
        </div>
      `;
      recentTransactionsList.appendChild(li);
    });

    totalExpenseEl.textContent = `₹${total.toFixed(2)}`;
  }

  // Event delegation for delete buttons
  recentTransactionsList?.addEventListener("click", (e) => {
    if (!e.target.closest(".deleteBtn")) return;
    const btn = e.target.closest(".deleteBtn");
    const id = parseInt(btn.dataset.id);

    if (isNaN(id)) {
      console.error("Invalid expense ID:", btn.dataset.id);
      return;
    }

    let expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    expenses = expenses.filter((e) => e.id !== id);
    localStorage.setItem(expensesKey, JSON.stringify(expenses));
    loadRecentTransactions();
  });

  // Form submit
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) return (window.location.href = "login.html");
    if (!currentUser) {
      if (confirm("You are not logged in. Do you want to login?")) {
        window.location.href = "login.html";
        return;
      }
    } else if (currentUser.role === "guest") {
      if (
        confirm(
          "Guest users cannot add Savings. Click OK to login or Cancel to continue as guest."
        )
      ) {
        window.location.href = "login.html";
        return;
      } else {
        return; // guest cannot add income
      }
    }

    const date = dateInput.value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = categorySelect.value;
    const description = document.getElementById("description").value;

    if (!date || !amount || isNaN(amount) || !category)
      return alert("Please fill in all required fields with valid values.");

    const newExp = {
      id: Date.now(),
      date,
      amount: Number(amount),
      category,
      description,
    };

    const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    expenses.push(newExp);
    localStorage.setItem(expensesKey, JSON.stringify(expenses));

    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];
    loadRecentTransactions();
  });

  // View All
  viewAllBtn?.addEventListener("click", () => loadRecentTransactions(Infinity));

  // Cleanup invalid expenses for this user
  function cleanupInvalidExpenses() {
    const expenses = JSON.parse(localStorage.getItem(expensesKey)) || [];
    const validExpenses = expenses.filter(
      (exp) =>
        exp &&
        typeof exp.id !== "undefined" &&
        typeof exp.amount === "number" &&
        !isNaN(exp.amount)
    );

    if (validExpenses.length !== expenses.length) {
      localStorage.setItem(expensesKey, JSON.stringify(validExpenses));
    }
  }

  cleanupInvalidExpenses();
  loadRecentTransactions();
});
