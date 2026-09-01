// Supabase Configuration
const SUPABASE_URL = "https://zdrwlntcovwsgomrdjco.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zRyAn60jfsKCGBWfCczxkw_vejGJQPw";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let allCadets = [];
let isEditorMode = false;
let selectedWing = "ALL";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Check local editor session
  if (localStorage.getItem("bncc_editor_active") === "true") {
    isEditorMode = true;
  }
  updateEditorUI();
  fetchCadets();
});

// 1. Fetch Cadets from Supabase
async function fetchCadets() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("cadets")
    .select("*")
    .order("id", { ascending: true });

  if (!error && data) {
    allCadets = data;
    updateCounts();
    renderAllSections();
  }
}

// 2. Counts Summary
function updateCounts() {
  const total = allCadets.length;
  const boys = allCadets.filter(c => c.platoon === "Boys Platoon").length;
  const girls = allCadets.filter(c => c.platoon === "Girls Platoon").length;
  const band = allCadets.filter(c => c.platoon === "Band Platoon").length;
  const ex = allCadets.filter(c => c.platoon === "Ex-Cadets").length;

  document.getElementById("countTotal").innerText = total;
  document.getElementById("countBoys").innerText = boys;
  document.getElementById("countGirls").innerText = girls;
  document.getElementById("countBand").innerText = band;
  document.getElementById("countEx").innerText = ex;

  document.getElementById("badge-boys").innerText = `${boys} Cadets`;
  document.getElementById("badge-girls").innerText = `${girls} Cadets`;
  document.getElementById("badge-band").innerText = `${band} Cadets`;
  document.getElementById("badge-ex").innerText = `${ex} Alumni/Ex-Cadets`;
}

