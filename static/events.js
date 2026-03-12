const API = window.location.origin;
const currentUser = JSON.parse(sessionStorage.getItem("user"));

if (!currentUser) window.location.href = "/";

let currentPage = 1;
const rowsPerPage = 5;  // max 5 events per page
let currentEvents = []; // events to paginate

// פונקציית התנתקות
function logout() {
  sessionStorage.clear();
  window.location.href = "/";
}

// הצגת כפתורי ניהול רק למנהלים (כולל כפתור "הוספה" גלובלי)
if (currentUser.role === "admin") {
  document.querySelectorAll(".admin-controls").forEach(el => el.style.display = "block");
}

// ---- טעינת אירועים מהשרת ----
async function loadEvents() {
  const params = new URLSearchParams();
  const fields = ["searchInput", "filterType", "filterSeverity", "filterFrom", "filterTo"];

  // מיפוי שדות הסינון לפרמטרים של ה-URL
  const map = { searchInput: "q", filterType: "event_type", filterSeverity: "severity", filterFrom: "from_date", filterTo: "to_date" };

  fields.forEach(id => {
    const val = document.getElementById(id)?.value?.trim();
    if (val) params.set(map[id], val);
  });

  try {
    const res = await fetch(`${API}/events?${params}`, { credentials: "include" });
    const data = await res.json();
    currentEvents = data;    // save for pagination
    currentPage = 1;         // reset to first page
    renderTable(currentEvents);
  } catch (err) {
    console.error("Failed to load events", err);
    document.getElementById("eventsTableBody").innerHTML =
      `<tr><td colspan="8" style="text-align:center;color:#dc2626;">שגיאה בטעינת האירועים</td></tr>`;
  }
}

// ---- רינדור טבלת האירועים ----
function renderTable(events) {
  const tbody = document.getElementById("eventsTableBody");
  const isAdmin = currentUser.role === "admin";
  const rowsPerPage = 5;              // limit 5 events per page
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageEvents = events.slice(start, end); // only take 5 events
  const totalPages = Math.ceil(events.length / rowsPerPage);
  document.getElementById("pageInfo").textContent = `עמוד ${currentPage} מתוך ${totalPages}`;
  // 1️⃣ If no events, show "אין אירועים" and return
  if (!events || events.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:20px;">
          <div class="empty-state">
            <i class="fas fa-calendar-alt"></i><br>אין אירועים להצגה
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // 2️⃣ Detect if mobile
  const isMobile = window.innerWidth <= 640;

  // 3️⃣ Render table rows
  tbody.innerHTML = pageEvents.map((e, i) => {
    const typeLabel = {
      operational: "תפעולי",
      maintenance: "תחזוקה",
      incident: "תקרית",
      general: "כללי"
    }[e.event_type] || e.event_type;

    const sevLabel = {
      high: "גבוהה",
      medium: "בינונית",
      low: "נמוכה",
      info: "מידע"
    }[e.severity] || e.severity;

    const dateStr = new Date(e.created_at).toLocaleString("he-IL",
      isMobile
        ? { dateStyle: "short" }                  // Mobile: only date
        : { dateStyle: "short", timeStyle: "short" } // Desktop: date + time
    );

    // Buttons only for admins
    const actionsCol = isAdmin
      ? `
        <button class="btn btn-primary btn-view">
          <i class="fas fa-eye"></i> פרטים
        </button>
        <button class="btn btn-secondary btn-edit" style="padding:2px 6px; font-size:12px;" title="ערוך">
        <i class="fas fa-pencil-alt"></i>
      </button>
      `
      : "";

    return `
      <tr class="vehicle-row">
        <td data-label="#">${e.id}</td>
        <td data-label="כותרת"><strong>${escHtml(e.title)}</strong><br>
            <small style="color:#6b7280;">${escHtml(e.description || "")}</small></td>
        <td data-label="סוג אירוע">${typeLabel}</td>
        <td data-label="חומרה"><span class="badge badge-${e.severity}">${sevLabel}</span></td>
        <td data-label="רכב">${escHtml(e.vehicle_license || "—")}</td>
        <td data-label="נוצר על ידי">${escHtml(e.created_by || "")}</td>
        <td data-label="תאריך" style="white-space:nowrap; direction:ltr;">${dateStr}</td>
        <td data-label="פעולות" style="display:flex; gap:6px;">${actionsCol}</td>
      </tr>
    `;
  }).join("");

  // 4️⃣ Attach event listeners to buttons
  tbody.querySelectorAll(".vehicle-row").forEach((row, index) => {
    const e = events[index];

    // פרטים button
    const viewBtn = row.querySelector(".btn-view");
    if (viewBtn) {
      viewBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (isMobile) {
          openEventCard(e); // mobile card
        } else {
          openDesktopCard(e); // desktop modal
        }
      });
    }

    // ערוך button
    const editBtn = row.querySelector(".btn-edit");
    if (editBtn) {
      editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openModal(e.id); // your existing edit modal
      });
    }
  });
}

// ---- ניהול מודל (הוספה / עדכון) ----
let allVehicles = [];

