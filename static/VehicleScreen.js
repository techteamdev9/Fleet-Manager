const categories = [
  { id: "1", name: "ליסינג", color: "#FF6B6B", image: "ליסינג.jpg" },
  { id: "2", name: "מלגזה", color: "#4ECDC4", image: "מלגזות.jpg" },
  { id: "3", name: "נצמ", color: "#FFD93D", image: "נצמ.jpg" },
  { id: "4", name: "צמה", color: "#6C5CE7", image: "צמה.jpg" },
  { id: "5", name: "רכבי ירמ", color: "#45B7D1", image: "ירמ.jpg" },
  { id: "6", name: "רייזרים", color: "#A29BFE", image: "רייזרים.jpg" },
  { id: "7", name: "מיוחדים/נגררים", color: "#FAB1A0", image: "מיוחדים-נגררים.jpg" },
  { id: "8", name: "דלק", color: "#55E6C1", image: "דלק.jpg" },
];

const vehicleTypes = [
  // { id: "אמבולנס", name: "אמבולנס", categories: ["2"] },
  { id: "ציוד-מכני-הנדסי", name: "ציוד מכני הנדסי", categories: ["2"] },
  { id: "ריינג'ר", name: "ריינג'ר", categories: ["3"] },
  { id: "כבאית", name: "כבאית", categories: ["2"] },
  { id:'נצ"מ', name: 'נצ"מ', categories: ["3"] },
  { id: "קירורית", name: "קירורית", categories: ["2"] },
  { id: "נגרר-כיבוי-אש", name: "נגרר כיבוי אש", categories: ["3"] },
  { id: "ברינקס", name: "ברינקס", categories: ["5"], image: "ברינקס.jpg" },

  // ליסינג Category (1)
  { id: "אלפא ליסינג", name: "אלפא ליסינג", categories: ["1"], image: "אלפא ליסינג.jpg.jpeg" },
  { id: "שלמה", name: "שלמה", categories: ["1"], image: "שלמה.jpg.jpeg" },
  { id: "אלבר", name: "אלבר", categories: ["1"], image: "אלבר.png" },
  { id: "אלדן", name: "אלדן", categories: ["1"], image: "אלדן.svg" },
  { id: "בגאט", name: "בגאט", categories: ["1"], image: "בגאט.webp" },
  { id: "בלוסקי", name: "בלוסקי", categories: ["1"], image: "בלוסקי.jpg.jpeg" },
  { id: "פריסבי", name: "פריסבי", categories: ["1"], image: "פריסבי.jpg.jpeg" },
  { id: "כולמוביל", name: "כולמוביל", categories: ["1"], image: "כולמוביל.jpg.jpeg" },
  { id: "הרץ", name: "הרץ", categories: ["1"], image: "הרץ.png" },
  { id: "ליסקום", name: "ליסקום", categories: ["1"], image: "ליסקום.png" },
  { id: "יוניברסל ליסינג", name: "יוניברסל ליסינג", categories: ["1"], image: "יוניברסל-ליסינג.png" },
  { id: "ליסינג ועוד בע״מ", name: "ליסינג ועוד בע״מ", categories: ["1"], image: "ליסינג ועוד בעמ.png" },

  // ירמ Category (5)
  { id: "משא", name: "משא", categories: ["5"], image: "משא-12-טון.jpg" },
  { id: "משא-מעל-12-טון", name: "משא מעל 12 טון", categories: ["5"], image: "משא-מעל-12-טון.jpg" },
  { id: "מסחרי-פינוי", name: "מסחרי פינוי", categories: ["5"], image: "מסחרי-פינוי.jpg" },
  { id: "מסחרי-קירור", name: "מסחרי קירור", categories: ["5"], image: "מסחרי-קירור.jpg" },
  { id: "מסחרי-נוסעים", name: "מסחרי נוסעים", categories: ["5"], image: "מסחרי-נוסעים.jpg" },
  { id: "טנדר 4*4", name:"טנדר 4*4", categories: ["5"], image: "טנדר.jpg" },
  { id: "טנדר-קירור", name: "טנדר קירור", categories: ["5"], image: "טנדר-קירור.jpg" },
  { id: "אמבולנס", name: "אמבולנס", categories: ["5"], image: "אמבולנס.jpg" },

  // צמה Category (4)
  { id: "יעה-זחלי", name: "יעה זחלי", categories: ["4"], image: "יעה-זחלי.jpg" },
  { id: "מוביל-עפר", name: "מוביל עפר", categories: ["4"], image: "מוביל עפר.jpg" },
  { id: "יעה-אופני", name: "יעה אופני", categories: ["4"], image: "יעה-אופני.jpg" },
  { id: "בובקט-זחלי", name: "בובקט זחלי", categories: ["4"], image: "בובקט זחלי.jpg" },
  { id: "מחפר-זחלי-הידראולי", name: "מחפר זחלי הידראולי", categories: ["4"], image: "מחפר זחלי הידראולי.jpg" },
  { id: "מכונת-טאטא", name: "מכונת טאטא", categories: ["4"], image: "מכונת טאטא.jpg" },
  { id: "מכבש-משולב", name: "מכבש משולב", categories: ["4"], image: "מכבש משולב.jpg" },
  { id: "בובקט-אופני", name: "בובקט אופני", categories: ["4"], image: "בובקט אופני.jpg" },
  { id: "מפלס-ממנוע", name: "מפלס ממנוע", categories: ["4"], image: "מפלס ממנוע.jpg" },
  { id: "דחפור-D7", name: "דחפור D7", categories: ["4"], image: "דחפור-D7.jpg" },
  { id: "מכבש-פינאומטי", name: "מכבש פינאומטי", categories: ["4"], image: "מכבש פינאומטי.jpg" },
  { id: "טרקטור-חקלאי", name: "טרקטור חקלאי", categories: ["4"], image: "טרקטור-חקלאי.jpg" },
  { id: "מכבש-גלילי", name: "מכבש גלילי", categories: ["4"], image: "מכבש-גלילי.jpg" },
  { id: "מחפרון-אופני", name: "מחפרון אופני", categories: ["4"], image: "מחפרון-אופני.jpg" },
  { id: "דחפור-D9", name: "דחפור D9", categories: ["4"], image: "דחפור D9.jpg" },

  // מיוחדים/נגררים Category (7)
  { id: "נגרר-חץ", name: "נגרר חץ", categories: ["7"], image: "נגרר חץ.jpg" },
  { id: "מערבל-בטון", name: "מערבל בטון", categories: ["7"], image: "מערבל בטון.jpg" },
  { id: "נגרר-מים", name: "נגרר מים", categories: ["7"], image: "נגרר מים.jpg" },
  { id: "קראוון-מיוחד", name: "קראוון", categories: ["7"], image: "קראוון.jpg" },
  { id: "נגרר-קירור-מיוחד", name: "נגרר קירור", categories: ["7"], image: "נגרר קירור.jpg" },
  { id: "פודטראק", name: "פודטראק", categories: ["7"], image: "פודטראק.jpg" },

  // דלק Category (8)
  { id: "נתמך-דלק", name: "נתמך דלק", categories: ["8"], image: "נתמך דלק.jpg" },
  { id: "מיכלית-דלק", name: "מיכלית דלק", categories: ["8"], image: "מיכלית דלק.jpg" },
  { id: "נגרר-כיבוי-אש-דלק", name: "נגרר כיבוי אש", categories: ["8"], image: "נגרר כיבוי אש.jpg" },
];
const leasingSubTypes = [
  { id: "רכב-קל", name: "רכב קל", image: "רכב-קל.jpg" },
  { id: "מסחרי-פינוי", name: "מסחרי פינוי", image: "מסחרי-פינוי.jpg" },
  { id: "טנדר-קירור", name: "טנדר קירור", image: "טנדר-קירור.jpg" },
  { id: "מסחרי-קירור", name: "מסחרי קירור", image: "מסחרי-קירור.jpg" },
  { id: "טנדר", name: "טנדר", image: "טנדר.jpg" },
  { id: "מסחרי-נוסעים", name: "מסחרי נוסעים", image: "מסחרי-נוסעים.jpg" },
];

