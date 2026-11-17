lucide.createIcons();

let filesArray = [];

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imageListContainer = document.getElementById('image-list-container');
const imageList = document.getElementById('image-list');
const fileCount = document.getElementById('file-count');
const targetFormat = document.getElementById('target-format');
const qualityRange = document.getElementById('quality-range');
const qualityVal = document.getElementById('quality-val');
const customPrefix = document.getElementById('custom-prefix');
const convertAllBtn = document.getElementById('convert-all-btn');
const downloadZipBtn = document.getElementById('download-zip-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-active'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-active');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
qualityRange.addEventListener('input', (e) => qualityVal.textContent = e.target.value + '%');

function handleFiles(files) {
  const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (validFiles.length === 0) return;

  validFiles.forEach(file => {
    filesArray.push({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      customName: file.name.substring(0, file.name.lastIndexOf('.')),
      convertedBlob: null,
      convertedExt: ''
    });
  });

  updateUI();
}

function updateUI() {
  if (filesArray.length > 0) {
    imageListContainer.classList.remove('hidden');
    fileCount.textContent = filesArray.length;
  } else {
    imageListContainer.classList.add('hidden');
  }

  imageList.innerHTML = '';

  filesArray.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm';
    
    const sizeKb = (item.file.size / 1024).toFixed(1);

    itemEl.innerHTML = `
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
          <img src="${URL.createObjectURL(item.file)}" class="w-full h-full object-cover">
        </div>
        <div class="min-w-0 flex-grow">
          <input type="text" value="${item.customName}" data-id="${item.id}" class="custom-name-input text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-slate-50 focus:outline-none px-1 py-0.5 rounded w-full transition-all" title="Haz clic para modificar el nombre">
          <p class="text-xs text-slate-400 mt-0.5">${item.file.type.split('/')[1]?.toUpperCase() || 'IMG'} • ${sizeKb} KB</p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto justify-end">
        ${item.convertedBlob ? `
          <a href="${URL.createObjectURL(item.convertedBlob)}" download="${getFinalFileName(item)}" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1 transition-colors">
            <i data-lucide="download" class="w-4 h-4"></i> Descargar
          </a>
        ` : `
          <span class="text-xs text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">Pendiente</span>
        `}
        <button onclick="removeItem('${item.id}')" class="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    `;

    imageList.appendChild(itemEl);
  });

  document.querySelectorAll('.custom-name-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.getAttribute('data-id');
      const targetItem = filesArray.find(f => f.id === id);
      if (targetItem) targetItem.customName = e.target.value || 'archivo';
    });
  });

  lucide.createIcons();
}

function getFinalFileName(item) {
  const globalPrefix = customPrefix.value.trim();
  const baseName = item.customName.trim() || 'archivo';
  const ext = item.convertedExt || 'jpg';

  if (globalPrefix) {
    return `${globalPrefix}_${baseName}.${ext}`;
  }
  return `${baseName}.${ext}`;
}

window.removeItem = function(id) {
  filesArray = filesArray.filter(item => item.id !== id);
  if (filesArray.length === 0) downloadZipBtn.classList.add('hidden');
  updateUI();
};

clearAllBtn.addEventListener('click', () => {
  filesArray = [];
  downloadZipBtn.classList.add('hidden');
  updateUI();
});

convertAllBtn.addEventListener('click', async () => {
  const format = targetFormat.value;
  const quality = parseFloat(qualityRange.value) / 100;

  let ext = 'jpg';
  if (format === 'image/webp') ext = 'webp';
  else if (format === 'image/avif') ext = 'avif';
  else if (format === 'image/png') ext = 'png';
  else if (format === 'image/x-icon') ext = 'ico';
  else if (format === 'image/bmp') ext = 'bmp';
  else if (format === 'image/tiff') ext = 'tiff';

  for (let item of filesArray) {
    item.convertedBlob = await convertImage(item.file, format, quality);
    item.convertedExt = ext;
  }

  downloadZipBtn.classList.remove('hidden');
  updateUI();
});

function convertImage(file, format, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Si el formato es ICO, redimensionar a estándar 32x32
      if (format === 'image/x-icon') {
        width = 32;
        height = 32;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Fondo blanco para JPG o BMP
      if (format === 'image/jpeg' || format === 'image/bmp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Si el navegador no soporta AVIF o TIFF nativamente, cae suavemente en PNG
      const mimeType = (format === 'image/x-icon') ? 'image/png' : format;

      canvas.toBlob((blob) => {
        resolve(blob);
      }, mimeType, quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

downloadZipBtn.addEventListener('click', () => {
  const zip = new JSZip();
  filesArray.forEach((item) => {
    if (item.convertedBlob) {
      zip.file(getFinalFileName(item), item.convertedBlob);
    }
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = (customPrefix.value.trim() || 'archivos_convertidos') + '.zip';
    a.click();
  });
});
