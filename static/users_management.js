const API = window.location.origin;
const currentUser = JSON.parse(sessionStorage.getItem("user"));

// Admin-only page
if (!currentUser || currentUser.role !== "admin") {
  window.location.href = "/";
}

function logout() {
  sessionStorage.clear();
  window.location.href = "/";
}

// ---- Load users ----
async function loadUsers() {
  try {
    const res = await fetch(`${API}/users`, { credentials: "include" });
    const data = await res.json();
    renderTable(data);
  } catch (err) {
    document.getElementById("usersTableBody").innerHTML =
      `<tr><td colspan="5" style="text-align:center;color:#dc2626;">שגיאה בטעינת המשתמשים</td></tr>`;
  }
}

function renderTable(users) {
  const tbody = document.getElementById("usersTableBody");

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-users"></i><br>אין משתמשים</div></td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const permLabel = u.permission_name === "admin" ? "admin" : "user";
    const badgeClass = permLabel === "admin" ? "badge-admin" : "badge-user";
    const isSelf = u.username === currentUser.username;
    const editBtn = `<button class="btn btn-secondary" style="padding:4px 10px;font-size:12px;" onclick="openModal(${u.id})">ערוך</button>`;

    return `
      <tr>
        <td>${u.id}</td>
        <td><strong>${escHtml(u.username)}</strong>${isSelf ? ' <small style="color:#9ca3af;">(אני)</small>' : ""}</td>
        <td>${escHtml(u.role || "—")}</td>
        <td><span class="${badgeClass}">${permLabel}</span></td>
        <td>${editBtn}</td>
      </tr>`;
  }).join("");
}

function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ---- Modal ----
function openModal(userId = null) {
  document.getElementById("userId").value = "";
  document.getElementById("userUsername").value = "";
  document.getElementById("userPassword").value = "";
  document.getElementById("userRole").value = "";
  document.getElementById("userPermission").value = "2";
  document.getElementById("deleteUserBtn").style.display = "none";
  document.getElementById("passwordHint").textContent = "";
  document.getElementById("modalTitle").textContent = "משתמש חדש";
  document.getElementById("userUsername").disabled = false;

  if (userId) {
    // Fetch user data for edit
    fetch(`${API}/users/${userId}`, { credentials: "include" })
      .then(r => r.json())
      .then(u => {
        document.getElementById("userId").value = u.id;
        document.getElementById("userUsername").value = u.username;
        document.getElementById("userUsername").disabled = true;
        document.getElementById("userRole").value = u.role || "";
        document.getElementById("userPermission").value = u.permission_id;
        document.getElementById("passwordHint").textContent = "השאר ריק לשמור סיסמה קיימת";
        document.getElementById("modalTitle").textContent = "עריכת משתמש";

        // Prevent self-deletion
        if (u.username !== currentUser.username) {
          document.getElementById("deleteUserBtn").style.display = "inline-block";
        }
      })
      .catch(() => alert("שגיאה בטעינת המשתמש"));
  }

  document.getElementById("modalOverlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
}

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

async function saveUser() {
  const username   = document.getElementById("userUsername").value.trim();
  const password   = document.getElementById("userPassword").value;
  const role       = document.getElementById("userRole").value.trim();
  const permission = document.getElementById("userPermission").value;
  const id         = document.getElementById("userId").value;

  if (!username) { alert("שם משתמש חובה"); return; }

  const payload = { username, role, permission_id: parseInt(permission) };
  if (password) payload.password = password;
  else if (!id) { alert("סיסמה חובה למשתמש חדש"); return; }

  const method = id ? "PUT" : "POST";
  const url    = id ? `${API}/users/${id}` : `${API}/users`;

  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "שגיאה בשמירה");
      return;
    }

    closeModal();
    loadUsers();
  } catch (err) {
    alert("שגיאה בשמירת המשתמש");
  }
}

async function deleteUser() {
  const id = document.getElementById("userId").value;
  if (!id || !confirm("למחוק משתמש זה?")) return;

  try {
    const res = await fetch(`${API}/users/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "שגיאה במחיקה");
      return;
    }
    closeModal();
    loadUsers();
  } catch (err) {
    alert("שגיאה במחיקת המשתמש");
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", loadUsers);
