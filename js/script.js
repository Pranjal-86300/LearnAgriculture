let currentLang = 'en';
let crops = [];
let selectedCrop = null;

const langMap = {
  en: {
    nameKey: 'Crop Name',
    file: 'data/clean_crops_en.json'
  },
  hi: {
    nameKey: 'फसल का नाम',
    file: 'data/clean_crops_hi.json'
  }
};

async function loadCrops() {
  const res = await fetch(langMap[currentLang].file);
  crops = await res.json();
  renderCropList(crops);
}

function renderCropList(data) {
  const ul = document.getElementById('crop-list');
  ul.innerHTML = '';
  data.forEach(crop => {
    const li = document.createElement('li');
    li.textContent = crop[langMap[currentLang].nameKey];
    li.onclick = () => {
      selectedCrop = crop;
      showCropDetails(crop);
    };
    ul.appendChild(li);
  });
}

function showCropDetails(crop) {
  const details = document.getElementById('crop-details');
  details.innerHTML = '';

  const title = document.createElement('h1');
  title.style.color = '#2e7d32';
  title.textContent = crop[langMap[currentLang].nameKey];
  details.appendChild(title);

  for (const [key, value] of Object.entries(crop)) {
    if (key === langMap[currentLang].nameKey) continue;

    const label = document.createElement('h4');
    label.style.marginTop = '1rem';
    label.textContent = key;
    details.appendChild(label);

    if (Array.isArray(value)) {
      const ul = document.createElement('ul');
      value.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      details.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.textContent = value;
      details.appendChild(p);
    }
  }
}

function filterCrops() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = crops.filter(c =>
    c[langMap[currentLang].nameKey].toLowerCase().includes(query)
  );
  renderCropList(filtered);
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  document.getElementById('language-toggle').textContent = currentLang === 'en' ? 'हिंदी' : 'English';
  document.getElementById('search-input').value = '';
  loadCrops();
}

function downloadPDF() {
  if (!selectedCrop) {
    alert("Select a crop first!");
    return;
  }

  const fileName = (selectedCrop?.[langMap[currentLang].nameKey] || "crop-details")
    .replace(/[^a-zA-Z0-9\u0900-\u097F_-]/g, "_") + ".pdf";

  const element = document.getElementById('crop-details');

  const opt = {
    margin:       0.5,
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
}


// Event listeners
document.getElementById('search-input').addEventListener('input', filterCrops);
document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
document.getElementById('search-button').addEventListener('click', filterCrops);
document.getElementById('download-pdf').addEventListener('click', downloadPDF);
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navbar').classList.toggle('open');
});

loadCrops();
