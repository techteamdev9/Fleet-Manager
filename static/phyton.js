// const API = "https://fleet-manager-d8wj.onrender.com";
const API = window.location.origin;


// ----- Runtime state -----
let vehicles = [];
let statuses = ["פעיל", "נמכר", "הוצא משימוש"];
let currentUser = null;
let selectedVehicleId = null;

// ------------------------
// Login / Logout
// ------------------------
async function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });

  if (!res.ok) return alert("Invalid credentials");
  currentUser = await res.json();

  console.log("Logged in user:", currentUser);

  // Hide login form and show main content
  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('mainDiv').classList.remove('hidden');

  // Show profile icon after login
  document.getElementById('profileDiv').style.display = 'block';


  // Update profile icon and user info in the menu
  document.getElementById('profileUsername').textContent = currentUser.username;
  document.getElementById('profileRole').textContent = currentUser.role;

  // Update the welcome message
  document.getElementById('welcome').textContent = `Welcome ${currentUser.username} (${currentUser.role})`;

  // Call other functions to load status options and vehicle table
  refreshStatusOptions();
  await refreshTable();
  clearForm();

  // Reset all inputs/buttons first
  ["license", "toolCode", "statusSelect"].forEach(id => document.getElementById(id).disabled = false);
  ["addVehicle", "updateVehicle", "deleteVehicle"].forEach(fn =>
    document.querySelector(`button[onclick="${fn}()"]`).disabled = false
  );

  // Disable inputs/buttons only if NOT admin
  if (currentUser.role !== "admin") {
    ["license", "toolCode", "statusSelect"].forEach(id => document.getElementById(id).disabled = true);
    ["addVehicle", "updateVehicle", "deleteVehicle"].forEach(fn =>
      document.querySelector(`button[onclick="${fn}()"]`).disabled = true
    );
  }
}




function logout() {
  currentUser = null;
  selectedVehicleId = null;

  // Hide profile icon and menu (CONSISTENT)
  document.getElementById('profileDiv').style.display = 'none';
  document.getElementById('profileMenu').style.display = 'none';

  // Hide main content and show login form
  document.getElementById('loginDiv').classList.remove('hidden');
  document.getElementById('mainDiv').classList.add('hidden');

  document.getElementById('username').value = "";
  document.getElementById('password').value = "";

  clearForm();

  // Reset all inputs/buttons
  ["license", "toolCode", "statusSelect"].forEach(id =>
    document.getElementById(id).disabled = false
  );
  ["addVehicle", "updateVehicle", "deleteVehicle"].forEach(fn =>
    document.querySelector(`button[onclick="${fn}()"]`).disabled = false
  );
}



// ------------------------
// Status options
// ------------------------
function refreshStatusOptions() {
  const select = document.getElementById('statusSelect');
  select.innerHTML = "";
  statuses.forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.text = s;
    select.appendChild(o);
  });
}

// ------------------------
// Vehicle CRUD
// ------------------------
async function addVehicle() {
  if (currentUser.role !== 'admin') return alert("Admins only");

  const lic = license.value.trim();
  const tool = toolCode.value.trim();
  const status = statusSelect.value;
  await fetch(`${API}/vehicles`, {
    method: "POST",
    credentials:"include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_number: lic, tool_code: tool, status })
  });

  await refreshTable();
  clearForm();
}

async function updateVehicle() {
  if (!selectedVehicleId) return alert("Select a vehicle first");

  try {

    const res = await fetch(`${API}/vehicles/${selectedVehicleId}`, {
      method: "PUT",
      credentials:"include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        license_number: license.value,
        tool_code: toolCode.value,
        status: statusSelect.value
      })
    });

    if (!res.ok) throw new Error("Failed to update vehicle");

    await refreshTable();   // refresh the table without reloading page
    clearForm();            // clear form
  } catch (err) {
    console.error(err);
    alert("Error updating vehicle");
  }
}

async function deleteVehicle() {
  if (!selectedVehicleId) return alert("Select a vehicle first");
  if (!confirm("Delete this vehicle?")) return;

  await fetch(`${API}/vehicles/${selectedVehicleId}`, {
     method: "DELETE",
     credentials:"include",
    });
  selectedVehicleId = null;
  await refreshTable();
  clearForm();
}

// ------------------------
// Table & Search
// ------------------------
async function refreshTable() {
  const q = search.value.trim();
  const res = await fetch(`${API}/vehicles?q=${encodeURIComponent(q)}`,
  {credentials: "include" }
  );
  vehicles = await res.json();

  const tbody = document.querySelector("#vehicleTable tbody");
  tbody.innerHTML = "";

  vehicles.forEach(v => {
    const tr = document.createElement('tr');
    tr.classList.add("vehicle-row");
  
    tr.innerHTML = `
      <td>${v.id}</td>
      <td>${v.license_number}</td>
      <td>${v.tool_code}</td>
      <td>${v.status}</td>
    `;
  
    tr.onclick = () => selectVehicle(tr, v.id);
    tbody.appendChild(tr);
  });
  

  vehicleDetails.classList.add('hidden');
}
// Function to fetch stats for today and the previous day
async function fetchStats() {
  const username = currentUser.username;  // Assuming currentUser is set when logged in
  const res = await fetch(`${API}/stats?username=${username}`, { credentials: "include" });
  const stats = await res.json();

  // Display stats for today and previous day
  const todayStats = stats.today || {};
  const prevStats = stats.previous || {};

  console.log("Grouped Status Counts: ", todayStats); // Log to ensure it's correct

  // Insert today's stats into the DOM
  document.getElementById("todayStats").innerHTML = `
    <p>Today's Stats:</p>
    <ul>
      ${Object.keys(todayStats).map(status => `<li>${status}: ${todayStats[status]}</li>`).join("")}
    </ul>
  `;

  // Insert previous day's stats into the DOM
  document.getElementById("prevStats").innerHTML = `
    <p>Previous Day's Stats:</p>
    <ul>
      ${Object.keys(prevStats).map(status => `<li>${status}: ${prevStats[status]}</li>`).join("")}
    </ul>
  `;
}


