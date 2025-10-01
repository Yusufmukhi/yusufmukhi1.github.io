document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const username = currentUser.username; // per-user storage key

  // ---------------- Logout buttons ----------------
  const logoutButtons = document.querySelectorAll("#logout");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("rememberMe");
      sessionStorage.clear();
      window.location.href = "login.html";
    });
    if (currentUser.role === "guest") {
      btn.textContent = "Login";
      btn.classList.remove("bg-red-600", "hover:bg-red-700");
      btn.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
    }
  });

  // ---------------- Mobile menu toggle ----------------
  const menuButton = document.getElementById("menuButton");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  menuButton?.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  });
  overlay?.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  });

  const validateAmount = (value) => parseFloat(value) || 0;

  // ---------------- Get user-specific data ----------------
  const getData = () => ({
    expenses: JSON.parse(localStorage.getItem(`expenses_${username}`)) || [],
    incomes: JSON.parse(localStorage.getItem(`incomes_${username}`)) || [],
    savings: JSON.parse(localStorage.getItem(`savings_${username}`)) || [],
    transactions:
      JSON.parse(localStorage.getItem(`transactions_${username}`)) || [],
  });

  // ---------------- Update dashboard totals ----------------
  function updateDashboard() {
    const { expenses, incomes, savings, transactions } = getData();

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + validateAmount(e.amount),
      0
    );
    const totalIncome = incomes.reduce(
      (sum, e) => sum + validateAmount(e.amount),
      0
    );
    const totalSavings = savings.reduce(
      (sum, e) => sum + validateAmount(e.amount),
      0
    );

    const networthsavings = savings.reduce((sum, l) => {
      if (l.completed) return sum;
      return l.type === "savingsOnly" ? sum + validateAmount(l.amount) : sum;
    }, 0);

    const totalTransactions = transactions.reduce((sum, t) => {
      if (t.completed) return sum;
      if (t.type === "taken") return sum + validateAmount(t.amount);
      if (t.type === "given") return sum - validateAmount(t.amount);
      return sum;
    }, 0);

    const netTransactions = totalTransactions; // fix undefined

    const netWorth =
      totalIncome +
      totalSavings +
      totalTransactions -
      totalExpenses -
      networthsavings;

    const currentMoney =
      totalIncome + totalTransactions - totalExpenses - networthsavings;

    // Save per-user current money
    localStorage.setItem(
      `currentMoney_${username}`,
      JSON.stringify(currentMoney)
    );
    document.querySelectorAll(".logout").forEach((btn) => {
      if (currentUser?.role === "guest") {
        btn.textContent = "Login";
        btn.classList.remove(
          "bg-red-600",
          "hover:bg-red-700",
          "hover:bg-gray-200"
        );
        btn.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
        btn.addEventListener(
          "click",
          () => (window.location.href = "login.html")
        );
      }
    });

    // Update DOM
    document.getElementById(
      "currentMoney"
    ).textContent = `₹${currentMoney.toFixed(2)}`;
    document.getElementById("netWorth").textContent = `₹${netWorth.toFixed(2)}`;
    document.getElementById(
      "totalExpenses"
    ).textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById(
      "totalIncome"
    ).textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById(
      "totalSavings"
    ).textContent = `₹${totalSavings.toFixed(2)}`;
    document.getElementById(
      "totalTransactions"
    ).textContent = `₹${netTransactions.toFixed(2)}`;
  }

  // ---------------- Load recent entries ----------------
  function loadRecentEntries(filter = "all") {
    const recentEntries = document.getElementById("recentEntries");
    recentEntries.innerHTML = "";

    let { expenses, incomes, savings, transactions } = getData();
    let entries = [];

    if (filter === "all" || filter === "expenses")
      entries = entries.concat(
        expenses.map((e) => ({ ...e, category: "expenses" }))
      );
    if (filter === "all" || filter === "incomes")
      entries = entries.concat(
        incomes.map((e) => ({ ...e, category: "incomes" }))
      );
    if (filter === "all" || filter === "savings")
      entries = entries.concat(
        savings.map((e) => ({ ...e, category: "savings" }))
      );
    if (filter === "all" || filter === "transactions")
      entries = entries.concat(
        transactions.map((e) => ({ ...e, category: "transactions" }))
      );

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (entries.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No entries found.";
      li.className = "text-gray-500 text-center py-2";
      recentEntries.appendChild(li);
      return;
    }

    entries.forEach((entry) => {
      if (!entry.id) {
        entry.id = Date.now() + Math.floor(Math.random() * 1000);

        // Persist ID back to localStorage
        let arr =
          JSON.parse(localStorage.getItem(`${entry.category}_${username}`)) ||
          [];
        const index = arr.findIndex(
          (e) => e.date === entry.date && e.amount === entry.amount
        );
        if (index !== -1) {
          arr[index].id = entry.id;
          localStorage.setItem(
            `${entry.category}_${username}`,
            JSON.stringify(arr)
          );
        }
      }

      const li = document.createElement("li");
      li.className =
        "py-2 flex flex-col md:flex-row justify-between items-center";
      li.innerHTML = `
        <div class="flex flex-col md:flex-row gap-4">
          <span class="font-medium">${entry.date || ""} - ${
        entry.category.charAt(0).toUpperCase() + entry.category.slice(1)
      }</span>
          <span>${entry.description || ""}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-semibold text-green-600">₹${validateAmount(
            entry.amount
          ).toFixed(2)}</span>
          <button class="deleteBtn bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" data-id="${
            entry.id
          }" data-category="${entry.category}">Delete</button>
        </div>
      `;
      recentEntries.appendChild(li);
    });

    // Attach delete functionality
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const category = btn.dataset.category;
        let arr =
          JSON.parse(localStorage.getItem(`${category}_${username}`)) || [];
        arr = arr.filter((item) => item.id !== id);
        localStorage.setItem(`${category}_${username}`, JSON.stringify(arr));

        // Reload dashboard & recent entries
        updateDashboard();
        loadRecentEntries(document.getElementById("entryFilter").value);
      });
    });
  }

  // ---------------- Filter dropdown ----------------
  document.getElementById("entryFilter").addEventListener("change", (e) => {
    loadRecentEntries(e.target.value);
  });

  // ---------------- Initial load ----------------
  updateDashboard();
  loadRecentEntries();
});