const manufacturers = [
  { value: "", label: "בחר יצרן" },

  { value: "אאודי", label: "אאודי" },
  { value: "אאודי בלגיה", label: "אאודי בלגיה" },
  { value: "אאודי הונגריה", label: "אאודי הונגריה" },
  { value: "אאודי סלובקיה", label: "אאודי סלובקיה" },
  { value: "אאודי ספרד", label: "אאודי ספרד" },

  { value: "אודי מכסיקו", label: "אודי מכסיקו" },

  { value: "אוואטר סין", label: "אוואטר סין" },
  { value: "אומודה סין", label: "אומודה סין" },
  { value: "אופל אנגליה", label: "אופל אנגליה" },
  { value: "אופל ד.קוריאה", label: "אופל ד.קוריאה" },
  { value: "אופל סלובקיה", label: "אופל סלובקיה" },
  { value: "אופל פולין", label: "אופל פולין" },
  { value: "אופל פורטוגל", label: "אופל פורטוגל" },
  { value: "אופל צרפת", label: "אופל צרפת" },
  { value: "אופל-בלגיה", label: "אופל-בלגיה" },
  { value: "אופל-גרמניה", label: "אופל-גרמניה" },
  { value: "אופל-ספרד", label: "אופל-ספרד" },

  { value: "אורה סין", label: "אורה סין" },
  { value: "איווייס סין", label: "איווייס סין" },
  { value: "איויאיסי סין", label: "איויאיסי סין" },
  { value: "איון סין", label: "איון סין" },
  { value: "איי אם סין", label: "איי אם סין" },

  { value: "איסוזו ארה\"ב", label: "איסוזו ארה\"ב" },
  { value: "איסוזו יפן", label: "איסוזו יפן" },
  { value: "איסוזו תאילנד", label: "איסוזו תאילנד" },

  { value: "אלפא רומיאו", label: "אלפא רומיאו" },
  { value: "אסטון מרטין", label: "אסטון מרטין" },

  { value: "אקספנג סין", label: "אקספנג סין" },

  { value: "ב מ וו גרמניה", label: "ב מ וו גרמניה" },
  { value: "ב מ וו סין", label: "ב מ וו סין" },

  { value: "בי ווי די", label: "בי ווי די" },

  { value: "ג'אק סין", label: "ג'אק סין" },
  { value: "ג'ילי סין", label: "ג'ילי סין" },

  { value: "טויוטה יפן", label: "טויוטה יפן" },
  { value: "טויוטה ארה\"ב", label: "טויוטה ארה\"ב" },

  { value: "טסלה ארה''ב", label: "טסלה ארה''ב" },
  { value: "טסלה גרמניה", label: "טסלה גרמניה" },
  { value: "טסלה סין", label: "טסלה סין" },

  { value: "יונדאי קוריאה", label: "יונדאי קוריאה" },

  { value: "לקסוס יפן", label: "לקסוס יפן" },

  { value: "מרצדס בנץ גרמניה", label: "מרצדס בנץ גרמניה" },

  { value: "ניסאן יפן", label: "ניסאן יפן" },

  { value: "סובארו יפן", label: "סובארו יפן" },

  { value: "סקודה צ'כיה", label: "סקודה צ'כיה" },

  { value: "פולקסווגן גרמניה", label: "פולקסווגן גרמניה" },

  { value: "פורד ארה\"ב", label: "פורד ארה\"ב" },

  { value: "פיג'ו צרפת", label: "פיג'ו צרפת" },

  { value: "רנו צרפת", label: "רנו צרפת" },

  { value: "שברולט ארה\"ב", label: "שברולט ארה\"ב" }
];