async function openModal(eventId = null) {
  // טעינת רכבים פעם אחת בלבד אם הרשימה ריקה
  if (!allVehicles.length) {
    try {
      const res = await fetch(`${API}/vehicles`, { credentials: "include" });
      allVehicles = await res.json();
    } catch (err) { console.error("Vehicles load error", err); }
  }

  // מילוי דרופדאון רכבים
  const sel = document.getElementById("eventVehicle");
  sel.innerHTML = `<option value="">— ללא רכב —</option>` +
    allVehicles.map(v => `<option value="${v.id}">${v.license_number} (${v.tool_code})</option>`).join("");

  const form = document.getElementById("eventForm"); // וודא שיש לך ID לטופס
  if (form) form.reset();

  // איפוס שדות ידני ליתר ביטחון
  document.getElementById("eventId").value = "";
  document.getElementById("deleteEventBtn").style.display = "none";
  document.getElementById("modalTitle").textContent = "אירוע חדש";

  if (eventId) {
    // מצב עריכה: שליפת נתונים מהשרת
    try {
      const res = await fetch(`${API}/events/${eventId}`, { credentials: "include" });
      const ev = await res.json();

      document.getElementById("eventId").value = ev.id;
      document.getElementById("eventTitle").value = ev.title;
      document.getElementById("eventDesc").value = ev.description || "";
      document.getElementById("eventType").value = ev.event_type;
      document.getElementById("eventSeverity").value = ev.severity;
      document.getElementById("eventVehicle").value = ev.vehicle_id || "";

      document.getElementById("deleteEventBtn").style.display = "inline-block";
      document.getElementById("modalTitle").textContent = "עריכת אירוע";
    } catch (err) {
      alert("שגיאה בטעינת נתוני האירוע");
      return;
    }
  }

  document.getElementById("modalOverlay").classList.add("active");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
}

// ---- שמירה (POST עבור חדש / PUT עבור קיים) ----
async function saveEvent() {
  const id = document.getElementById("eventId").value;
  const title = document.getElementById("eventTitle").value.trim();

  if (!title) return alert("חובה להזין כותרת");

  const payload = {
    title,
    description: document.getElementById("eventDesc").value.trim(),
    event_type: document.getElementById("eventType").value,
    severity: document.getElementById("eventSeverity").value,
    vehicle_id: document.getElementById("eventVehicle").value || null,
    created_by: currentUser.username, // נשמר מה-session
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API}/events/${id}` : `${API}/events`;

  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error();

    closeModal();
    loadEvents(); // רענון הטבלה
  } catch (err) {
    alert("הפעולה נכשלה. וודא שאתה מחובר כמנהל.");
  }
}

// ---- מחיקה (DELETE) ----
async function deleteEvent() {
  const id = document.getElementById("eventId").value;
  if (!id || !confirm("האם אתה בטוח שברצונך למחוק את האירוע לצמיתות?")) return;

  try {
    const res = await fetch(`${API}/events/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!res.ok) throw new Error();

    closeModal();
    loadEvents();
  } catch (err) {
    alert("מחיקה נכשלה");
  }
}

// פונקציות עזר
function escHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clearFilters() {
  ["searchInput", "filterType", "filterSeverity", "filterFrom", "filterTo"].forEach(id => {
    document.getElementById(id).value = "";
  });
  loadEvents();
}

function nextPage() {
  const totalPages = Math.ceil(currentEvents.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(currentEvents);
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable(currentEvents);
  }
}

function openEventCard(eventData) {
  // Only show on mobile
  if (window.innerWidth > 640) return;

  document.getElementById("cardTitle").textContent = eventData.title || "—";
  document.getElementById("cardType").textContent = eventData.event_type || "—";
  document.getElementById("cardSeverity").textContent = eventData.severity || "—";
  document.getElementById("cardVehicle").textContent = eventData.vehicle_license || "—";
  document.getElementById("cardUser").textContent = eventData.created_by || "—";
  document.getElementById("cardDate").textContent = new Date(eventData.created_at).toLocaleString("he-IL", { dateStyle: "short" });

  // Show overlay
  document.getElementById("eventCardOverlay").style.display = "block";
}

function closeEventCard() {
  const overlay = document.getElementById("eventCardOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
}

function openDesktopCard(eventData) {
  // Example: show a modal div for desktop
  const overlay = document.getElementById("desktopEventOverlay");
  if (!overlay) return;

  document.getElementById("desktopCardTitle").textContent = eventData.title || "—";
  document.getElementById("desktopCardType").textContent = eventData.event_type || "—";
  document.getElementById("desktopCardSeverity").textContent = eventData.severity || "—";
  document.getElementById("desktopCardVehicle").textContent = eventData.vehicle_license || "—";
  document.getElementById("desktopCardUser").textContent = eventData.created_by || "—";
  document.getElementById("desktopCardDate").textContent = new Date(eventData.created_at).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });

  overlay.style.display = "flex"; // or add a class "active" if you prefer
}

function closeDesktopCard() {
  const overlay = document.getElementById("desktopEventOverlay");
  if (!overlay) return;
  overlay.style.display = "none"; // hide the modal
}

document.addEventListener("DOMContentLoaded", loadEvents);