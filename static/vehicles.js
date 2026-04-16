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
  "פעיל", "נמכר", "הוצא משימוש", "גויס", "שוחרר",
  "בדרך לשחרור", "נופק", "זיכוי", "הופץ - תקין",
  "הופץ - לא תקין", "במוסך"
];

// ---------------------------
// INITIAL SETUP
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Show admin dashboard button only for admins
  if (currentUser && currentUser.role === "admin") {
    document.getElementById("adminDashboardBtn").style.display = "inline-block";
  }
  const excelInput = document.getElementById("excelFile");
  const excelFileName = document.getElementById("excelFileName");
  const removeFileBtn = document.getElementById("removeFileBtn");
  excelInput.addEventListener("change", function () {
    if (excelInput.files.length > 0) {
      let name = excelInput.files[0].name;

      // Optionally, show only first 20-30 chars if very long
      if (name.length > 30) {
        name = name.substring(0, 27) + "...";
      }

      excelFileName.textContent = name;
      removeFileBtn.style.display = "inline-block"; 
    } else {
      excelFileName.textContent = ""; // no file selected
      removeFileBtn.style.display = "none"; 
    }
  });
  removeFileBtn.addEventListener("click", function () {
    excelInput.value = "";
    excelFileName.textContent = "";
    removeFileBtn.style.display = "none";
  });
  setupPage();
  refreshTable();
});
function disableAdminControls() {
  if (currentUser.role !== "admin") {
    document.querySelectorAll('.edit-btn, .delete-btn, .admin-controls')
      .forEach(el => el.classList.add("disabled"));
  }
}
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

let currentPageVehicles = 1;
const rowsPerPageVehicles = 10; // Adjust how many vehicles per page