const API = window.location.origin;

let vehiclesData = [];

async function getVehicles() {
  const res = await fetch(`${API}/vehicles`, {
    credentials: "include"
  });
  vehiclesData = await res.json();
  console.log(vehiclesData);

  render(); //  render AFTER data loads
}

// function getVehiclesByType(typeId, subTypeId = null) {
//   if (selectedCategory === "1" && subTypeId) {
//     // For Leasing: filter by Company (lease_name) and Sub-Type (vehicle_type)
//     return vehiclesData.filter(v => v.lease_name === typeId && v.vehicle_type === subTypeId);
//   }
//   return vehiclesData.filter(v => v.vehicle_type === typeId);
// }
function getVehiclesByType(typeId, subTypeId = null) {
  if (selectedCategory === "1" && subTypeId) {
    return vehiclesData.filter(v =>
      v.lease_name === typeId &&
      v.manager_group === subTypeId &&
      (!selectedUnit || v.unitcode == selectedUnit) // 👈 added
    );
  }

  return vehiclesData.filter(v =>
    v.manager_group === typeId &&
    (!selectedUnit || v.unitcode == selectedUnit) // 👈 added
  );
}

let selectedCategory = null;
let selectedType = null;
let selectedSubType = null;

const app = document.getElementById("app");

function getTypesByCategory(categoryId) {
  return vehicleTypes.filter(t =>
    t.categories.includes(categoryId)
  );
}

