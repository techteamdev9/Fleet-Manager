const categories = [
  { id: "1", name: "ליסינג", color: "#FF6B6B" },
  { id: "2", name: "מלגזה", color: "#4ECDC4" },
  { id: "3", name: "נצמ", color: "#FFD93D" },
  { id: "4", name: "צמה", color: "#6C5CE7" },
  { id: "5", name: "רכבי ירמ", color: "#45B7D1" },
];

const vehicleTypes = [
  { id: "אופנוע", name: "אופנוע", categories: ["1"] },
  { id: "אמבולנס", name: "אמבולנס", categories: ["2"] },
  { id: "ציוד-מכני-הנדסי", name: "ציוד מכני הנדסי", categories: ["2"] },
  { id: "טנדר-4*4", name: "טנדר-4*4", categories: ["1"] },
  { id: "טרקטור", name: "טרקטור", categories: ["1"] },
  { id: "מלגזה", name: "מלגזה", categories: ["5"] },
  { id: "משא", name: "משא", categories: ["5"] },
  { id: "ריינג'ר", name: "ריינג'ר", categories: ["3"] },
  { id: "כבאית", name: "כבאית", categories: ["2"] },
  { id: "מסחרי", name: "מסחרי", categories: ["4"] },
  { id: "קראוון", name: "קראוון", categories: ["3"] },
  { id: "רכב-קל", name: "רכב קל", categories: ["4"] },
  { id: "ברינקס", name: "ברינקס", categories: ["5"] },
  { id: "נתמך", name: "נתמך", categories: ["1"] },
  { id: "קירורית", name: "קירורית", categories: ["2"] },
  { id: "נגרר-כיבוי-אש", name: "נגרר כיבוי אש", categories: ["3"] },








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

function getVehiclesByType(typeId) {
  return vehiclesData.filter(v => v.vehicle_type === typeId);
}

let selectedCategory = null;
let selectedType = null;

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
      card.innerText = cat.name;

      card.onclick = () => {
        selectedCategory = cat.id;
        render();
      };

      grid.appendChild(card);
    });

    app.appendChild(grid);
    return;
  }

  // 🟩 Types
  if (!selectedType) {
    const backBtn = document.createElement("button");
    backBtn.innerText = "Back";
    backBtn.onclick = () => {
      selectedCategory = null;
      render();
    };

    app.appendChild(backBtn);

    const grid = document.createElement("div");
    grid.className = "grid";

    //   define types first
    const types = getTypesByCategory(selectedCategory);

    console.log("Selected category:", selectedCategory);
    console.log("TYPES FOUND:", types);

    //  optional safety
    if (types.length === 0) {
      const msg = document.createElement("p");
      msg.innerText = "No types found";
      app.appendChild(msg);
    }
    grid.style.border = "2px solid red";
    types.forEach(type => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerText = type.name;
      card.style.backgroundColor = "#ddd";
      if (type.name === "נתמך") {
        card.style.backgroundImage = "url('static/assets/types/נתמך.jpg')"
        card.style.backgroundSize = "cover";       // cover the card fully
        card.style.backgroundPosition = "center";  // center the image
        card.style.backgroundRepeat = "no-repeat"; // no repeating
      } if (type.name === "טרקטור") {
        card.style.backgroundImage = "url('static/assets/types/טרקטור.jpg')"
        card.style.backgroundSize = "cover";       // cover the card fully
        card.style.backgroundPosition = "center";  // center the image
        card.style.backgroundRepeat = "no-repeat"; // no repeating
      }
      if (type.name === "טנדר-4*4") {
        card.style.backgroundImage = "url('static/assets/types/טנדר4.jpg')"
        card.style.backgroundSize = "cover";       // cover the card fully
        card.style.backgroundPosition = "center";  // center the image
        card.style.backgroundRepeat = "no-repeat"; // no repeating
      }
      if (type.name === "אופנוע") {
        card.style.backgroundImage = "url('static/assets/types/אופנוע.jpg')"
        card.style.backgroundSize = "cover";       // cover the card fully
        card.style.backgroundPosition = "center";  // center the image
        card.style.backgroundRepeat = "no-repeat"; // no repeating
      }

      card.style.color = "#fff";
      card.onclick = () => {
        selectedType = type.id;
        render();
      };

      grid.appendChild(card);
    });

    app.appendChild(grid);
    return;
  }

  // 🚗 Final step maybe to bring back
  // const backBtn = document.createElement("button");
  // backBtn.innerText = "Back to types";
  // backBtn.onclick = () => {
  //   selectedType = null;
  //   render();
  // };

  // const result = document.createElement("div");
  // result.innerText = "Selected Type: " + selectedType;

  // app.appendChild(backBtn);
  // app.appendChild(result);
  // 🚗 Final step
  const backBtn = document.createElement("button");
  backBtn.innerText = "Back to types";
  backBtn.onclick = () => {
    selectedType = null;
    render();
  };

  app.appendChild(backBtn);

  // ✅ get vehicles by selected type
  const filteredVehicles = getVehiclesByType(selectedType);

  console.log("Selected type:", selectedType);
  console.log("Filtered vehicles:", filteredVehicles);

  // 🧪 empty state (will happen now)
  if (filteredVehicles.length === 0) {
    const msg = document.createElement("p");
    msg.innerText = "No vehicles found for this type";
    app.appendChild(msg);
    return;
  }

  //  create table
  const table = document.createElement("table");
  table.border = "1";

  // headers
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  Object.keys(filteredVehicles[0]).forEach(key => {
    const th = document.createElement("th");
    th.innerText = key;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // body
  const tbody = document.createElement("tbody");

  filteredVehicles.forEach(vehicle => {
    const row = document.createElement("tr");

    Object.values(vehicle).forEach(value => {
      const td = document.createElement("td");
      td.innerText = value;
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  // app.appendChild(table);
  // create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  // put the table inside the wrapper
  wrapper.appendChild(table);

  // append wrapper to app
  app.appendChild(wrapper);

}

render();
getVehicles();