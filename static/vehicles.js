// ---------------------------

const currentUser = JSON.parse(sessionStorage.getItem("user"));
if (!currentUser) {
  window.location.href = "/";
}
// API + SESSION
// ---------------------------
function logout() {
    sessionStorage.clear();
    window.location.href = "/";
  }
  
const API = window.location.origin;


// ---------------------------
// GLOBAL STATE
// ---------------------------

let vehicles = [];
let selectedVehicleId = null;
let statuses = [
  "פעיל","נמכר","הוצא משימוש","גויס","שוחרר",
  "בדרך לשחרור","נופק","זיכוי","הופץ - תקין",
  "הופץ - לא תקין","במוסך"
];

// ---------------------------
// INITIAL SETUP
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Show admin dashboard button only for admins
if (currentUser && currentUser.role === "admin") {
    document.getElementById("adminDashboardBtn").style.display = "inline-block";
  }
  
  setupPage();
  refreshTable();
});

function goToAdmin() {
    window.location.href = "/admin";
  }

  
function setupPage() {
  // Show admin-only UI if admin
  if (currentUser.role === "admin") {
    // enable form inputs/buttons
    ["license", "toolCode", "statusSelect"].forEach(id =>
      document.getElementById(id).disabled = false
    );
    ["addVehicle", "updateVehicle", "deleteVehicle"].forEach(fn => {
      const btn = document.querySelector(`button[onclick="${fn}()"]`);
      if (btn) btn.disabled = false;
    });
  } else {
    // hide/disable admin-only parts
    ["license", "toolCode", "statusSelect"].forEach(id =>
      document.getElementById(id).disabled = true
    );
    ["addVehicle", "updateVehicle", "deleteVehicle"].forEach(fn => {
      const btn = document.querySelector(`button[onclick="${fn}()"]`);
      if (btn) btn.disabled = true;
    });
  }

  // Populate status select
  refreshStatusOptions();
}

// ---------------------------
// POPULATE STATUS SELECT
// ---------------------------

function refreshStatusOptions() {
  const select = document.getElementById("statusSelect");
  if (!select) return;

  select.innerHTML = "";
  statuses.forEach(s => {
    const option = document.createElement("option");
    option.value = s;
    option.text = s;
    select.appendChild(option);
  });
}

// ---------------------------
// REFRESH VEHICLE TABLE
// ---------------------------

async function refreshTable() {

  const searchInput = document.getElementById("search");
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // 🔹 Fetch ALL vehicles (no ?q= anymore)
  const res = await fetch(`${API}/vehicles`, {
    credentials: "include"
  });

  let vehicles = await res.json();

  // 🔹 Filter on ALL columns including available_for_service
  if (searchValue) {
    vehicles = vehicles.filter(v => {
      const availableText = v.available_for_service
        ? "ניתן לגיוס"
        : "לא ניתן לגיוס";

      return (
        (v.id + "").includes(searchValue) ||
        (v.license_number || "").toLowerCase().includes(searchValue) ||
        (v.tool_code || "").toLowerCase().includes(searchValue) ||
        (v.status || "").toLowerCase().includes(searchValue) ||
        availableText.toLowerCase().includes(searchValue)
      );
    });
  }

  const tbody = document.querySelector("#vehicleTable tbody");
  if (!tbody) return console.warn("Table body not found");

  tbody.innerHTML = "";

  vehicles.forEach(v => {
    const tr = document.createElement("tr");
    tr.classList.add("vehicle-row");

    const availableText = v.available_for_service
      ? "ניתן לגיוס"
      : "לא ניתן לגיוס";

    const color = v.available_for_service ? "green" : "red";

    tr.innerHTML = `
      <td>${v.id}</td>
      <td>${v.license_number}</td>
      <td>${v.tool_code}</td>
      <td>${v.status}</td>
      <td style="color:${color}; font-weight:bold;">
        ${availableText}
      </td>
    `;

    tr.onclick = () => selectVehicle(tr, v.id);
    tbody.appendChild(tr);
  });
}


// ---------------------------
// CLEAR SEARCH
// ---------------------------

function clearSearch() {
  document.getElementById("search").value = "";
  refreshTable();
}

// ---------------------------
// SELECT VEHICLE & SHOW HISTORY
// ---------------------------

