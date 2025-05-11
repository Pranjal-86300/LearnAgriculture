let currentLanguage = null;
let cropData = [];
let currentCrop = null;

const cropListEl = document.getElementById('cropList');
const cropDetailEl = document.getElementById('cropDetail');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const btnEnglish = document.getElementById('btnEnglish');
const btnHindi = document.getElementById('btnHindi');
const downloadBtn = document.getElementById('downloadBtn');

// Language selection buttons
btnEnglish.addEventListener('click', () => {
  currentLanguage = 'en';
  loadData('en');
});

btnHindi.addEventListener('click', () => {
  currentLanguage = 'hi';
  loadData('hi');
});

// Search input (live & button)
function handleSearch() {
  if (currentLanguage && cropData.length > 0) {
    const query = searchInput.value.trim().toLowerCase();
    renderCropList(query);
  }
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('input', handleSearch);

// Load JSON data
function loadData(lang) {
  const url = lang === 'en' ? 'data/crops.json' : 'data/cropshindi.json';
  fetch(url)
    .then(res => res.json())
    .then(data => {
      cropData = lang === 'en' ? data.crops : data['फसलें'];
      renderCropList('');
      cropDetailEl.innerHTML = '';
      searchInput.value = '';
    });
}

// Render crop list
function renderCropList(query) {
  cropListEl.innerHTML = '';
  cropData
    .filter(crop => {
      const name = currentLanguage === 'en' ? crop['Crop Name'] : crop['फसल का नाम'];
      return name && name.toLowerCase().includes(query);
    })
    .forEach(crop => {
      const name = currentLanguage === 'en' ? crop['Crop Name'] : crop['फसल का नाम'];
      if (!name) return;
      const div = document.createElement('div');
      div.className = 'crop-item';
      div.textContent = name;
      div.onclick = () => showCropDetail(crop);
      cropListEl.appendChild(div);
    });
}

// Show crop detail
function showCropDetail(crop) {
  currentCrop = crop;
  cropDetailEl.innerHTML = '';

  const detail = document.createElement('div');
  detail.innerHTML = `<h2>${get(crop, 'Crop Name', 'फसल का नाम')}</h2>`;

  for (const key in crop) {
    if (key === 'Crop Name' || key === 'फसल का नाम') continue;

    let title = key;
    let value = crop[key];

    if (typeof value === 'object') {
      value = Array.isArray(value)
        ? `<ul>${value.map(item => `<li>${formatObj(item)}</li>`).join('')}</ul>`
        : `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    }

    detail.innerHTML += `
      <h4>${formatKey(title)}</h4>
      <div>${value}</div>
    `;
  }

  cropDetailEl.appendChild(detail);
}

// Helpers
function get(obj, enKey, hiKey) {
  return currentLanguage === 'en' ? obj[enKey] : obj[hiKey];
}

function formatKey(str) {
  return str.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatObj(obj) {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
  return obj;
}

// Download PDF
downloadBtn.addEventListener('click', () => {
  if (!currentCrop) return alert('Please select a crop first.');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Use Hindi font if needed
  if (currentLanguage === 'hi' && typeof NotoSansDevanagari !== 'undefined') {
    doc.addFileToVFS("NotoSansDevanagari.ttf", NotoSansDevanagari);
    doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
    doc.setFont("NotoSansDevanagari");
  } else {
    doc.setFont("helvetica");
  }

  let y = 10;
  doc.setFontSize(14);
  doc.text(get(currentCrop, 'Crop Name', 'फसल का नाम'), 10, y);
  y += 10;

  for (const key in currentCrop) {
    if (key === 'Crop Name' || key === 'फसल का नाम') continue;
    let val = currentCrop[key];
    if (typeof val === 'object') val = JSON.stringify(val, null, 2);
    doc.setFontSize(11);
    doc.text(`${formatKey(key)}:`, 10, y);
    y += 5;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(val), 180);
    lines.forEach(line => {
      doc.text(line, 10, y);
      y += 5;
    });
    y += 3;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  }

  const fileName = get(currentCrop, 'Crop Name', 'फसल का नाम') + '.pdf';
  doc.save(fileName);
});

// Load English by default
currentLanguage = 'en';
loadData('en');