// function openForm650() {
//   window.location.href = "/form650";
// }
function openForm() {
  document.getElementById("formModal").style.display = "block";
  document.getElementById("formId").innerText = Date.now();

  // Load locations
  const locationSelect = document.getElementById("location");
  locationSelect.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    let opt = document.createElement("option");
    opt.text = "Area " + i;
    locationSelect.add(opt);
  }

  // Checklist
  const items = [
    "צלחות נוי בגלגלים",
    "אנטנות",
    "מולטימדיה",
    "אפוד זוהר",
    "ג'ק",
    "מפתח גלגלים",
    "משולש אזהרה",
    "גלגל רזרבי",
    "מטף"
  ];

  const checklistDiv = document.getElementById("checklist");
  checklistDiv.innerHTML = "";

  items.forEach(item => {
    let row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <label>${item}</label>
      <select><option>יש</option><option>אין</option></select>
      <select><option>תקין</option><option>לא תקין</option></select>
      <textarea placeholder="הערות"></textarea>
    `;

    checklistDiv.appendChild(row);
  });
}

function closeForm() {
  document.getElementById("formModal").style.display = "none";
  document.getElementById("vehicleType").value = "";
  document.getElementById("vehicleNumber").value = "";
  document.getElementById("ownerName").value = "";
  document.getElementById("ownerId").value = "";
  document.getElementById("ownerPhone").value = "";
  document.getElementById("locatorCode").value = "";
  document.getElementById("lockCode").value = "";
  document.getElementById("licenceStatus").selectedIndex = 0;

  selectedVehicle = null;
  document.getElementById("eventType").innerHTML =
    originalEventTypeOptions;
}

// function submitForm() {
//   const data = {
//     event_type: document.getElementById("eventType").value,
//     vehicle_type: document.getElementById("vehicleType").value,
//     vehicle_number: document.getElementById("vehicleNumber").value,
//     date: document.getElementById("date").value,
//     location: document.getElementById("location").value
//   };

//   fetch("/save-form-650", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   })
//   .then(res => res.json())
//   .then(() => {
//     alert("Form 650 saved");
//     console.log(data)
//     closeForm();
//   });
// }
const eventTypeSelect = document.getElementById("eventType");
const originalEventTypeOptions = eventTypeSelect.innerHTML;

//form filler for each row
function open650Form() {
  if (!selectedVehicle) return;

  // Open your existing form
  // document.getElementById("formModal").style.display = "block";
  openForm();
  const eventTypeSelect = document.getElementById("eventType");

  // Restore original list first
  eventTypeSelect.innerHTML = originalEventTypeOptions;

  // Remove "גיוס הרכב"
  // [...eventTypeSelect.options].forEach(option => {
  //   if (option.text === "גיוס הרכב") {
  //     option.remove();
  //   }
  // });
  eventTypeSelect.selectedIndex = 0;
  // Fill fields from vehicle data
  document.getElementById("vehicleType").value =
    selectedVehicle.vehicle_type || "";

  document.getElementById("vehicleNumber").value =
    selectedVehicle.license_number || "";

  document.getElementById("ownerName").value =
    selectedVehicle.owner_name || "";

  document.getElementById("ownerId").value =
    selectedVehicle.owner_id || "";

  document.getElementById("ownerPhone").value =
    selectedVehicle.owner_phone || "";

  document.getElementById("locatorCode").value =
    selectedVehicle.locatorcode || "";

  document.getElementById("lockCode").value =
    selectedVehicle.lockcode || "";

  const licenseStatusField = document.getElementById("licenseStatus");
  if (licenseStatusField) {
    licenseStatusField.value =
      selectedVehicle.licence_status || "";
  }
}

// search vehicle
async function searchVehicleRegistry() {

  const plate = document
    .getElementById("licenseSearch")
    .value
    .replace(/-/g, "")
    .trim();

  if (!plate) {
    alert("יש להזין מספר רכב");
    return;
  }

  try {

    const response =
      await fetch(`/api/vehicle-registry/${plate}`);

    const data =
      await response.json();

    if (!data.success) {

      document.getElementById("registryResult").innerHTML = `
              <div class="vehicle-result-card">
                  <div class="vehicle-result-header">
                      <h3>תוצאות חיפוש</h3>
                      <button
                          class="close-result-btn"
                          onclick="closeVehicleResult()">
                          ✕
                      </button>
                  </div>

                  <div class="no-result">
                      לא נמצא רכב
                  </div>
              </div>
          `;

      return;
    }

    const v = data.vehicle;

    document.getElementById("registryResult").innerHTML = `
          <div class="vehicle-result-card">
      
              <div class="vehicle-result-header">
                  <h3>פרטי רכב ממאגר משרד הרישוי</h3>
      
                  <button
                      class="close-result-btn"
                      onclick="closeVehicleResult()">
                      ✕
                  </button>
              </div>
      
              <div class="vehicle-info-grid">
      
                  <div class="info-item">
                      <span class="info-label">מספר רכב</span>
                      <span class="info-value">${v.mispar_rechev || "-"}</span>
                  </div>
      
                  <div class="info-item">
                      <span class="info-label">יצרן</span>
                      <span class="info-value">${v.tozeret_nm || "-"}</span>
                  </div>
      
                  <div class="info-item">
                      <span class="info-label">דגם</span>
                      <span class="info-value">${v.kinuy_mishari || "-"}</span>
                  </div>
      
                  <div class="info-item">
                      <span class="info-label">שנת ייצור</span>
                      <span class="info-value">${v.shnat_yitzur || "-"}</span>
                  </div>
      
                  <div class="info-item">
                      <span class="info-label">צבע</span>
                      <span class="info-value">${v.tzeva_rechev || "-"}</span>
                  </div>
      
                  <div class="info-item">
                      <span class="info-label">סוג דלק</span>
                      <span class="info-value">${v.sug_delek_nm || "-"}</span>
                  </div>
      
                  <div class="info-item">
                      <span class="info-label">תוקף רישוי</span>
                      <span class="info-value">${v.tokef_dt || "-"}</span>
                  </div>
      
              </div>
      
          </div>
      `;

  } catch (err) {

    console.error(err);

    document.getElementById("registryResult").innerHTML = `
          <div class="vehicle-result-card">
              <div class="vehicle-result-header">
                  <h3>שגיאה</h3>
                  <button
                      class="close-result-btn"
                      onclick="closeVehicleResult()">
                      ✕
                  </button>
              </div>

              <div class="error-result">
                  אירעה שגיאה בחיפוש
              </div>
          </div>
      `;
  }
}

function closeVehicleResult() {
  document.getElementById("registryResult").innerHTML = "";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeVehicleResult();
  }
});
async function submitForm() {

  const formData = {
    event_type: document.getElementById("eventType").value,
    vehicle_type: document.getElementById("vehicleType").value,
    vehicle_number: document.getElementById("vehicleNumber").value,
    date: document.getElementById("date").value,
    location: document.getElementById("location").value,

    owner_name: document.getElementById("ownerName").value,
    owner_id: document.getElementById("ownerId").value,
    owner_phone: document.getElementById("ownerPhone").value,

    licence_status: document.getElementById("licenceStatus").value,
    fuel: document.getElementById("fuel").value,

    lights: document.getElementById("lights").value,
    tires: document.getElementById("tires").value,
    locatorcode: document.getElementById("locatorCode").value,
    lockcode: document.getElementById("lockCode").value,

    damage_physical: document.getElementById("damagePhysical").value,
    damage_mechanical: document.getElementById("damageMechanical").value,

    assessor: document.getElementById("assessor").value,

    document_person_id: document.getElementById("documentPerson").value,
    releasing_signature: document.getElementById("releasingSignature").value,
    unit_rep: document.getElementById("unitRep").value
  };

  const response = await fetch("/submit-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  const result = await response.json();

  alert(result.message);
  console.log(formData);
  closeForm();
  window.location.href = '/vehicles-page1'
}
document.getElementById("openNextForm").addEventListener("click", function () {
  // Get the vehicle number (or ID) from the form
  const vehicleNumber = document.getElementById("vehicleNumber").value;

  // For now, just log it to console
  console.log("Vehicle ID for next form:", vehicleNumber);

  // Future: redirect to the next form page with vehicle ID
  // window.location.href = `/nextForm?vehicleId=${vehicleNumber}`;
});

function openVehicleCard() {

  if (!selectedVehicle) {
    alert("יש לבחור רכב תחילה");
    return;
  }

  const v = selectedVehicle;

  document.getElementById("vc_license_number").innerText = v.license_number || "";
  document.getElementById("vc_tool_code").innerText = v.tool_code || "";
  document.getElementById("vc_status").innerText = v.status || "";
  document.getElementById("vc_available").innerText = v.available_for_service ? "כן" : "לא";

  document.getElementById("vc_unitCode").innerText = v.unitcode || "";
  document.getElementById("vc_category").innerText = v.category || "";
  document.getElementById("vc_vehicle_type").innerText = v.vehicle_type || "";
  document.getElementById("vc_sub_type").innerText = v.sub_type || "";

  document.getElementById("vc_owner_type").innerText = v.owner_type || "";
  document.getElementById("vc_lease_name").innerText = v.lease_name || "";

  document.getElementById("vc_owner_name").innerText = v.owner_name || "";
  document.getElementById("vc_owner_id").innerText = v.owner_id || "";
  document.getElementById("vc_owner_phone").innerText = v.owner_phone || "";

  document.getElementById("vc_locator_code").innerText =
    v.locatorcode || "";

  document.getElementById("vc_lock_code").innerText =
    v.lockcode || "";

  document.getElementById("vc_location").innerText = v.location || "";

  document.getElementById("vc_fuel").innerText = v.fuel || "";
  document.getElementById("vc_licence_status").innerText = v.licence_status || "";

  document.getElementById("vc_created_at").innerText = v.created_at || "";
  document.getElementById("vc_updated_at").innerText = v.updated_at || "";

  document.getElementById("vehicleCardModal").style.display = "block";
}
function openModal() {
  document.getElementById("issueModal").style.display = "block";

  // 👇 get vehicle license from first form
  // const vehicleId = document.getElementById("license_number").value;

  // store globally for rows
  window.currentVehicleId = vehicleId;
  rowIndex = 1;

  // reset rows and add first one
  document.getElementById("itemsContainer").innerHTML = "";
  addRow();
}
function closeModal() {
  document.getElementById("issueModal").style.display = "none";
}
let rowIndex = 1;

function addRow() {
  const container = document.getElementById("itemsContainer");

  const row = document.createElement("div");
  row.classList.add("item-row");

  row.innerHTML = `
    <input type="number" value="${rowIndex}" readonly>
    <input type="text" placeholder="סוג ציוד">
    <input type="text" placeholder="מספר קטלוגי">
    <input type="text" placeholder="מספר רישוי">

    <button type="button" class="remove-btn" onclick="removeRow(this)">➖</button>
  `;

  container.appendChild(row);
  rowIndex++;
}
function removeRow(button) {
  const row = button.parentElement;
  row.remove();
}
// const accessoriesList = [
//   "מגבה מכני/הדראולי",
//   "ידית למגבה",
//   "מפתח גלגלים",
//   "מטף כיבוי אש",
//   "משולש אזהרה",
//   "רדיו/טייפ",
//   "מע מיזוג אוויר",
//   "חגורות ביטחון",
//   "מראות פנימיות",
//   "מראות חיצוניות",
//   "מגבים",
//   "מק",
//   "גלגל רזרבי",
//   "כיסוי לרכב(ברזנט)",
//   "סולמות"
// ];

// const container = document.getElementById("accessories");

// accessoriesList.forEach(item => {
//   const div = document.createElement("div");

//   div.innerHTML = `
//     <label>${item}</label>
//     <input type="number" min="0" value="0">
//   `;

//   container.appendChild(div);
// });
const accessoriesList = [
  "מגבה מכני/הדראולי",
  "ידית למגבה",
  "מפתח גלגלים",
  "מטף כיבוי אש",
  "משולש אזהרה",
  "רדיו/טייפ",
  "מע מיזוג אוויר",
  "חגורות ביטחון",
  "מראות פנימיות",
  "מראות חיצוניות",
  "מגבים",
  "מק",
  "גלגל רזרבי",
  "כיסוי לרכב(ברזנט)",
  "סולמות"
];

const container = document.getElementById("accessories");

accessoriesList.forEach(item => {
  const div = document.createElement("div");
  div.classList.add("accessory-row");

  div.innerHTML = `
    <label>${item}</label>
    <span class="display">✖</span>
    <input type="number" min="0" value="0" class="edit-input">
  `;

  const display = div.querySelector(".display");
  const input = div.querySelector(".edit-input");

  // start hidden
  input.style.display = "none";

  // click X → switch to input
  display.addEventListener("click", () => {
    display.style.display = "none";
    input.style.display = "block";
    input.focus();
  });

  // when leaving input → back to display
  input.addEventListener("blur", () => {
    if (input.value === "0" || input.value === "") {
      display.textContent = "✖";
    } else {
      display.textContent = input.value;
    }

    input.style.display = "none";
    display.style.display = "inline-block";
  });

  container.appendChild(div);
});

function submitIssueForm() {
  const data = {
    issuing_unit: document.getElementById("issuing_unit").value,
    receiving_unit: document.getElementById("receiving_unit").value,
    vehicle_number: window.currentVehicleId,

    // vehicle_id: window.currentVehicleId,
    items: [],
    accessories: [],
    signatures: {
      issuer: {
        signature: document.getElementById("issuer_signature").value,
        id: document.getElementById("issuer_id").value,
        rank: document.getElementById("issuer_rank").value,
        full_name: document.getElementById("issuer_fullname").value
      },

      receiver: {
        id: document.getElementById("receiver_id").value,
        rank: document.getElementById("receiver_rank").value,
        full_name: document.getElementById("receiver_fullname").value,
        role: document.getElementById("receiver_role").value,
        signature: document.getElementById("receiver_signature").value,
        date: document.getElementById("receiver_date").value,
        form_1006: document.getElementById("receiver_form_1006").value
      }
    }
  };

  // collect rows
  const rows = document.querySelectorAll("#itemsContainer div");
  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");

    data.items.push({
      line: inputs[0].value,
      type: inputs[1].value,
      catalog: inputs[2].value,
      license: inputs[3].value

    });
  });

  // collect accessories
  const acc = document.querySelectorAll("#accessories div");
  acc.forEach(div => {
    const label = div.querySelector("label").innerText;
    const value = div.querySelector("input").value;

    data.accessories.push({
      name: label,
      amount: value
    });
  });
  console.log("DATA SENT:", data);
  fetch("/save-issuing-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      alert("נשמר בהצלחה");
      closeModal();
    })
    .catch(err => {
      console.error(err);
    });
  console.log(data);
}