async function selectVehicle(row, id) {

    // If this row is already active → close it
    if (row.classList.contains("active")) {
  
      // Remove highlight
      row.classList.remove("active");
  
      // Remove history row right below
      if (row.nextSibling && row.nextSibling.classList.contains("history-row")) {
        row.nextSibling.remove();
      }
  
      selectedVehicleId = null;
      return; // STOP here
    }
  
    // Otherwise → close any other open history
    document.querySelectorAll(".vehicle-row.active").forEach(r => {
      r.classList.remove("active");
      if (r.nextSibling && r.nextSibling.classList.contains("history-row")) {
        r.nextSibling.remove();
      }
    });
  
    // Mark clicked row as active
    row.classList.add("active");
    selectedVehicleId = id;
  
    // Optional: fill form fields
    const v = vehicles.find(x => x.id === id);
    if (v) {
      document.getElementById("license").value = v.license_number;
      document.getElementById("toolCode").value = v.tool_code;
      document.getElementById("statusSelect").value = v.status;
    }
  
    // Fetch and display history
    try {
      const res = await fetch(`${API}/vehicles/${id}/history`, {
        credentials: "include"
      });
      const history = await res.json();
  
      const historyRow = document.createElement("tr");
      historyRow.classList.add("history-row");
  
      const td = document.createElement("td");
      td.colSpan = 5;
  
      if (history.length > 0) {
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        td.innerHTML = `
          <strong>היסטוריית רכב:</strong>
          <ul>
            ${history.map((h, i) => {
              const style = i === 0 ? "background:#d4edda;font-weight:bold;" : "";
              return `<li style="${style}">${h.timestamp} | סטטוס: ${h.status}</li>`;
            }).join("")}
          </ul>`;
      } else {
        td.innerHTML = "<em>אין היסטוריה לרכב זה</em>";
      }
  
      historyRow.appendChild(td);
      row.after(historyRow);
  
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }
  

// ---------------------------
// ADMIN CRUD FUNCTIONS
// ---------------------------

async function addVehicle() {
  if (currentUser.role !== "admin") return;

  const license = document.getElementById("license").value.trim();
  const toolCode = document.getElementById("toolCode").value.trim();
  const status = document.getElementById("statusSelect").value;

  if (!license || !toolCode || !status) {
    return alert("Please enter all fields");
  }

  await fetch(`${API}/vehicles`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ license_number: license, tool_code: toolCode, status })
  });

  clearForm();
  refreshTable();
}

async function updateVehicle() {
  if (currentUser.role !== "admin") return;
  if (!selectedVehicleId) return;

  const license = document.getElementById("license").value.trim();
  const toolCode = document.getElementById("toolCode").value.trim();
  const status = document.getElementById("statusSelect").value;

  await fetch(`${API}/vehicles/${selectedVehicleId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type":"application/json"},
    body: JSON.stringify({ license_number: license, tool_code: toolCode, status })
  });

  clearForm();
  refreshTable();
}

async function deleteVehicle() {
  if (currentUser.role !== "admin") return;
  if (!selectedVehicleId) return;

  if (!confirm("Delete this vehicle?")) return;

  await fetch(`${API}/vehicles/${selectedVehicleId}`, {
    method: "DELETE",
    credentials: "include"
  });

  clearForm();
  refreshTable();
}

// ---------------------------
// CLEAR FORM
// ---------------------------

function clearForm() {
  selectedVehicleId = null;
  document.getElementById("license").value = "";
  document.getElementById("toolCode").value = "";
  document.getElementById("statusSelect").selectedIndex = 0;
}


async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  if (!fileInput.files.length) {
    alert("Please select an Excel file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`${API}/upload_excel`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    alert("Excel uploaded successfully!");
    refreshTable();
    fileInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Failed to upload Excel");
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  // Get current user from session
  const currentUser = JSON.parse(sessionStorage.getItem("user"));

  // Redirect if no user (optional)
  if (!currentUser) {
    window.location.href = "/";
    return;
  }

  try {
    // Show Excel upload section only for admin
    const excelSection = document.getElementById("excelUploadSection");
    if (excelSection) {
      if (currentUser.role === "admin") {
        excelSection.style.display = "block";
      } else {
        excelSection.style.display = "none"; // hide for non-admin users
      }
    }

    // // Load vehicles table
    // await loadVehicles();  // table with colors
  } catch (err) {
    console.error("Error initializing vehicles page:", err);
  }
});