async function refreshTable(page = 1) {
  const searchInput = document.getElementById("search");
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // 🔹 Fetch all vehicles
  const res = await fetch(`${API}/vehicles`, {
    credentials: "include"
  });
  let vehicles = await res.json();
  console.log(vehicles)

  // 🔹 Filter if search value
  if (searchValue) {
    vehicles = vehicles.filter(v => {
      const availableText = v.available_for_service ? "ניתן לגיוס" : "לא ניתן";
      return (
        (v.id + "").includes(searchValue) ||
        (v.license_number || "").toLowerCase().includes(searchValue) ||
        (v.tool_code || "").toLowerCase().includes(searchValue) ||
        (v.status || "").toLowerCase().includes(searchValue) ||
        (v.unitcode || "").toLowerCase().includes(searchValue) ||

        availableText.toLowerCase().includes(searchValue)
      );
    });
  }

  const tbody = document.querySelector("#vehicleTable tbody");
  if (!tbody) return console.warn("Table body not found");

  tbody.innerHTML = "";

  // 🔹 Pagination logic
  const totalPages = Math.ceil(vehicles.length / rowsPerPageVehicles);
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPageVehicles = page;

  const start = (page - 1) * rowsPerPageVehicles;
  const end = start + rowsPerPageVehicles;
  const vehiclesToRender = vehicles.slice(start, end);

  vehiclesToRender.forEach(v => {

    const tr = document.createElement("tr");
    tr.classList.add("vehicle-row");

    const availableText = v.available_for_service ? "ניתן" : "לא ניתן";
    const color = v.available_for_service ? "green" : "red";
// <td>${v.id}</td>
//      <td>${v.unitcode || ""}</td>

    tr.innerHTML = `
      <td>${v.license_number}</td>
      <td>${v.tool_code}</td>
      <td>${v.status}</td>
      <td style="color:${color}; font-weight:bold;">
        ${availableText}
      </td>
      <td class="row-actions">

<button class="edit-btn"
onclick='event.stopPropagation(); openVehicleModal2(${JSON.stringify(v)})'>
<i class="fas fa-pencil-alt"></i>
</button>

<button class="delete-btn"
        onclick="event.stopPropagation(); deleteVehicle('${v.id}')">
  <i class="fas fa-trash"></i>
</button>

</td>
    `;

    // ----- EDIT BUTTON ROW (hidden initially) -----
    const editRow = document.createElement("tr");
    editRow.classList.add("vehicle-edit-row");
    editRow.style.display = "none";

    editRow.innerHTML = `
    <td colspan="5">
    <button class="btn-edit-vehicle" onclick="openVehicleModal2()">ערוך</button>
  </td>
    `;

    // Edit button click
    // Edit button click
    editRow.querySelector("button").addEventListener("click", (ev) => {
      ev.stopPropagation(); // prevent row click

      // --- Mark the row as active like in selectVehicle ---
      document.querySelectorAll(".vehicle-row.active").forEach(r => r.classList.remove("active"));
      tr.classList.add("active");
      selectedVehicleId = v.id;

      // --- Optional: fill inputs in modal ---
      openVehicleModal(v);
    });

    // Row click
    tr.addEventListener("click", () => {

      // hide all edit rows
      document.querySelectorAll(".vehicle-edit-row").forEach(r => {
        r.style.display = "none";
      });

      // show this one
      // editRow.style.display = "table-row";

      // existing behavior
      document.getElementById("license").value = v.license_number;
      document.getElementById("toolCode").value = v.tool_code;
      document.getElementById("statusSelect").value = v.status;

      selectVehicle(tr, v.id);
    });

    tbody.appendChild(tr);
    tbody.appendChild(editRow);
    disableAdminControls();
  });


  //   const editBtn = tr.querySelector(".btn-edit");

  // editBtn.addEventListener("click", (ev) => {
  //   ev.stopPropagation(); // prevents row click
  //   openVehicleModal(v);
  // });

  //edit vehicle form
  function openVehicleModal(vehicle = null) {
    const form = document.getElementById("vehicleForm");
    if (form && typeof form.reset === "function") form.reset();

    document.getElementById("vehicleId").value = "";
    document.getElementById("vehicleModalTitle").textContent = "הוספת רכב ידנית או העלאת קובץ אקסל";

    // The select element
    const statusSelect = document.getElementById("statusSelect1");

    // Define all possible statuses
    const allStatuses = ["פעיל", "נמכר", "הוצא משימוש", "גויס", "שוחרר",
      "בדרך לשחרור", "נופק", "זיכוי", "הופץ - תקין",
      "הופץ - לא תקין", "במוסך"]; // add more if needed

    // Clear old options
    statusSelect.innerHTML = "";

    // Fill the select with all options
    allStatuses.forEach(s => {
      const option = document.createElement("option");
      option.value = s;
      option.textContent = s;
      statusSelect.appendChild(option);
    });

    if (vehicle) {
      document.getElementById("vehicleId").value = vehicle.id;
      document.getElementById("license1").value = vehicle.license_number || "";
      document.getElementById("toolCode1").value = vehicle.tool_code || "";
      document.getElementById("vehicleAvailable").checked = !!vehicle.available_for_service;

      // Set the current vehicle status as selected
      if (vehicle.status) {
        // If the status is not in the predefined list, add it
        if (!allStatuses.includes(vehicle.status)) {
          const opt = document.createElement("option");
          opt.value = vehicle.status;
          opt.textContent = vehicle.status;
          statusSelect.appendChild(opt);
        }
        statusSelect.value = vehicle.status;
      }

      document.getElementById("vehicleModalTitle").textContent = "עריכת רכב";
    }

    document.getElementById("vehicleModalOverlay").classList.add("active");
  }

  // ----- Close the modal -----
  function closeVehicleModal() {
    const overlay = document.getElementById("vehicleModalOverlay");
    if (overlay) overlay.classList.remove("active");
  }
  function closeVehicleModal2() {
    const overlay = document.getElementById("vehicleModalOverlay2");
    if (overlay) overlay.classList.remove("active");
  }

  // async function saveVehicle() {
  //   const id = document.getElementById("vehicleId").value;

  //   const payload = {
  //     license_number: document.getElementById("license").value.trim(),
  //     tool_code: document.getElementById("toolCode").value.trim(),
  //     status: document.getElementById("statusSelect").value,
  //     available_for_service: document.getElementById("vehicleAvailable").checked
  //   };

  //   const method = id ? "PUT" : "POST";
  //   const url = id ? `${API}/vehicles/${id}` : `${API}/vehicles`;

  //   try {
  //     const res = await fetch(url, {
  //       method,
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!res.ok) throw new Error();

  //     closeVehicleModal();
  //     loadVehicles(); // refresh table
  //   }
  //   catch (err) {
  //     alert("שמירת הרכב נכשלה");
  //   }
  // }





  // Fill form inputs when row clicked
  // tr.addEventListener("click", () => {
  //   document.getElementById("license").value = v.license_number;
  //   document.getElementById("toolCode").value = v.tool_code;
  //   document.getElementById("statusSelect").value = v.status;
  //   selectVehicle(tr, v.id);
  // });

  // tbody.appendChild(tr);


  // 🔹 Update pagination display
  document.querySelector(".pagination-container span").textContent = `${totalPages} / ${page}`;

  // Enable/disable buttons
  document.getElementById("prevPage").disabled = page <= 1;
  document.getElementById("nextPage").disabled = page >= totalPages;
}

