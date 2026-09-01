// Supabase Setup
const SUPABASE_URL = "https://zdrwlntcovwsgomrdjco.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zRyAn60jfsKCGBWfCczxkw_vejGJQPw";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let allCadets = [];
let currentPlatoon = "ALL";
let base64CadetImage = "";
let base64BlogImage = "";

// 1. Auth & Wall Check
function checkAuth() {
  const isAuth = localStorage.getItem("bncc_user_auth");
  const isPortal = window.location.pathname.includes("portal.html");
  if (isPortal && isAuth !== "true") {
    window.location.href = "login.html";
  }
}

function handleLogin(e) {
  e.preventDefault();
  localStorage.setItem("bncc_user_auth", "true");
  window.location.href = "portal.html";
}

function handleLogout() {
  localStorage.removeItem("bncc_user_auth");
  window.location.href = "login.html";
}

// 2. Admin Pin
function unlockAdmin() {
  const pin = document.getElementById("pinInput").value;
  if (pin === "7860") {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("editorScreen").classList.remove("hidden");
    loadAdminCadets();
  } else {
    alert("Incorrect Security PIN!");
  }
}

// 3. Image Drag & Drop Helper
function setupDropZone(dropAreaId, inputId, previewId, callback) {
  const dropArea = document.getElementById(dropAreaId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!dropArea || !input) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dropArea.addEventListener(evt, e => e.preventDefault());
  });

  dropArea.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length) handleFile(files[0]);
  });

  input.addEventListener('change', e => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) return alert('Please upload an image file!');
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target.result);
      if (preview) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(file);
  }
}

// 4. Fetch and Render Cadets (Portal)
async function loadCadets() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.from("cadets").select("*").order("id", { ascending: true });
  if (!error && data) {
    allCadets = data;
    renderCadets();
  }
}

function setPlatoon(plat) {
  currentPlatoon = plat;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("bg-red-600", "text-white");
    btn.classList.add("bg-slate-900", "text-slate-400");
  });
  const activeBtn = document.getElementById(`tab-${plat.replace(/\s+/g, '')}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-slate-900", "text-slate-400");
    activeBtn.classList.add("bg-red-600", "text-white");
  }
  renderCadets();
}

function renderCadets() {
  const grid = document.getElementById("cadetGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const query = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toLowerCase() : "";
  const blood = document.getElementById("bloodFilter") ? document.getElementById("bloodFilter").value : "ALL";

  const filtered = allCadets.filter(c => {
    const matchesSearch = !query || 
      (c.name_en && c.name_en.toLowerCase().includes(query)) ||
      (c.name_bn && c.name_bn.toLowerCase().includes(query)) ||
      (c.cadet_no && c.cadet_no.toLowerCase().includes(query));
    const matchesPlatoon = currentPlatoon === "ALL" || c.platoon === currentPlatoon;
    const matchesBlood = blood === "ALL" || c.blood_group === blood;
    return matchesSearch && matchesPlatoon && matchesBlood;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">No cadets found.</div>`;
    return;
  }

  filtered.forEach(c => {
    const isFemale = c.gender && c.gender.toLowerCase() === 'female';
    const card = document.createElement("div");
    card.className = "bg-slate-900/90 border border-slate-800 hover:border-red-600/50 transition rounded-2xl p-5 shadow-lg flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-red-600/60 bg-slate-950 flex items-center justify-center flex-shrink-0">
            ${c.photo_url ? `<img src="${c.photo_url}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-slate-600 text-xl"></i>`}
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">
              ${c.platoon || 'Cadet'}
            </span>
            <span class="text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
              🩸 ${c.blood_group || 'N/A'}
            </span>
          </div>
        </div>
        <h3 class="font-bold text-white text-base leading-tight">${c.name_en}</h3>
        ${c.name_bn ? `<p class="text-xs text-slate-400 mt-0.5">${c.name_bn}</p>` : ''}
        <p class="text-xs text-red-400 font-semibold mt-1.5">${c.rank || ''} ${c.cadet_no ? '• ID: ' + c.cadet_no : ''}</p>
        ${c.current_status ? `<div class="mt-3 text-xs text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800/80"><i class="fa-solid fa-briefcase text-red-500 mr-1.5"></i>${c.current_status}</div>` : ''}
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-1 text-xs text-slate-400">
        <div>
          <i class="fa-solid fa-phone text-slate-500 mr-2"></i>
          ${isFemale ? '<span class="text-amber-500/90 font-medium">🔒 Protected for Privacy</span>' : (c.phone || 'N/A')}
        </div>
        ${c.email ? `<div><i class="fa-solid fa-envelope text-slate-500 mr-2"></i>${c.email}</div>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

// 5. Blogs Loader (For Index & Portal)
async function loadBlogs() {
  const blogContainer = document.getElementById("blogsContainer");
  if (!blogContainer || !supabaseClient) return;
  const { data, error } = await supabaseClient.from("blogs").select("*").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) {
    blogContainer.innerHTML = `<p class="text-xs text-slate-500 col-span-full text-center">No blog updates published yet.</p>`;
    return;
  }
  blogContainer.innerHTML = "";
  data.forEach(b => {
    const post = document.createElement("div");
    post.className = "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-red-900/50 transition flex flex-col";
    post.innerHTML = `
      ${b.image_url ? `<img src="${b.image_url}" class="h-44 w-full object-cover">` : `<div class="h-40 bg-slate-950 flex items-center justify-center text-slate-700"><i class="fa-solid fa-image text-3xl"></i></div>`}
      <div class="p-5 flex flex-col justify-between flex-grow">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 border border-red-800/40 px-2 py-0.5 rounded">${b.category || 'Update'}</span>
          <h3 class="font-bold text-white text-base mt-2 leading-snug">${b.title}</h3>
          <p class="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">${b.content}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-500">
          <span>By <b>${b.author}</b></span>
          <span>${new Date(b.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    blogContainer.appendChild(post);
  });
}

// Form Handlers (Admin)
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadCadets();
  loadBlogs();

  setupDropZone("cadetDropZone", "cadetPhotoInput", "cadetPhotoPreview", url => base64CadetImage = url);
  setupDropZone("blogDropZone", "blogPhotoInput", "blogPhotoPreview", url => base64BlogImage = url);

  const cadetForm = document.getElementById("cadetForm");
  if (cadetForm) {
    cadetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newCadet = {
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
        achievements: document.getElementById("f_achievements").value,
        photo_url: base64CadetImage || null
      };
      const { error } = await supabaseClient.from("cadets").insert([newCadet]);
      if (error) alert("Error adding cadet: " + error.message);
      else { alert("Cadet profile saved successfully!"); cadetForm.reset(); location.reload(); }
    });
  }

  const blogForm = document.getElementById("blogForm");
  if (blogForm) {
    blogForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newBlog = {
        title: document.getElementById("b_title").value,
        author: document.getElementById("b_author").value,
        category: document.getElementById("b_category").value,
        content: document.getElementById("b_content").value,
        image_url: base64BlogImage || null
      };
      const { error } = await supabaseClient.from("blogs").insert([newBlog]);
      if (error) alert("Error publishing blog: " + error.message);
      else { alert("Blog published successfully!"); blogForm.reset(); location.reload(); }
    });
  }
});