// select unit
let selectedUnit = "";

function filterVehicles() {
  const select = document.getElementById("unitSelect");
  selectedUnit = select.value;

  console.log("Selected unit:", selectedUnit);
  render();

  // later: filter table here
}

async function searchAdvancedRegistry() {
  const filters = {

    vehicle_type: document.getElementById("advVehicleType").value,
    manufacturer: document.getElementById("advManufacturer").value,
    fuel: document.getElementById("advFuel").value,
    owner_type: document.getElementById("advOwnerType").value,
    year: document.getElementById("advYear").value,
    limit: document.getElementById("advLimit").value
  

  };
  

  const response = await fetch("/api/vehicle-registry/filter-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filters)
  });

  const data = await response.json();

  if (!data.success) {
    alert(data.message);
    return;
  }

  renderAdvancedTable(data.vehicles);
}

function renderAdvancedTable(vehicles) {

  if (!vehicles || vehicles.length === 0) {
    document.getElementById("advancedResults").innerHTML =
      "<h3>No vehicles found</h3>";
    return;
  }

  let html = `
  <table class="adv-table">
      <thead>
          <tr>
              <th>Plate</th>
              <th>יצרן</th>
              <th>Model</th>
              <th>Year</th>
              <th>Fuel</th>
              <th>Owner</th>
              <th>מועד עליה לכביש</th>
          </tr>
      </thead>
      <tbody>
  `;

  vehicles.forEach(v => {
    html += `
      <tr>
          <td>${v.mispar_rechev || ""}</td>
          <td>${v.tozeret_nm || ""}</td>
          <td>${v.kinuy_mishari || ""}</td>
          <td>${v.shnat_yitzur || ""}</td>
          <td>${v.sug_delek_nm || ""}</td>
          <td>${v.baalut || ""}</td>
          <td>${formatDate(v.moed_aliya_lakvish)}</td>
      </tr>
      `;
  });

  html += `
      </tbody>
  </table>
  `;

  document.getElementById("advancedResults").innerHTML = html;
}