function saveVehicle() {

  const vehicleId = document.getElementById("vehicleId").value;

  if (vehicleId) {
    updateVehicle();
  } else {
    addVehicle();
  }

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
  // 1. If this row is already active → close it
  if (row.classList.contains("active")) {
    row.classList.remove("active");
    if (row.nextSibling && row.nextSibling.classList.contains("history-row")) {
      row.nextSibling.remove();
    }
    selectedVehicleId = null;
    return;
  }

  // 2. Otherwise → close any other open history rows
  document.querySelectorAll(".vehicle-row.active").forEach(r => {
    r.classList.remove("active");
    if (r.nextSibling && r.nextSibling.classList.contains("history-row")) {
      r.nextSibling.remove();
    }
  });

  // 3. Mark clicked row as active
  row.classList.add("active");
  selectedVehicleId = id;

  // 4. Optional: fill form fields
  const v = vehicles.find(x => x.id === id);
  if (v) {
    document.getElementById("license").value = v.license_number;
    document.getElementById("toolCode").value = v.tool_code;
    document.getElementById("statusSelect").value = v.status;
  }

  // 5. Fetch and display history in a Table
  try {
    const res = await fetch(`${API}/vehicles/${id}/history`, {
      credentials: "include"
    });
    const history = await res.json();

    const historyRow = document.createElement("tr");
    historyRow.classList.add("history-row");

    const td = document.createElement("td");
    td.colSpan = 5; // Adjust based on your main table's column count
    td.style.backgroundColor = "#f9f9f9";

    if (history.length > 0) {
      // Sort: Newest first
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      td.innerHTML = `
          <div style="padding: 15px; direction: rtl; text-align: right;">
            <strong style="display: block; margin-bottom: 10px; font-size: 1.1em;">פירוט היסטוריית רכב:</strong>
            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd; border-radius: 4px;">
              <thead>
                <tr style="background: #ececec; border-bottom: 2px solid #ccc;">
                  <th style="padding: 10px; border-left: 1px solid #ddd;text-align;">תאריך</th>
                  <th style="padding: 10px; border-left: 1px solid #ddd;text-align;">שעה</th>
                  <th style="padding: 10px;text-align;">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                ${history.map((h, i) => {
        const dateObj = new Date(h.timestamp);
        const dateStr = dateObj.toLocaleDateString('he-IL');
        const timeStr = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Highlight the most recent row
        const rowStyle = i === 0
          ? "background: #d4edda; font-weight: bold; border-bottom: 1px solid #ddd;"
          : "border-bottom: 1px solid #eee;";

        return `
                    <tr style="${rowStyle}">
                      <td style="padding: 8px; border-left: 1px solid #eee;">${dateStr}</td>
                      <td style="padding: 8px; border-left: 1px solid #eee;">${timeStr}</td>
                      <td style="padding: 8px;">${h.status}</td>
                    </tr>`;
      }).join("")}
              </tbody>
            </table>
          </div>`;
    } else {
      td.innerHTML = `<div style="padding: 15px; direction: rtl; text-align: right;"><em>אין היסטוריה רשומה לרכב זה.</em></div>`;
    }

    historyRow.appendChild(td);
    row.after(historyRow);

  } catch (err) {
    console.error("Error fetching history:", err);
    alert("שגיאה בטעינת ההיסטוריה");
  }
}


// ---------------------------
// ADMIN CRUD FUNCTIONS
// ---------------------------

