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
  { id: "אמבולנס", name: "אמבולנס", categories: ["2"] },
  { id: "ציוד-מכני-הנדסי", name: "ציוד מכני הנדסי", categories: ["2"] },
  { id: "ריינג'ר", name: "ריינג'ר", categories: ["3"] },
  { id: "כבאית", name: "כבאית", categories: ["2"] },
  { id: "קראוון", name: "קראוון", categories: ["3"] },
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
  { id: "משא-12-טון", name: "משא 12 טון", categories: ["5"], image: "משא-12-טון.jpg" },
  { id: "משא-מעל-12-טון", name: "משא מעל 12 טון", categories: ["5"], image: "משא-מעל-12-טון.jpg" },
  { id: "מסחרי-פינוי", name: "מסחרי פינוי", categories: ["5"], image: "מסחרי-פינוי.jpg" },
  { id: "מסחרי-קירור", name: "מסחרי קירור", categories: ["5"], image: "מסחרי-קירור.jpg" },
  { id: "מסחרי-נוסעים", name: "מסחרי נוסעים", categories: ["5"], image: "מסחרי-נוסעים.jpg" },
  { id: "טנדר", name: "טנדר", categories: ["5"], image: "טנדר.jpg" },
  { id: "טנדר-קירור", name: "טנדר קירור", categories: ["5"], image: "טנדר-קירור.jpg" },
  { id: "אמבולנס-ירמ", name: "אמבולנס", categories: ["5"], image: "אמבולנס.jpg" },

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

function getVehiclesByType(typeId, subTypeId = null) {
  if (selectedCategory === "1" && subTypeId) {
    // For Leasing: filter by Company (lease_name) and Sub-Type (vehicle_type)
    return vehiclesData.filter(v => v.lease_name === typeId && v.vehicle_type === subTypeId);
  }
  return vehiclesData.filter(v => v.vehicle_type === typeId);
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
    tool_code: "קוד כלי",
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

    Object.entries(vehicle).forEach(([key, value]) => {
      if (headersMap[key]) {
        const td = document.createElement("td");
        if (key === 'available_for_service') {
          td.innerText = value ? "ניתן לגיוס" : "לא ניתן לגיוס";
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