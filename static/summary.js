// ============================================================
// Vehicle Summary
// ============================================================

// The five categories that will appear in the first column.
const VEHICLE_TYPES = [
    'ליסינג',
    'מלגזה',
    'נצ"מ',
    'צמה',
    'רכבי יר"מ'
];


// ============================================================
// Create the summary from the vehicles
// ============================================================

function createVehicleSummary(vehicles) {

    // Create an empty row for each vehicle type.
    const rows = VEHICLE_TYPES.map(type => ({
        type: type,

        recruited: 0,              // גויס
        credited: 0,               // זוכה
        released: 0,               // שוחרר
        intendedForRelease: 0,     // מיועדים לשחרור
        active: 0,                 // פעילים
        activeInventory: 0,        // מצבה פעילה

        releasePercentage: 0
    }));


    // Go through every vehicle.
    vehicles.forEach(vehicle => {

        // ----------------------------------------------------
        // סוג אמצעי
        // ----------------------------------------------------
        //
        // Currently using recruitment_type.
        //
        const type = normalizeVehicleType(vehicle.recruitment_type);

        const row = rows.find(item => item.type === type);

        // If the vehicle doesn't belong to one of our
        // five categories, ignore it.
        if (!row) {
            return;
        }


        // ----------------------------------------------------
        // Status
        // ----------------------------------------------------

        const status = normalizeStatus(vehicle.status);

        switch (status) {

            case 'גויס':
                row.recruited++;
                break;

            case 'זוכה':
            case 'זיכוי':
                row.credited++;
                break;

            case 'שוחרר':
                row.released++;
                break;

            case 'מיועדים לשחרור':
                row.intendedForRelease++;
                break;

            case 'פעילים':
                row.active++;
                break;
        }


        // ----------------------------------------------------
        // מצבה פעילה
        // ----------------------------------------------------

        if (vehicle.available_for_service === true) {
            row.activeInventory++;
        }
    });


    // --------------------------------------------------------
    // Calculate release percentage
    // --------------------------------------------------------

    rows.forEach(row => {

        const total =
            row.recruited +
            row.credited +
            row.released +
            row.intendedForRelease;


        if (total > 0) {

            row.releasePercentage =
                Number(
                    ((row.released / total) * 100).toFixed(1)
                );

        } else {

            row.releasePercentage = 0;
        }
    });


    return rows;
}


// ============================================================
// Normalize vehicle type
// ============================================================

function normalizeVehicleType(type) {

    if (!type) {
        return null;
    }

    const value = String(type).trim();


    // Handle different spellings that may exist in the DB.
    if (
        value === 'נצ"מ' ||
        value === 'נצמ'
    ) {
        return 'נצ"מ';
    }


    if (
        value === 'רכבי יר"מ' ||
        value === 'רכבי ירמ'
    ) {
        return 'רכבי יר"מ';
    }


    if (value === 'ליסינג') {
        return 'ליסינג';
    }


    if (value === 'מלגזה') {
        return 'מלגזה';
    }


    if (value === 'צמה') {
        return 'צמה';
    }


    return null;
}


// ============================================================
// Normalize status
// ============================================================

function normalizeStatus(status) {

    if (!status) {
        return '';
    }

    return String(status).trim();
}


// ============================================================
// Create totals row
// ============================================================

function createTotalsRow(rows) {

    const totals = {
        type: 'סה"כ',

        recruited: 0,
        credited: 0,
        released: 0,
        intendedForRelease: 0,
        active: 0,
        activeInventory: 0,

        releasePercentage: 0
    };


    rows.forEach(row => {

        totals.recruited += row.recruited;
        totals.credited += row.credited;
        totals.released += row.released;
        totals.intendedForRelease += row.intendedForRelease;
        totals.active += row.active;
        totals.activeInventory += row.activeInventory;
    });


    // Total release percentage
    const total =
        totals.recruited +
        totals.credited +
        totals.released +
        totals.intendedForRelease;


    if (total > 0) {

        totals.releasePercentage =
            Number(
                ((totals.released / total) * 100).toFixed(1)
            );

    } else {

        totals.releasePercentage = 0;
    }


    return totals;
}


// ============================================================
// Render table
// ============================================================