// Call fetchStats on initial load after login (for the admin)
if (currentUser && currentUser.role === 'admin') {
  fetchStats();
  updateReportsChart();  // Load all reports by default
}


function generateStatsHtml(stats) {
  let html = '';
  for (const [status, count] of Object.entries(stats)) {
    html += `<p><strong>${status}:</strong> ${count}</p>`;
  }
  return html;
}

// Initial load after admin login
if (currentUser && currentUser.role === 'admin') {
  fetchStats();
  updateReportsChart();  // Load all reports by default
}


async function fetchReports() {
  const res = await fetch(`${API}/reports`, { credentials: "include" });
  const data = await res.json();

  // Group by status for pie chart
  const statusCounts = {};
  data.forEach(r => {
    if (!statusCounts[r.status]) statusCounts[r.status] = 0;
    statusCounts[r.status]++;
  });

  const ctx = document.getElementById('reportsChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Submitted Reports by Vehicle Status'
        }
      }
    }
  });
}

// Call after login for admin
// Initial load after admin login
if (currentUser && currentUser.role === 'admin') {
  fetchStats();
  fetchReports();
}


function clearSearch() {
  search.value = "";
  vehicleDetails.classList.add('hidden');
  refreshTable();
}

// ------------------------
// Form & History
// ------------------------
function clearForm() {
  selectedVehicleId = null;
  license.value = "";
  toolCode.value = "";
  statusSelect.selectedIndex = 0;
  vehicleDetails.classList.add('hidden');
}

async function selectVehicle(row, id) {
  const isAlreadyActive = row.classList.contains("active");

  // If clicking the same active row → close it
  if (isAlreadyActive) {
    row.classList.remove("active");
    if (row.nextSibling && row.nextSibling.classList.contains("history-row")) {
      row.nextSibling.remove();
    }
    selectedVehicleId = null;
    return;
  }

  // Otherwise, clear previous selection & history
  document.querySelectorAll(".vehicle-row").forEach(r => r.classList.remove("active"));
  document.querySelectorAll(".history-row").forEach(r => r.remove());

  selectedVehicleId = id;
  row.classList.add("active");

  // Fill form
  const v = vehicles.find(x => x.id === id);
  license.value = v.license_number;
  toolCode.value = v.tool_code;
  statusSelect.value = v.status;

  // Fetch history
  try {
    const res = await fetch(`${API}/vehicles/${id}/history`, { credentials: "include" });

    if (!res.ok) {
      // If response is not ok, throw an error
      throw new Error(`Failed to fetch history for vehicle ${id}.`);
    }

    const history = await res.json();

    // Build history row
    const historyRow = document.createElement("tr");
    historyRow.classList.add("history-row");

    const td = document.createElement("td");
    td.colSpan = 4;
    td.innerHTML = history.length
      ? `<strong>היסטוריית רכב:</strong>
         <ul>${history.map(h => `<li>${h.timestamp} | סטטוס: ${h.status}</li>`).join("")}</ul>`
      : "<em>אין היסטוריה לרכב זה</em>";

    historyRow.appendChild(td);

    // Insert under clicked row
    row.after(historyRow);

  } catch (error) {
    console.error("Error fetching vehicle history:", error);
    
    // Handle error gracefully: show a message in the UI
    const historyRow = document.createElement("tr");
    historyRow.classList.add("history-row");

    const td = document.createElement("td");
    td.colSpan = 4;
    td.innerHTML = `<em>לא ניתן להציג את היסטוריית הרכב כרגע. אנא נסה שנית מאוחר יותר.</em>`;

    historyRow.appendChild(td);
    row.after(historyRow);
  }
}


let reportsChartInstance = null; // keep chart instance for updates

async function updateReportsChart() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  let url = `${API}/reports`;
  if (from && to) {
    url += `?from_date=${from}&to_date=${to}`;
  }

  try {
    const res = await fetch(url, { credentials: "include" });
    const data = await res.json();
    console.log("Reports Data:", data);  // Check the response structure

    // Process the data
    const statusCounts = {};
    data.forEach(r => {
      console.log(r);  // Debugging each element
      const status = r[0]; // Access the first element of each array (the status)
      if (!statusCounts[status]) statusCounts[status] = 0;
      statusCounts[status]++;
    });

    console.log("Grouped Status Counts:", statusCounts);  // Check the grouped data

    const ctx = document.getElementById('reportsChart').getContext('2d');

    // Destroy previous chart if exists
    if (reportsChartInstance) reportsChartInstance.destroy();

    reportsChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Submitted Reports by Vehicle Status'
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching reports data:", error);
  }
}



// Initial load after admin login
if (currentUser && currentUser.role === 'admin') {
  fetchStats();
  updateReportsChart();  // load all reports by default
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');

  if (profileMenu.style.display === 'block') {
    profileMenu.style.display = 'none';
  } else {
    profileMenu.style.display = 'block';
  }
}