function formatDate(val) {
  if (!val) return "";
  return val.replace("-", "/"); // 2014-11 → 2014/11
}
async function loadManufacturers() {
  const select = document.getElementById("advManufacturer");
  if (!select || select.dataset.loaded) return;

  select.innerHTML = manufacturers
    .map(m => `<option value="${m.value}">${m.label}</option>`)
    .join("");

  select.dataset.loaded = "true";
  // try {

  //   const res = await fetch("/api/vehicle-registry/manufacturers");
  //   const data = await res.json();

  //   if (!data.success || !data.manufacturers) {
  //     console.error("Bad response:", data);
  //     return;
  //   }

  //   const select = document.getElementById("advManufacturer");
  //   select.innerHTML = `<option value="">בחר יצרן</option>`;

  //   data.manufacturers.forEach(m => {

  //     const opt = document.createElement("option");
  //     opt.value = m;
  //     opt.textContent = m;

  //     select.appendChild(opt);
  //   });

  // } catch (err) {
  //   console.error("Failed loading manufacturers:", err);
  // }
}

loadManufacturers();
// function refreshVehiclesTable() {
//   const vehicles = getVehiclesByType(selectedType, selectedSubType);
//   renderVehiclesTable(vehicles);
// }
function matchesSearch(vehicle, search) {
  if (!search.trim()) return true;

  const text = [
      vehicle.manufacturer,
      vehicle.model,
      vehicle.year,
      vehicle.fuel,
      vehicle.ownerType,
      vehicle.vehicleType
  ]
      .join(" ")
      .toLowerCase();

  return search
      .toLowerCase()
      .split(/\s+/)
      .every(word => text.includes(word));
}
let selectedVehicle = null
function openVehicleActionsModal(vehicle) {
  selectedVehicle = vehicle;
  console.log(vehicle)

  const modal = document.getElementById("vehicleActionsModal");

  document.getElementById("modalTitle").innerText =
    "כלי " + (vehicle.license_number || "");

  modal.classList.add("active");
}