function renderSummaryTable(rows) {

    const tbody = document.getElementById('summaryTableBody');

    tbody.innerHTML = '';


    // --------------------------------------------------------
    // Normal rows
    // --------------------------------------------------------

    rows.forEach(row => {

        const tr = document.createElement('tr');


        tr.innerHTML = `
            <td>${row.type}</td>

            <td>${row.recruited}</td>

            <td>${row.credited}</td>

            <td>${row.released}</td>

            <td>${row.intendedForRelease}</td>

            <td>${row.active}</td>

            <td>${row.activeInventory}</td>

            <td class="percentage">
                ${row.releasePercentage}%
            </td>
        `;


        tbody.appendChild(tr);
    });


    // --------------------------------------------------------
    // Totals row
    // --------------------------------------------------------

    const totals = createTotalsRow(rows);

    const totalRow = document.createElement('tr');

    totalRow.classList.add('total-row');


    totalRow.innerHTML = `
        <td>${totals.type}</td>

        <td>${totals.recruited}</td>

        <td>${totals.credited}</td>

        <td>${totals.released}</td>

        <td>${totals.intendedForRelease}</td>

        <td>${totals.active}</td>

        <td>${totals.activeInventory}</td>

        <td class="percentage">
            ${totals.releasePercentage}%
        </td>
    `;


    tbody.appendChild(totalRow);
}


// ============================================================
// Load vehicles from Flask
// ============================================================

async function loadVehicleSummary() {

    const loading = document.getElementById('loading');
    const table = document.getElementById('summaryTable');
    const errorMessage = document.getElementById('errorMessage');


    try {

        loading.style.display = 'block';
        table.style.display = 'none';
        errorMessage.style.display = 'none';


        // Your existing Flask route:
        // @app.route("/vehicles", methods=["GET"])
        const response = await fetch('/vehicles');


        if (!response.ok) {
            throw new Error(
                `Failed to load vehicles (${response.status})`
            );
        }


        const vehicles = await response.json();


        console.log('Vehicles loaded:', vehicles);


        // Create summary
        const summary = createVehicleSummary(vehicles);


        console.log('Summary:', summary);


        // Display table
        renderSummaryTable(summary);
        renderCommandSummary(vehicles);

        loading.style.display = 'none';
        table.style.display = 'table';


    } catch (error) {

        console.error('Error loading vehicle summary:', error);


        loading.style.display = 'none';

        errorMessage.textContent =
            'אירעה שגיאה בטעינת נתוני כלי הרכב';

        errorMessage.style.display = 'block';
    }
}


// ============================================================
// Start
// ============================================================

loadVehicleSummary();

// ===============================
// Create summary by responsible command
// ===============================
// ============================================================
// SECOND TABLE - לפי פיקוד אחראי מספר
// ============================================================

// ============================================================
// SECOND TABLE - Summary by פיקוד אחראי NUMBER
// Uses responsible_command
// ============================================================

function createCommandSummary(vehicles) {

    const groups = {};

    vehicles.forEach(vehicle => {

        // The NUMBER is in responsible_command
        const command =
            vehicle.responsible_command !== null &&
                vehicle.responsible_command !== undefined &&
                vehicle.responsible_command !== ''
                ? String(vehicle.responsible_command).trim()
                : 'לא מוגדר';


        // Create group
        if (!groups[command]) {

            groups[command] = {
                command: command,

                recruited: 0,
                credited: 0,
                released: 0,
                intendedForRelease: 0,
                active: 0,
                activeInventory: 0,

                releasePercentage: 0
            };
        }


        const row = groups[command];


        // Same status logic as first table
        const status = normalizeStatus(vehicle.status);

        switch (status) {

            case 'גויס':
                row.recruited++;
                break;

            case 'זוכה':
            case 'זיכוי':
                row.credited++;
                break;

            case 'שוחרר':
                row.released++;
                break;

            case 'מיועדים לשחרור':
                row.intendedForRelease++;
                break;

            case 'פעילים':
                row.active++;
                break;
        }


        // מצבה פעילה
        if (vehicle.available_for_service === true) {
            row.activeInventory++;
        }

    });


    // Calculate release percentage
    Object.values(groups).forEach(row => {

        const total =
            row.recruited +
            row.credited +
            row.released +
            row.intendedForRelease;


        row.releasePercentage =
            total > 0
                ? Number(
                    ((row.released / total) * 100).toFixed(1)
                )
                : 0;
    });


    return groups;
}


// ============================================================
// Render SECOND TABLE
// ============================================================

