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
  const url = lang === 'en' ? 'data/clean_crops_en.json' : 'data/clean_crops_hi.json';
  fetch(url)
    .then(res => res.json())
    .then(data => {
      cropData = data; // already an array now
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

    if (Array.isArray(value)) {
      value = `<ul>${value.map(item => `<li>${formatObj(item)}</li>`).join('')}</ul>`;
    } else if (typeof value === 'object') {
      value = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
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

  const fontSize = 11;
  const lineHeight = 6;
  let y = 10;

  // Font setup
  if (currentLanguage === 'hi' && typeof NotoSansDevanagari !== 'undefined') {
    doc.addFileToVFS("NotoSansDevanagari.ttf", NotoSansDevanagari);
    doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
    doc.setFont("NotoSansDevanagari");
  } else {
    doc.setFont("helvetica");
  }

  doc.setFontSize(14);
  doc.text(get(currentCrop, 'Crop Name', 'फसल का नाम'), 10, y);
  y += 10;

  doc.setFontSize(fontSize);

  for (const key in currentCrop) {
    if (key === 'Crop Name' || key === 'फसल का नाम') continue;

    const title = formatKey(key);
    let val = currentCrop[key];

    doc.setFont(undefined, 'bold');
    doc.text(`${title}:`, 10, y);
    y += lineHeight;
    doc.setFont(undefined, 'normal');

    if (Array.isArray(val)) {
      val.forEach(item => {
        const lines = doc.splitTextToSize("• " + item, 180);
        lines.forEach(line => {
          doc.text(line, 15, y);
          y += lineHeight;
        });
      });
    } else {
      const lines = doc.splitTextToSize(String(val), 180);
      lines.forEach(line => {
        doc.text(line, 15, y);
        y += lineHeight;
      });
    }

    y += 2;
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