// 3. Render Card HTML
function createCadetCard(c) {
  const isFemale = c.gender && c.gender.toLowerCase() === "female";
  
  // Mask phone for female in View mode
  let displayPhone = c.phone || 'N/A';
  if (isFemale && !isEditorMode && c.phone && c.phone.length > 5) {
    displayPhone = c.phone.substring(0, 3) + "********" + c.phone.slice(-1);
  }

  return `
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group">
      <!-- Top Card Header -->
      <div>
        <div class="flex items-start justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-sm border border-slate-200">
              ${c.name_en ? c.name_en.charAt(0) : 'C'}
            </div>
            <div>
              <h3 class="font-extrabold text-sm text-slate-800 leading-tight">${c.name_en}</h3>
              ${c.name_bn ? `<p class="text-[11px] text-slate-500 mt-0.5">${c.name_bn}</p>` : ''}
            </div>
          </div>
          
          <!-- Editor Edit/Delete Icons -->
          ${isEditorMode ? `
            <div class="flex items-center gap-1.5 text-slate-400">
              <button onclick="editCadet(${c.id})" class="hover:text-indigo-600 p-1" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="deleteCadet(${c.id})" class="hover:text-rose-600 p-1" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          ` : ''}
        </div>

        <!-- Role / Status Capsule -->
        ${c.current_status ? `
          <div class="mb-3 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
            <i class="fa-solid fa-user-tag mr-1 text-emerald-600"></i>${c.current_status}
          </div>
        ` : ''}

        <!-- Cadet No & Rank Pill Box -->
        <div class="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-2 mb-3 text-center">
          <div>
            <span class="text-[9px] uppercase font-bold text-slate-400 block">CADET NO</span>
            <span class="text-xs font-bold text-slate-700">${c.cadet_no || 'N/A'}</span>
          </div>
          <div class="border-l border-slate-200">
            <span class="text-[9px] uppercase font-bold text-slate-400 block">RANK</span>
            <span class="text-xs font-bold text-indigo-600 uppercase">${c.rank || 'Cadet'}</span>
          </div>
        </div>

        <!-- Achievements & Camps Bar -->
        ${c.camps ? `
          <div class="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 mb-3 text-[11px] text-amber-900 flex justify-between items-center">
            <span><i class="fa-solid fa-award text-amber-600 mr-1.5"></i><b>Achievements & Camps:</b> ${c.camps}</span>
            <span class="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">View</span>
          </div>
        ` : ''}

        <!-- Contact & Address Details -->
        <div class="space-y-1 text-[11px] text-slate-500">
          ${c.email ? `<div class="flex items-center gap-1.5"><i class="fa-regular fa-envelope text-slate-400 w-3.5"></i><span class="truncate">${c.email}</span></div>` : ''}
          <div class="flex items-center gap-1.5">
            <i class="fa-solid fa-phone text-slate-400 w-3.5"></i>
            <span class="font-medium ${isFemale && !isEditorMode ? 'text-amber-600' : 'text-slate-700'}">${displayPhone}</span>
          </div>
          ${c.achievements ? `<div class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-slate-400 w-3.5"></i><span class="truncate">${c.achievements}</span></div>` : ''}
        </div>
      </div>

      <!-- Card Bottom Footer (Gender & Blood Group) -->
      <div class="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold">
        <div class="flex items-center gap-1.5">
          ${c.blood_group ? `<span class="bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded">${c.blood_group}</span>` : ''}
          <span class="text-slate-500">${c.gender || 'Male'}</span>
        </div>
        <span class="text-slate-400 font-normal"><i class="fa-regular fa-clock mr-1"></i>Active</span>
      </div>
    </div>
  `;
}

// 4. Render All 4 Sections with Filters
function renderAllSections() {
  const query = document.getElementById("filterSearch").value.toLowerCase();
  const rank = document.getElementById("filterRank").value;
  const blood = document.getElementById("filterBlood").value;

  const sections = [
    { key: "Boys Platoon", grid: "grid-boys", sec: "section-boys" },
    { key: "Girls Platoon", grid: "grid-girls", sec: "section-girls" },
    { key: "Band Platoon", grid: "grid-band", sec: "section-band" },
    { key: "Ex-Cadets", grid: "grid-ex", sec: "section-ex" }
  ];

  sections.forEach(({ key, grid, sec }) => {
    const secEl = document.getElementById(sec);
    const gridEl = document.getElementById(grid);
    if (!gridEl) return;

    // Wing Filter Visibility
    if (selectedWing !== "ALL" && selectedWing !== key) {
      secEl.classList.add("hidden");
      return;
    } else {
      secEl.classList.remove("hidden");
    }

    // Filter List
    const list = allCadets.filter(c => {
      if (c.platoon !== key) return false;
      const matchesSearch = !query || 
        (c.name_en && c.name_en.toLowerCase().includes(query)) ||
        (c.name_bn && c.name_bn.toLowerCase().includes(query)) ||
        (c.cadet_no && c.cadet_no.toLowerCase().includes(query)) ||
        (c.current_status && c.current_status.toLowerCase().includes(query));
      const matchesRank = rank === "ALL" || (c.rank && c.rank.toLowerCase().includes(rank.toLowerCase()));
      const matchesBlood = blood === "ALL" || c.blood_group === blood;
      return matchesSearch && matchesRank && matchesBlood;
    });

    let html = list.map(c => createCadetCard(c)).join("");

    // If in Editor Mode: Append "➕ Add New Cadet" Box in that section
    if (isEditorMode) {
      html += `
        <div onclick="openCadetModal('${key}')" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[220px]">
          <div class="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 text-xl font-bold mb-2">
            <i class="fa-solid fa-plus"></i>
          </div>
          <h4 class="font-bold text-sm text-slate-800">Add New Cadet</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Add to ${key}</p>
        </div>
      `;
    }

    if (!html && !isEditorMode) {
      gridEl.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-slate-400">No records found in this section.</div>`;
    } else {
      gridEl.innerHTML = html;
    }
  });
}