function renderCommandSummary(vehicles) {

    const groups = createCommandSummary(vehicles);

    const tbody =
        document.getElementById('commandSummaryTableBody');

    if (!tbody) {
        console.error('commandSummaryTableBody not found');
        return;
    }

    tbody.innerHTML = '';


    // Sort numerically
    const rows = Object.values(groups).sort((a, b) => {

        if (a.command === 'לא מוגדר') return 1;
        if (b.command === 'לא מוגדר') return -1;

        return Number(a.command) - Number(b.command);
    });


    // Totals
    const totals = {

        recruited: 0,
        credited: 0,
        released: 0,
        intendedForRelease: 0,
        active: 0,
        activeInventory: 0
    };


    // Render rows
    rows.forEach(row => {

        const tr = document.createElement('tr');
    
        const releasePercentage = Number(row.releasePercentage) || 0;
        const barPercentage = Math.min(Math.max(releasePercentage, 0), 100);
    
        tr.innerHTML = `
            <td>${row.command}</td>
            <td>${row.recruited}</td>
            <td>${row.credited}</td>
            <td>${row.released}</td>
    
            <td style="
                background-color: #b7e4c7;
                color: #1b4332;
                font-weight: bold;
            ">
                ${row.intendedForRelease}
            </td>
    
            <td>${row.active}</td>
            <td>${row.activeInventory}</td>
    
            <td class="percentage">
    
                <div style="
                    position: relative;
                    width: 120px;
                    height: 24px;
                    background-color: #e5e7eb;
                    border: 1px solid #aaa;
                    border-radius: 5px;
                    overflow: hidden;
                    margin: auto;
                ">
    
                    <div style="
                        width: ${barPercentage}%;
                        height: 100%;
                        background-color: #4caf50;
                        transition: width 0.4s ease;
                    "></div>
    
                    <span style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #222;
                    ">
                        ${releasePercentage}%
                    </span>
    
                </div>
    
            </td>
        `;
    
        tbody.appendChild(tr);
    });


    // Total percentage
    const total =
        totals.recruited +
        totals.credited +
        totals.released +
        totals.intendedForRelease;


    const totalPercentage =
        total > 0
            ? Number(
                ((totals.released / total) * 100).toFixed(1)
            )
            : 0;


    // Total row
    const totalRow = document.createElement('tr');

    totalRow.classList.add('total-row');

    totalRow.innerHTML = `
        <td>סה"כ</td>
        <td>${totals.recruited}</td>
        <td>${totals.credited}</td>
        <td>${totals.released}</td>
        <td>${totals.intendedForRelease}</td>
        <td>${totals.active}</td>
        <td>${totals.activeInventory}</td>
        <td class="percentage">
            ${totalPercentage}%
        </td>
    `;

    tbody.appendChild(totalRow);
}


// ===============================
// Render second table
// ===============================



// ===============================
// Your existing function
// ===============================
async function refreshTable(page = 1) {

    const searchInput = document.getElementById("search");

    const searchValue = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const res = await fetch(`${API}/vehicles`, {
        credentials: "include"
    });

    let vehicles = await res.json();

    console.log(vehicles);


    // Your existing filtering
    if (searchValue) {

        vehicles = vehicles.filter(v => {

            const availableText =
                v.available_for_service
                    ? "ניתן לגיוס"
                    : "לא ניתן";

            return (
                (v.id + "").includes(searchValue) ||
                (v.license_number || "").toLowerCase().includes(searchValue) ||
                (v.tool_code || "").toLowerCase().includes(searchValue) ||
                (v.status || "").toLowerCase().includes(searchValue) ||
                (v.unitcode || "").toLowerCase().includes(searchValue) ||
                (v.recruitment_type || "").toLowerCase().includes(searchValue) ||
                (v.manager_group || "").toLowerCase().includes(searchValue) ||
                (v.vehicle_type || "").toLowerCase().includes(searchValue) ||
                (v.ownership_type || "").toLowerCase().includes(searchValue) ||
                (v.responsible_yerma || "").toLowerCase().includes(searchValue) ||
                (v.excel_status || "").toLowerCase().includes(searchValue) ||
                availableText.toLowerCase().includes(searchValue)
            );
        });
    }


    // ========================================
    // Call the second summary here
    // ========================================
    renderCommandSummary(vehicles);


    // Continue with your existing table code...
}