async function addVehicle() {
  if (currentUser.role !== "admin") return;

  const license = document.getElementById("license1").value.trim();
  const toolCode = document.getElementById("toolCode1").value.trim();
  const status = document.getElementById("statusSelect1").value;
  const unitcode = document.getElementById("unitcode").value;
  const available_for_service = document.getElementById("vehicleAvailable").checked;

  if (!license || !toolCode || !status) {
    return alert("Please enter all fields");
  }

  await fetch(`${API}/vehicles`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_number: license, unitcode, tool_code: toolCode, status, available_for_service })
  });
  closeVehicleModal();
  clearForm();
  refreshTable();
}
function closeVehicleModal1() {
  const overlay = document.getElementById("vehicleModalOverlay");
  if (overlay) overlay.classList.remove("active");
}
async function updateVehicle() {
  if (currentUser.role !== "admin") return;

  // Get the vehicle ID from the form input
  const vehicleId = document.getElementById("vehicleId").value;
  if (!vehicleId) return;

  const license = document.getElementById("license1").value.trim();
  const unitcode = document.getElementById("unitcode").value.trim();
  const toolCode = document.getElementById("toolCode1").value.trim();
  const status = document.getElementById("statusSelect1").value;
  const vehicleType=document.getElementById("vehicleType").value;
  const available_for_service = document.getElementById("vehicleAvailable").checked;
  await fetch(`${API}/vehicles/${vehicleId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_number: license, unitcode, tool_code: toolCode, status,vehicle_type: vehicleType, available_for_service })
  });

  closeVehicleModal();
  clearForm();
  refreshTable();
}

async function deleteVehicle(vehicleId = null) {
  if (currentUser.role !== "admin") return;

  // Use the passed ID or fallback to selectedVehicleId
  const idToDelete = vehicleId || selectedVehicleId;

  if (!idToDelete) return; // no vehicle selected

  if (!confirm("Delete this vehicle?")) return;

  await fetch(`${API}/vehicles/${idToDelete}`, {
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
  document.getElementById("license1").value = "";
  document.getElementById("toolCode1").value = "";
  document.getElementById("statusSelect1").selectedIndex = 0;
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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }
    closeVehicleModal();
    alert("Excel uploaded successfully!");
    refreshTable();
    fileInput.value = "";

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
} async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  const excelFileName = document.getElementById("excelFileName");

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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    alert("Excel uploaded successfully!");
    refreshTable();
    fileInput.value = "";
    excelFileName.textContent = "";

  } catch (err) {
    console.error(err);
    alert(err.message);
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


// Pagination for Vehicles page
// let currentPageVehicles = 1;
// const rowsPerPageVehicles = 10;

function showPageVehicles(page) {
  const tbody = document.querySelector("#vehicleTable tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const totalPages = Math.ceil(rows.length / rowsPerPageVehicles);

  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPageVehicles = page;

  // Hide all rows
  rows.forEach(row => row.style.display = "none");

  // Show rows for current page
  const start = (page - 1) * rowsPerPageVehicles;
  const end = start + rowsPerPageVehicles;
  rows.slice(start, end).forEach(row => row.style.display = "");

  // Update page number
  document.querySelector(".pagination-container span").textContent = page;
}

// Attach buttons
document.getElementById("prevPage").addEventListener("click", () => {
  refreshTable(currentPageVehicles - 1);
});

document.getElementById("nextPage").addEventListener("click", () => {
  refreshTable(currentPageVehicles + 1);
});

function nextPage() {

  const maxPage = Math.ceil(allEvents.length / rowsPerPage);

  if (currentPage < maxPage) {
    currentPage++;
    renderTable();
  }

}

function prevPage() {

  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }

}

//add vehicle form
function openVehicleModal(vehicle = null) {
  const form = document.getElementById("vehicleForm");
  if (form && typeof form.reset === "function") form.reset();

  document.getElementById("vehicleId").value = "";
  document.getElementById("vehicleModalTitle").textContent = "הוספת רכב ידנית או העלאת קובץ אקסל";
  document.getElementById('excelUploadSection').style.display='block';
  if (vehicle) {
    document.getElementById("vehicleId").value = vehicle.id;
    document.getElementById("license").value = vehicle.license_number || "";
    document.getElementById("toolCode").value = vehicle.tool_code || "";
    document.getElementById("statusSelect").value = vehicle.status || "";
    document.getElementById("vehicleAvailable").checked = !!vehicle.available_for_service;

    document.getElementById("vehicleModalTitle").textContent = "עריכת רכב";
  }

  document.getElementById("vehicleModalOverlay").style.display = "flex";
}

function closeVehicleModal() {
  const form = document.getElementById("vehicleForm1");
 
  if (form) {
    form.reset(); // clears all inputs
  }

  // clear hidden id
  document.getElementById("vehicleId").value = "";

  document.getElementById("vehicleModalOverlay").style.display = "none";
   const excelInput = document.getElementById("excelFile");
  const excelFileName = document.getElementById("excelFileName");
  const removeFileBtn = document.getElementById("removeFileBtn");
  excelInput.value = "";
  excelFileName.textContent = "";
  removeFileBtn.style.display = "none";
}

async function openVehicleModal2(vehicleOrId = null) {
  const form = document.getElementById("vehicleForm1");
  if (form && typeof form.reset === "function") form.reset();
  // The select element
  const statusSelect = document.getElementById("statusSelect1");
document.getElementById('excelUploadSection').style.display='none';
  // Define all possible statuses
  const allStatuses = ["פעיל", "נמכר", "הוצא משימוש", "גויס", "שוחרר",
    "בדרך לשחרור", "נופק", "זיכוי", "הופץ - תקין",
    "הופץ - לא תקין", "במוסך"]; // add more if needed

  // Clear old options
  statusSelect.innerHTML = "";

  // Fill the select with all options
  allStatuses.forEach(s => {
    const option = document.createElement("option");
    option.value = s;
    option.textContent = s;
    statusSelect.appendChild(option);
  });
  let vehicle = null;

  // 1. If an object is passed, use it
  if (vehicleOrId && typeof vehicleOrId === "object") {
    vehicle = vehicleOrId;
  }
  // 2. If an ID is passed, find the vehicle
  else if (vehicleOrId) {
    console.log(vehicles)
    vehicle = vehicles.find(v => v.id === vehicleOrId);
    if (!vehicle) {
      console.error("Vehicle not found:", vehicleOrId);
      return;
    }
  }
  // 3. If nothing passed, do nothing
  else {
    console.warn("No vehicle or ID passed to openVehicleModal2");
    return;
  }

  // 4. Fill form inputs exactly like selectVehicle
  document.getElementById("vehicleId").value = vehicle.id;
  document.getElementById("unitcode").value = vehicle.unitcode || "";
  document.getElementById("license1").value = vehicle.license_number || "";
  document.getElementById("toolCode1").value = vehicle.tool_code || "";
  document.getElementById("vehicleType").value=vehicle.vehicle_type || "";
  // document.getElementById("statusSelect1").value = vehicle.status || "";
  // Set the current vehicle status as selected
  if (vehicle.status) {
    // If the status is not in the predefined list, add it
    if (!allStatuses.includes(vehicle.status)) {
      const opt = document.createElement("option");
      opt.value = vehicle.status;
      opt.textContent = vehicle.status;
      statusSelect.appendChild(opt);
    }
    statusSelect.value = vehicle.status;
  }
  document.getElementById("vehicleAvailable").checked = !!vehicle.available_for_service;

  document.getElementById("vehicleModalTitle").textContent = "עריכת רכב";

  // 5. Show modal overlay
  document.getElementById("vehicleModalOverlay").style.display = "flex";
}
function clearVehicleForm() {
  const form = document.getElementById("vehicleForm1");
  if (form) form.reset();
}

const fileInput = document.getElementById("excelFile");
const fileName = document.getElementById("excelFileName");
const removeBtn = document.getElementById("removeFileBtn");

// // When selecting file
// fileInput.addEventListener("change", function () {
//   if (this.files.length > 0) {
//     fileName.textContent = this.files[0].name;
//     removeBtn.style.display = "inline-block";
//   }
// });

// When clicking "הסר"
removeBtn.addEventListener("click", function () {
  fileInput.value = "";          // clear file
  fileName.textContent = "";     // remove name
  removeBtn.style.display = "none"; // hide button
});

// Initialize after table loads
window.addEventListener("load", () => showPageVehicles(1));