// 5. Wing Filter Controls
function filterWing(wing) {
  selectedWing = wing;
  document.querySelectorAll(".wing-btn").forEach(btn => {
    btn.classList.remove("bg-indigo-600", "text-white");
    btn.classList.add("bg-white", "text-slate-700");
  });
  const activeBtn = document.getElementById(`tab-${wing.replace(/\s+/g, '')}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "text-slate-700");
    activeBtn.classList.add("bg-indigo-600", "text-white");
  }
  renderAllSections();
}

function clearFilters() {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterRank").value = "ALL";
  document.getElementById("filterBlood").value = "ALL";
  filterWing("ALL");
}

// 6. Editor Auth & Mode Toggles
function openPinModal() {
  document.getElementById("pinModal").classList.remove("hidden");
  document.getElementById("pinCodeInput").value = "";
  document.getElementById("pinCodeInput").focus();
}

function closePinModal() {
  document.getElementById("pinModal").classList.add("hidden");
}

function verifyPin() {
  const pin = document.getElementById("pinCodeInput").value;
  if (pin === "7860") {
    isEditorMode = true;
    localStorage.setItem("bncc_editor_active", "true");
    closePinModal();
    updateEditorUI();
    renderAllSections();
  } else {
    alert("Incorrect Security PIN!");
  }
}

function exitEditMode() {
  isEditorMode = false;
  localStorage.removeItem("bncc_editor_active");
  updateEditorUI();
  renderAllSections();
}

function updateEditorUI() {
  const badge = document.getElementById("modeBadge");
  if (isEditorMode) {
    document.getElementById("viewModeControls").classList.add("hidden");
    document.getElementById("editModeControls").classList.remove("hidden");
    badge.innerHTML = `<i class="fa-solid fa-pen-nib text-amber-400 mr-1"></i> Editor Active`;
    badge.className = "text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 font-medium border border-amber-800/40";
  } else {
    document.getElementById("viewModeControls").classList.remove("hidden");
    document.getElementById("editModeControls").classList.add("hidden");
    badge.innerHTML = `<i class="fa-solid fa-eye text-blue-400 mr-1"></i> View Only`;
    badge.className = "text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700";
  }
}

// 7. Add / Edit / Delete Modal Logic
function openCadetModal(defaultPlatoon = "Boys Platoon") {
  document.getElementById("cadetModal").classList.remove("hidden");
  document.getElementById("modalCadetForm").reset();
  document.getElementById("f_id").value = "";
  document.getElementById("modalTitle").innerText = "Add New Cadet";
  document.getElementById("f_platoon").value = defaultPlatoon;
}

function closeCadetModal() {
  document.getElementById("cadetModal").classList.add("hidden");
}

function editCadet(id) {
  const c = allCadets.find(x => x.id === id);
  if (!c) return;

  document.getElementById("cadetModal").classList.remove("hidden");
  document.getElementById("modalTitle").innerText = "Edit Cadet Profile";
  document.getElementById("f_id").value = c.id;
  document.getElementById("f_platoon").value = c.platoon || "Boys Platoon";
  document.getElementById("f_cadet_no").value = c.cadet_no || "";
  document.getElementById("f_name_en").value = c.name_en || "";
  document.getElementById("f_name_bn").value = c.name_bn || "";
  document.getElementById("f_rank").value = c.rank || "";
  document.getElementById("f_gender").value = c.gender || "Male";
  document.getElementById("f_blood").value = c.blood_group || "";
  document.getElementById("f_phone").value = c.phone || "";
  document.getElementById("f_email").value = c.email || "";
  document.getElementById("f_address").value = c.achievements || "";
  document.getElementById("f_status").value = c.current_status || "";
  document.getElementById("f_camps").value = c.camps || "";
}

async function saveCadetForm(e) {
  e.preventDefault();
  const id = document.getElementById("f_id").value;
  const cadetData = {
    platoon: document.getElementById("f_platoon").value,
    cadet_no: document.getElementById("f_cadet_no").value,
    name_en: document.getElementById("f_name_en").value,
    name_bn: document.getElementById("f_name_bn").value,
    rank: document.getElementById("f_rank").value,
    gender: document.getElementById("f_gender").value,
    blood_group: document.getElementById("f_blood").value,
    phone: document.getElementById("f_phone").value,
    email: document.getElementById("f_email").value,
    achievements: document.getElementById("f_address").value,
    current_status: document.getElementById("f_status").value,
    camps: document.getElementById("f_camps").value
  };

  if (id) {
    // Update existing
    const { error } = await supabaseClient.from("cadets").update(cadetData).eq("id", id);
    if (error) alert("Update failed: " + error.message);
  } else {
    // Insert new
    const { error } = await supabaseClient.from("cadets").insert([cadetData]);
    if (error) alert("Insert failed: " + error.message);
  }

  closeCadetModal();
  fetchCadets();
}

async function deleteCadet(id) {
  if (!confirm("Are you sure you want to delete this cadet record?")) return;
  const { error } = await supabaseClient.from("cadets").delete().eq("id", id);
  if (error) alert("Delete failed: " + error.message);
  else fetchCadets();
}

// 8. Export to Excel (.xlsx)
function exportToExcel() {
  if (!allCadets.length) return alert("No data to export!");
  const exportData = allCadets.map(c => ({
    "Cadet ID": c.cadet_no,
    "Name (English)": c.name_en,
    "Name (Bangla)": c.name_bn,
    "Platoon": c.platoon,
    "Rank": c.rank,
    "Gender": c.gender,
    "Blood Group": c.blood_group,
    "Phone": c.phone,
    "Email": c.email,
    "Role / Status": c.current_status,
    "Camps": c.camps
  }));
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cadets");
  XLSX.writeFile(wb, "NGDC_BNCC_Cadet_Directory.xlsx");
}
