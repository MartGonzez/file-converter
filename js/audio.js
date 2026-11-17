lucide.createIcons();

let audioFilesArray = [];

const dropZone = document.getElementById('audio-drop-zone');
const fileInput = document.getElementById('audio-file-input');
const listContainer = document.getElementById('audio-list-container');
const audioList = document.getElementById('audio-list');
const audioCount = document.getElementById('audio-count');
const targetFormat = document.getElementById('audio-target-format');
const bitrateSelect = document.getElementById('audio-bitrate');
const channelsSelect = document.getElementById('audio-channels');
const convertBtn = document.getElementById('audio-convert-btn');
const zipBtn = document.getElementById('audio-zip-btn');
const clearBtn = document.getElementById('audio-clear-btn');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-active'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-active');
  handleAudioFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleAudioFiles(e.target.files));

function handleAudioFiles(files) {
  const valid = Array.from(files).filter(f => f.type.startsWith('audio/') || f.type.startsWith('video/'));
  if (valid.length === 0) return;

  valid.forEach(file => {
    const dotIndex = file.name.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
    audioFilesArray.push({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      customName: baseName,
      convertedBlob: null,
      convertedExt: '',
      status: 'Pendiente'
    });
  });

  renderAudioUI();
}

function renderAudioUI() {
  if (audioFilesArray.length > 0) {
    listContainer.classList.remove('hidden');
    audioCount.textContent = audioFilesArray.length;
  } else {
    listContainer.classList.add('hidden');
  }

  audioList.innerHTML = '';

  audioFilesArray.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm';
    const sizeMb = (item.file.size / (1024 * 1024)).toFixed(2);

    itemEl.innerHTML = `
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center border border-blue-100">
          <i data-lucide="volume-2" class="w-6 h-6"></i>
        </div>
        <div class="min-w-0 flex-grow">
          <input type="text" value="${item.customName}" data-id="${item.id}" class="audio-name-input text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 rounded w-full">
          <p class="text-xs text-slate-400 mt-0.5">${sizeMb} MB • ${item.status}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto justify-end">
        ${item.convertedBlob ? `
          <audio controls src="${URL.createObjectURL(item.convertedBlob)}" class="h-8 max-w-[180px]"></audio>
          <a href="${URL.createObjectURL(item.convertedBlob)}" download="${item.customName}.${item.convertedExt}" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1 transition-colors">
            <i data-lucide="download" class="w-4 h-4"></i> Descargar
          </a>
        ` : `
          <span class="text-xs text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">${item.status}</span>
        `}
        <button onclick="removeAudioItem('${item.id}')" class="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    `;

    audioList.appendChild(itemEl);
  });

  document.querySelectorAll('.audio-name-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const target = audioFilesArray.find(f => f.id === e.target.getAttribute('data-id'));
      if (target) target.customName = e.target.value || 'audio';
    });
  });

  lucide.createIcons();
}

window.removeAudioItem = function(id) {
  audioFilesArray = audioFilesArray.filter(i => i.id !== id);
  if (audioFilesArray.length === 0) zipBtn.classList.add('hidden');
  renderAudioUI();
};

clearBtn.addEventListener('click', () => {
  audioFilesArray = [];
  zipBtn.classList.add('hidden');
  renderAudioUI();
});

convertBtn.addEventListener('click', async () => {
  const format = targetFormat.value;
  const kbps = parseInt(bitrateSelect.value, 10);
  const forceMono = channelsSelect.value === '1';

  convertBtn.disabled = true;
  convertBtn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Procesando...`;
  lucide.createIcons();

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  for (let item of audioFilesArray) {
    item.status = 'Codificando...';
    renderAudioUI();

    try {
      const arrayBuffer = await item.file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      if (format === 'wav') {
        item.convertedBlob = audioBufferToWav(audioBuffer, forceMono);
        item.convertedExt = 'wav';
      } else {
        item.convertedBlob = audioBufferToMp3(audioBuffer, kbps, forceMono);
        item.convertedExt = 'mp3';
      }
      item.status = 'Completado';
    } catch (err) {
      item.status = 'Error al decodificar';
    }
  }

  convertBtn.disabled = false;
  convertBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-5 h-5"></i> Convertir Audios`;
  zipBtn.classList.remove('hidden');
  renderAudioUI();
});

function audioBufferToWav(buffer, forceMono) {
  const numChannels = forceMono ? 1 : buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + buffer.length * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, buffer.length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = buffer.getChannelData(ch)[i];
      if (forceMono && buffer.numberOfChannels > 1) {
        sample = (buffer.getChannelData(0)[i] + buffer.getChannelData(1)[i]) * 0.5;
      }
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}

function audioBufferToMp3(buffer, kbps, forceMono) {
  const channels = forceMono ? 1 : Math.min(2, buffer.numberOfChannels);
  const mp3encoder = new lamejs.Mp3Encoder(channels, buffer.sampleRate, kbps);
  const mp3Data = [];

  const left = floatTo16BitPCM(buffer.getChannelData(0));
  const right = channels > 1 ? floatTo16BitPCM(buffer.getChannelData(1)) : left;

  const blockSize = 1152;
  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    const rightChunk = right.subarray(i, i + blockSize);
    const mp3buf = channels === 1
      ? mp3encoder.encodeBuffer(leftChunk)
      : mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
  }

  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) mp3Data.push(endBuf);

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

function floatTo16BitPCM(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

zipBtn.addEventListener('click', () => {
  const zip = new JSZip();
  audioFilesArray.forEach(item => {
    if (item.convertedBlob) zip.file(`${item.customName}.${item.convertedExt}`, item.convertedBlob);
  });
  zip.generateAsync({ type: 'blob' }).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'audios_convertidos.zip';
    a.click();
  });
});
