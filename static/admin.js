const API = window.location.origin;
const currentUser = JSON.parse(sessionStorage.getItem("user"));

// ---- Session guard ----
if (!currentUser || currentUser.role !== "admin") window.location.href = "/";

function logout() {
  sessionStorage.clear();
  window.location.href = "/";
}

function goToVehicles() {
  window.location.href = "/vehicles-page";
}

let timeChart, pieChart;

// ---- Load initial stats & charts ----
// window.onload = async () => {
//   // Make sure admin is logged in
//   if (!currentUser || currentUser.role !== "admin") {
//     window.location.href = "/"; // redirect if not admin
//     return;
//   }

//   // Load stats and vehicles
//   await loadTodayStats();  // fetch today & previous day stats
//   updateCharts();          // optional chart update
//   await loadVehicles();    // fetch vehicles and color "ניתן/לא ניתן"
// };


// ---- Today & Previous Stats ----
async function loadTodayStats() {
  try {
    const res = await fetch("/stats", { credentials: "include" });
    const data = await res.json();

    // Render today stats
    // const todayDiv = document.getElementById("todayStats");
    // todayDiv.innerHTML = renderStats(data.today);

    // Render previous day stats
    // const prevDiv = document.getElementById("prevStats");
    // prevDiv.innerHTML = renderStats(data.previous);

  } catch (err) {
    console.error("Error loading stats:", err);
    document.getElementById("todayStats").innerHTML = "<p>Error loading stats</p>";
    document.getElementById("prevStats").innerHTML = "<p>Error loading stats</p>";
  }
}

// Helper to format stats
function renderStats(stats) {
  return Object.entries(stats || {}).map(([status, count]) => {
    return `<p><strong>${status}:</strong> ${count}</p>`;
  }).join("");
}


// ---- Charts ----
async function updateCharts() {
  await drawTimeChart();
  await drawPieChart();
}

// ---- Time Chart ----
async function drawTimeChart() {
  const from = document.getElementById("fromDate").value;
  const to   = document.getElementById("toDate").value;

  let url = `${API}/stats_by_day`;
  if (from || to) url += `?from_date=${from}&to_date=${to}`;

  const res = await fetch(url, { credentials:"include" });
  const data = await res.json();

  const labels = data.map(d => d.day);
  const totals = data.map(d => d.total);

  const ctx = document.getElementById("timeChart").getContext("2d");
  if (timeChart) timeChart.destroy();

  timeChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label:"עידכוני גיוס", data:totals, borderColor:"#3498db", backgroundColor:"rgba(52,152,219,0.2)", fill:true, tension:0.3 }] },
    options: {
      responsive:true,
      scales: {
        x:{ 
          title:{ display:true, text:"תאריך" },
          ticks:{
            callback:function(value){
              const date = new Date(this.getLabelForValue(value));
              const day = String(date.getDate()).padStart(2,'0');
              const month = String(date.getMonth()+1).padStart(2,'0');
              const year = String(date.getFullYear()).slice(-2);
              return `${day}/${month}/${year}`;
            }
          }
        },
        y:{ title:{ display:true, text:"גוייס" }, beginAtZero:true }
      }
    }
  });
}

// ---- Pie Chart ----
async function drawPieChart() {
  const from = document.getElementById("fromDate").value;
  const to   = document.getElementById("toDate").value;

  let url = `${API}/reports`;
  if (from || to) url += `?from_date=${from}&to_date=${to}`;

  const res = await fetch(url, { credentials:"include" });
  const raw = await res.json();

  const counts = {};
  raw.forEach(r => {
    const status = r.status || r[0];
    counts[status] = (counts[status] || 0)+1;
  });

  const ctx2 = document.getElementById("pieChart").getContext("2d");
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx2,{
    type:'pie',
    data:{ labels:Object.keys(counts), datasets:[{ data:Object.values(counts), backgroundColor:["#3498db","#e74c3c","#2ecc71","#f1c40f","#9b59b6","#1abc9c","#e67e22"] }] },
    options:{ responsive:true, plugins:{ } }
  });
}

// ---- Vehicles Table ----
let currentPageAdmin = 1;
const rowsPerPageAdmin = 10; // Adjust as needed

