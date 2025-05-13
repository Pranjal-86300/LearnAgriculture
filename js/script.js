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
  details.classList.remove('placeholder');
  details.innerHTML = '';

  if (!crop) {
    details.classList.add('placeholder');
    details.innerHTML = `
      <div class="instruction-card">
        <div class="half left">
          <h3>How to Use</h3>
          <ul>
            <li>Select the language using the toggle above.</li>
            <li>Search or scroll to select a crop from the list.</li>
            <li>View its detailed information on this screen.</li>
            <li>Click "Download as PDF" to save the crop info offline.</li>
          </ul>
        </div>
        <div class="half right">
          <h3>कैसे उपयोग करें</h3>
          <ul>
            <li>ऊपर दिए गए बटन से भाषा चुनें।</li>
            <li>फसल सूची में से एक फसल चुनें या खोजें।</li>
            <li>यहाँ फसल की जानकारी दिखाई जाएगी।</li>
            <li>PDF डाउनलोड बटन दबाकर जानकारी ऑफलाइन सेव करें।</li>
          </ul>
        </div>
      </div>
    `;
    return;
  }

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

  const original = document.getElementById('crop-details');
  const clone = original.cloneNode(true);

  // Reset layout and enforce full width
  Object.assign(clone.style, {
    width: '1000px', // match jsPDF width in px for A4
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px',
    background: 'white',
    color: 'black',
    fontSize: '13px',
    lineHeight: '1.6',
    boxSizing: 'border-box',
    position: 'relative'
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.zIndex = '-1';
  container.style.width = '1000px';
  container.appendChild(clone);
  document.body.appendChild(container);

  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1000
    },
    jsPDF: {
      unit: 'px',
      format: [1000, 1414], // A4 in px at 72dpi scale
      orientation: 'portrait'
    }
  };

  html2pdf().from(clone).set(opt).save().then(() => {
    document.body.removeChild(container);
  });
}
// Dropdown crop toggle (mobile)
document.getElementById('toggle-crops').addEventListener('click', () => {
  const cropList = document.getElementById('crop-list');
  const btn = document.getElementById('toggle-crops');
  cropList.classList.toggle('open');
  btn.textContent = cropList.classList.contains('open') ? '📋 Hide Crops ▲' : '📋 Show Crops ▼';
});

// Search input
document.getElementById('search-input').addEventListener('input', () => {
  filterCrops();
  const cropList = document.getElementById('crop-list');
  const toggleBtn = document.getElementById('toggle-crops');
  if (window.innerWidth <= 768 && !cropList.classList.contains('open')) {
    cropList.classList.add('open');
    toggleBtn.textContent = '📋 Hide Crops ▲';
  }
});

document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
document.getElementById('search-button').addEventListener('click', filterCrops);
document.getElementById('download-pdf').addEventListener('click', downloadPDF);

document.getElementById('hamburger').addEventListener('click', () => {
  const navbar = document.getElementById('navbar');
  const layout = document.querySelector('.main-layout');
  navbar.classList.toggle('open');

  if (window.innerWidth <= 768) {
    layout.classList.toggle('nav-open');
  }
});

loadCrops();
showCropDetails(null);
setTimeout(() => {
  document.querySelector('.main-layout').classList.add('animate-start');
}, 50);
