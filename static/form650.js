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
  }
  
  function submitForm() {
    alert("Form submitted (connect to backend next)");
  }

  document.getElementById("openNextForm").addEventListener("click", function() {
    // Get the vehicle number (or ID) from the form
    const vehicleNumber = document.getElementById("vehicleNumber").value;

    // For now, just log it to console
    console.log("Vehicle ID for next form:", vehicleNumber);

    // Future: redirect to the next form page with vehicle ID
    // window.location.href = `/nextForm?vehicleId=${vehicleNumber}`;
  });