async function loadVehicles(page = 1) {
  try {
    const from = document.getElementById("fromDate").value;
    const to   = document.getElementById("toDate").value;

    let url = "/vehicles";
    if (from || to) url += `?from_date=${from}&to_date=${to}`;

    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();

    const tbody = document.getElementById("vehiclesTableBody");
    if (!tbody) return;

    // 🔹 Pagination logic
    const totalPages = Math.ceil(data.length / rowsPerPageAdmin);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPageAdmin = page;

    const start = (page - 1) * rowsPerPageAdmin;
    const end = start + rowsPerPageAdmin;
    const vehiclesToRender = data.slice(start, end);

    tbody.innerHTML = vehiclesToRender.map(vehicle => {
      const availText = vehicle.available_for_service ? "ניתן" : "לא ניתן";
      const color = availText === "ניתן" ? "green" : "red";

      return `
        <tr>
          <td>${vehicle.license_number}</td>
          <td>${vehicle.tool_code}</td>
          <td>${vehicle.status}</td>
          <td style="color:${color}; font-weight:bold;">
            ${availText}
          </td>
          <td>
            <button onclick="showVehicleInfo(${vehicle.id})">Info</button>
          </td>
        </tr>
      `;
    }).join("");

    // 🔹 Update pagination display
    document.getElementById("currentPageAdmin").textContent = `${totalPages} / ${page}`;

    document.getElementById("prevPageAdmin").disabled = page <= 1;
    document.getElementById("nextPageAdmin").disabled = page >= totalPages;

  } catch (err) {
    console.error("Failed to load vehicles", err);
    const tbody = document.getElementById("vehiclesTableBody");
    if (tbody) tbody.innerHTML = "<tr><td colspan='5'>Error loading vehicles</td></tr>";
  }
}


// ---- Vehicle Info Card (admin editable) ----
async function showVehicleInfo(vehicleId) {

  const vehicleRes = await fetch(`${API}/vehicles`, { credentials: "include" });
  const vehicles = await vehicleRes.json();
  const vehicle = vehicles.find(v => v.id == vehicleId);

  const res = await fetch(`${API}/vehicles/${vehicleId}/history`, { credentials: "include" });
  const history = await res.json();

  const card = document.getElementById("vehicleCard");
  const content = document.getElementById("vehicleCardContent");

  // Initial HTML structure
  let html = `
    <button id="closeCardBtn" style="float:right; cursor:pointer; background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px;">✖</button>
    <h3>${vehicle.license_number}</h3>
    <p>Tool Code: ${vehicle.tool_code}</p>
    <p>Status: ${vehicle.status}</p>
  `;

  // Admin editable
  if (currentUser.role === "admin") {
    html += `
      <label>ניתן/לא ניתן לגיוס:
        <select id="cardAvailableSelect">
          <option value="true" ${vehicle.available_for_service ? "selected" : ""}>ניתן לגיוס</option>
          <option value="false" ${!vehicle.available_for_service ? "selected" : ""}>לא ניתן לגיוס</option>
        </select>
      </label>
      <button id="saveCardBtn" style="background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 5px; margin-top: 10px;">Save</button>
    `;
  } else {
    html += `
      <p>ניתן/לא ניתן לגיוס:
        ${vehicle.available_for_service ? "ניתן לגיוס" : "לא ניתן לגיוס"}
      </p>
    `;
  }

  html += `<h4>History:</h4><ul>`;
  history.forEach((h, i) => {
    const style = i === 0 ? "background:#d4edda;font-weight:bold;" : "";
    html += `<li style="${style}">${new Date(h.timestamp).toLocaleString()} - ${h.status}</li>`;
  });
  html += `</ul>`;

  content.innerHTML = html;
  card.style.display = "block";

  // CLOSE BUTTON FUNCTIONALITY
  document.getElementById("closeCardBtn").addEventListener("click", () => {
    card.style.display = "none"; // Close the info card
  });

  // Admin save functionality
  if (currentUser.role === "admin") {
    document.getElementById("saveCardBtn").addEventListener("click", async () => {
      const newValue = document.getElementById("cardAvailableSelect").value === "true";
    
      // Send the PUT request to update the vehicle's available_for_service value
      await fetch(`${API}/vehicles/${vehicle.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_number: vehicle.license_number,
          tool_code: vehicle.tool_code,
          status: vehicle.status,
          available_for_service: newValue  // Send the new value here
        })
      });
    
      card.style.display = "none";  // Close the card
      loadVehicles();  // Reload vehicles to show updated data
    });
  }
}



window.addEventListener("DOMContentLoaded", async () => {
  // Redirect if not admin
  if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "/";
    return;
  }

  try {
    // Load stats and vehicles
    await loadTodayStats();  // today & previous stats
    updateCharts();          // charts
    // await loadVehicles();    // vehicles table with colors
  } catch (err) {
    console.error("Error initializing dashboard:", err);
  }
});


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

let currentPage = 1;
const rowsPerPage = 10;

function showPage(page) {
  const tbody = document.getElementById("vehiclesTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  // Hide all rows
  rows.forEach(row => row.style.display = "none");

  // Show rows for current page
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  rows.slice(start, end).forEach(row => row.style.display = "");

  // Update page number
  document.getElementById("currentPage").textContent = page;
}

// Attach buttons
document.getElementById("prevPageAdmin").addEventListener("click", () => {
  loadVehicles(currentPageAdmin - 1);
});

document.getElementById("nextPageAdmin").addEventListener("click", () => {
  loadVehicles(currentPageAdmin + 1);
});

// Initialize after table loads
// window.addEventListener("load", () => showPage(1));