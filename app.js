// Supabase Setup
const SUPABASE_URL = "https://zdrwlntcovwsgomrdjco.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zRyAn60jfsKCGBWfCczxkw_vejGJQPw";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let allCadets = [];

// Admin Pin Auth System
function unlockAdmin() {
  const pin = document.getElementById("pinInput").value;
  if (pin === "7860") { // Master Admin PIN
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("editorScreen").classList.remove("hidden");
  } else {
    alert("Incorrect Security PIN!");
  }
}

// Fetch Cadets from Supabase
async function loadCadets() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("cadets")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching cadets:", error);
    return;
  }
  allCadets = data;
  renderCadets(allCadets);
}

// Render Cadet Cards in Directory
function renderCadets(list) {
  const grid = document.getElementById("cadetGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">No cadets found matching your criteria.</div>`;
    return;
  }

  list.forEach(c => {
    const card = document.createElement("div");
    card.className = "bg-slate-900 border border-slate-800 hover:border-red-900/60 transition duration-300 rounded-2xl p-5 shadow-lg flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-800/40">
            ${c.platoon || 'Platoon'}
          </span>
          <span class="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
            🩸 ${c.blood_group || 'N/A'}
          </span>
        </div>
        <h3 class="font-bold text-white text-base leading-tight">${c.name_en}</h3>
        ${c.name_bn ? `<p class="text-xs text-slate-400 font-normal mt-0.5">${c.name_bn}</p>` : ''}
        <p class="text-xs text-red-400 font-semibold mt-2">
          ${c.rank || ''} ${c.cadet_no ? '• ID: ' + c.cadet_no : ''}
        </p>

        ${c.current_status ? `
          <div class="mt-3 text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <i class="fa-solid fa-briefcase text-red-500 mr-1.5"></i> ${c.current_status}
          </div>
        ` : ''}

        ${c.achievements ? `
          <div class="mt-2 text-xs text-slate-400">
            <span class="text-slate-500 font-semibold">Specialty:</span> ${c.achievements}
          </div>
        ` : ''}
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1 text-xs text-slate-400">
        ${c.phone ? `<div><i class="fa-solid fa-phone text-slate-500 mr-2"></i>${c.phone}</div>` : ''}
        ${c.email ? `<div><i class="fa-solid fa-envelope text-slate-500 mr-2"></i>${c.email}</div>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

// Search and Filter Listeners
const searchInput = document.getElementById("searchInput");
const platoonFilter = document.getElementById("platoonFilter");
const bloodFilter = document.getElementById("bloodFilter");

function applyFilters() {
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  const platoon = platoonFilter ? platoonFilter.value : "ALL";
  const blood = bloodFilter ? bloodFilter.value : "ALL";

  const filtered = allCadets.filter(c => {
    const nameMatch = (c.name_en && c.name_en.toLowerCase().includes(query)) ||
                      (c.name_bn && c.name_bn.toLowerCase().includes(query));
    const idMatch = c.cadet_no && c.cadet_no.toLowerCase().includes(query);
    const statusMatch = c.current_status && c.current_status.toLowerCase().includes(query);
    const roleMatch = c.achievements && c.achievements.toLowerCase().includes(query);

    const matchesSearch = nameMatch || idMatch || statusMatch || roleMatch;
    const matchesPlatoon = platoon === "ALL" || c.platoon === platoon;
    const matchesBlood = blood === "ALL" || c.blood_group === blood;

    return (query === "" || matchesSearch) && matchesPlatoon && matchesBlood;
  });

  renderCadets(filtered);
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (platoonFilter) platoonFilter.addEventListener("change", applyFilters);
if (bloodFilter) bloodFilter.addEventListener("change", applyFilters);

// Form Submission in admin.html
const cadetForm = document.getElementById("cadetForm");
if (cadetForm) {
  cadetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newRecord = {
      platoon: document.getElementById("f_platoon").value,
      cadet_no: document.getElementById("f_cadet_no").value,
      rank: document.getElementById("f_rank").value,
      name_en: document.getElementById("f_name_en").value,
      name_bn: document.getElementById("f_name_bn").value,
      gender: document.getElementById("f_gender").value,
      blood_group: document.getElementById("f_blood").value,
      phone: document.getElementById("f_phone").value,
      email: document.getElementById("f_email").value,
      current_status: document.getElementById("f_status").value,
      camps: document.getElementById("f_camps").value,
      achievements: document.getElementById("f_achievements").value
    };

    const { error } = await supabaseClient.from("cadets").insert([newRecord]);
    if (error) {
      alert("Error adding cadet: " + error.message);
    } else {
      alert("Cadet profile successfully added to database!");
      cadetForm.reset();
    }
  });
}

// Authentication Logic for login.html
function switchAuth(type) {
  const regFields = document.getElementById("registerFields");
  const title = document.getElementById("formTitle");
  const subtitle = document.getElementById("formSubtitle");
  const submitBtn = document.getElementById("authSubmitBtn");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");

  if (type === "register") {
    regFields.classList.remove("hidden");
    title.innerText = "Cadet Registration";
    subtitle.innerText = "Register your profile to the official unit portal";
    submitBtn.innerText = "Create Account";
    tabRegister.className = "flex-1 py-2 rounded-lg bg-red-600 text-white transition font-semibold";
    tabLogin.className = "flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition";
  } else {
    regFields.classList.add("hidden");
    title.innerText = "Cadet Login";
    subtitle.innerText = "Access exclusive unit dashboard and records";
    submitBtn.innerText = "Sign In";
    tabLogin.className = "flex-1 py-2 rounded-lg bg-red-600 text-white transition font-semibold";
    tabRegister.className = "flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition";
  }
}

const authForm = document.getElementById("authForm");
if (authForm) {
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Redirect directly to cadet portal upon authentication
    window.location.href = "portal.html";
  });
}

document.addEventListener("DOMContentLoaded", loadCadets);