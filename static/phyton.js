const API = "http://127.0.0.1:5000";

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
    credentials:"include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });

  if (!res.ok) return alert("Invalid credentials");
  currentUser = await res.json();

  document.getElementById('loginDiv').classList.add('hidden');
  document.getElementById('mainDiv').classList.remove('hidden');
  document.getElementById('welcome').textContent =
    `Welcome ${currentUser.username} (${currentUser.role})`;

  refreshStatusOptions();
  await refreshTable();
  clearForm();

  if (currentUser.role !== "admin") {
    ["license","toolCode","statusSelect"].forEach(id => document.getElementById(id).disabled = true);
    ["addVehicle","updateVehicle","deleteVehicle"].forEach(fn =>
      document.querySelector(`button[onclick="${fn}()"]`).disabled = true
    );
  }
}

function logout() {
  currentUser = null;
  selectedVehicleId = null;

  document.getElementById('loginDiv').classList.remove('hidden');
  document.getElementById('mainDiv').classList.add('hidden');

  document.getElementById('username').value = "";
  document.getElementById('password').value = "";

  clearForm();

  ["license","toolCode","statusSelect"].forEach(id => document.getElementById(id).disabled = false);
  ["addVehicle","updateVehicle","deleteVehicle"].forEach(fn =>
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
    tr.innerHTML = `<td>${v.id}</td><td>${v.license_number}</td><td>${v.tool_code}</td><td>${v.status}</td>`;
    tr.onclick = () => selectVehicle(v.id);
    tbody.appendChild(tr);
  });

  vehicleDetails.classList.add('hidden');
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

async function selectVehicle(id) {
  selectedVehicleId = id;
  const v = vehicles.find(x => x.id === id);

  license.value = v.license_number;
  toolCode.value = v.tool_code;
  statusSelect.value = v.status;

  const res = await fetch(`${API}/vehicles/${id}/history`,  
  {credentials: "include" }
  );
  const history = await res.json();

  historyList.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement('li');
    li.textContent = `${h.timestamp} | סטטוס: ${h.status}`;
    historyList.appendChild(li);
  });

  vehicleDetails.classList.remove('hidden');
}