function closeVehicleActionsModal() {
  document.getElementById("vehicleActionsModal").classList.remove("active");


}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("vehicleActionsModal");
  const content = document.querySelector(".vehicle-modal-content");

  if (!modal.classList.contains("active")) return;

  // ignore clicks inside modal
  if (content.contains(event.target)) return;

  closeVehicleActionsModal();
});

function goBackToVehicles() {
  // sessionStorage.setItem("refreshVehiclesTable", "1");
  // history.back();
  window.location.href = "/vehicles-page"

}
function render() {
  app.innerHTML = "";

  // 🟦 Categories
  if (!selectedCategory) {
    const grid = document.createElement("div");
    grid.className = "grid";

    categories.forEach(cat => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.backgroundColor = cat.color;
      card.style.fontSize = "22px";
      card.innerText = cat.name;

      if (cat.image) {
        const imageUrl = `static/assets/types/categories/${cat.image}`;
        card.style.backgroundImage = `url('${encodeURI(imageUrl)}')`;
        card.style.backgroundSize = "90% 80%";
        card.style.backgroundPosition = "center 60px";
        card.style.backgroundRepeat = "no-repeat";
        card.style.backgroundColor = "#fff";
        card.innerText = ""; // Clear text to add label

        const label = document.createElement("div");
        label.innerText = cat.name;
        label.style.position = "absolute";
        label.style.top = "0";
        label.style.left = "0";
        label.style.right = "0";
        label.style.background = "rgba(0,0,0,0.8)";
        label.style.color = "#fff";
        label.style.padding = "10px 4px";
        label.style.textAlign = "center";
        label.style.fontSize = "20px";
        label.style.fontWeight = "bold";
        label.style.zIndex = "2";
        label.style.borderTopLeftRadius = "14px";
        label.style.borderTopRightRadius = "14px";
        card.appendChild(label);
      }

      card.onclick = () => {
        selectedCategory = cat.id;
        selectedType = null;
        selectedSubType = null;
        render();
      };

      grid.appendChild(card);
    });

    app.appendChild(grid);
    return;
  }

  // 🟩 Types (Leasing Companies or regular Types)
  if (!selectedType) {
    const backBtn = document.createElement("button");
    backBtn.innerText = "חזרה";
    backBtn.onclick = () => {
      selectedCategory = null;
      render();
    };

    app.appendChild(backBtn);

    const grid = document.createElement("div");
    grid.className = "grid";

    const types = getTypesByCategory(selectedCategory);

    if (types.length === 0) {
      const msg = document.createElement("p");
      msg.innerText = "לא נמצאו סוגים";
      app.appendChild(msg);
    }

    types.forEach(type => {
      const card = document.createElement("div");
      card.className = "card";

      card.style.backgroundColor = "#fff";

      const label = document.createElement("div");
      label.innerText = type.name;
      label.style.position = "absolute";
      label.style.top = "0";
      label.style.left = "0";
      label.style.right = "0";
      label.style.background = "rgba(0,0,0,0.8)";
      label.style.color = "#fff";
      label.style.padding = "10px 4px";
      label.style.textAlign = "center";
      label.style.fontSize = "20px";
      label.style.fontWeight = "bold";
      label.style.zIndex = "2";
      label.style.borderTopLeftRadius = "14px";
      label.style.borderTopRightRadius = "14px";
      card.appendChild(label);

      let imageUrl = "";
      if (type.image) {
        if (type.categories.includes("4")) {
          imageUrl = `static/assets/types/zama/${type.image}`;
        } else if (type.categories.includes("5")) {
          imageUrl = `static/assets/types/yarm/${type.image}`;
        } else if (type.categories.includes("1")) {
          imageUrl = `static/assets/types/leasing/${type.image}`;
        } else if (type.categories.includes("7")) {
          imageUrl = `static/assets/types/specials/${type.image}`;
        } else if (type.categories.includes("8")) {
          imageUrl = `static/assets/types/fuel/${type.image}`;
        } else {
          imageUrl = `static/assets/types/${type.image}`;
        }
      }

      if (imageUrl) {
        card.style.backgroundImage = `url('${encodeURI(imageUrl)}')`;
        card.style.backgroundSize = "90% 80%";
        card.style.backgroundPosition = "center 60px";
        card.style.backgroundRepeat = "no-repeat";
      }

      card.onclick = () => {
        selectedType = type.id;
        render();
      };

      grid.appendChild(card);
    });

    app.appendChild(grid);
    return;
  }

  // 🟨 Sub-Types (Specifically for Category 1 Leasing Companies)
  if (selectedCategory === "1" && !selectedSubType) {
    const backBtn = document.createElement("button");
    backBtn.innerText = "חזרה לחברות ליסינג";
    backBtn.onclick = () => {
      selectedType = null;
      render();
    };

    app.appendChild(backBtn);

    const grid = document.createElement("div");
    grid.className = "grid";

    leasingSubTypes.forEach(sub => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.backgroundColor = "#fff";

      const label = document.createElement("div");
      label.innerText = sub.name;
      label.style.position = "absolute";
      label.style.top = "0";
      label.style.left = "0";
      label.style.right = "0";
      label.style.background = "rgba(0,0,0,0.8)";
      label.style.color = "#fff";
      label.style.padding = "10px 4px";
      label.style.textAlign = "center";
      label.style.fontSize = "20px";
      label.style.fontWeight = "bold";
      label.style.zIndex = "2";
      label.style.borderTopLeftRadius = "14px";
      label.style.borderTopRightRadius = "14px";
      card.appendChild(label);

      const imageUrl = `static/assets/types/leasing_types/${sub.image}`;
      card.style.backgroundImage = `url('${encodeURI(imageUrl)}')`;
      card.style.backgroundSize = "90% 80%";
      card.style.backgroundPosition = "center 60px";
      card.style.backgroundRepeat = "no-repeat";

      card.onclick = () => {
        selectedSubType = sub.id;
        render();
      };

      grid.appendChild(card);
    });

    app.appendChild(grid);
    return;
  }

  // 🚗 Final step
  const backBtn = document.createElement("button");
  backBtn.innerText = selectedCategory === "1" ? "חזרה לסוגי רכב" : "חזרה לסוגים";
  backBtn.onclick = () => {
    if (selectedCategory === "1") {
      selectedSubType = null;
    } else {
      selectedType = null;
    }
    render();
  };

  app.appendChild(backBtn);


  const filteredVehicles = getVehiclesByType(selectedType, selectedSubType);

  if (filteredVehicles.length === 0) {
    const msg = document.createElement("p");
    msg.innerText = "לא נמצאו רכבים מסוג זה";
    app.appendChild(msg);
    return;
  }

  const table = document.createElement("table");
  table.border = "1";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Translation map for table headers
  const headersMap = {
    id: "#",
    license_number: "מספר רישוי",
    vehicle_type: "סוג כלי",
    status: "סטטוס",
    available_for_service: "זמינות",
    unitcode: "קוד יחידה"
  };

  Object.keys(filteredVehicles[0]).forEach(key => {
    if (headersMap[key]) {
      const th = document.createElement("th");
      th.innerText = headersMap[key];
      headerRow.appendChild(th);
    }
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  filteredVehicles.forEach(vehicle => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.onclick = (event) => {
      event.stopPropagation();
      openVehicleActionsModal(vehicle);
    };
    Object.entries(vehicle).forEach(([key, value]) => {
      if (headersMap[key]) {
        const td = document.createElement("td");
        if (key === 'available_for_service') {
          td.innerText = value ? "ניתן" : "לא ניתן";
          td.style.color = value ? "green" : "red";
          td.style.fontWeight = "bold";
        } else {
          td.innerText = value || "—";
        }
        row.appendChild(td);
      }
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  wrapper.appendChild(table);
  app.appendChild(wrapper);
}

render();
getVehicles();