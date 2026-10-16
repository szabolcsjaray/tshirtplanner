const previewCanvas = document.getElementById('previewCanvas');
const ctx = previewCanvas.getContext('2d');

const labelFileInput = document.getElementById('labelFile');
const renderButton = document.getElementById('renderButton');
const downloadButton = document.getElementById('downloadButton');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const labelGapInput = document.getElementById('labelGap');
const labelGapValue = document.getElementById('labelGapValue');
const rowGapInput = document.getElementById('rowGap');
const rowGapValue = document.getElementById('rowGapValue');
const fontTypeInput = document.getElementById('fontType');
const outputWidthInput = document.getElementById('outputWidth');
const outputHeightInput = document.getElementById('outputHeight');
const paletteColorPicker = document.getElementById('paletteColorPicker');
const addPaletteColorButton = document.getElementById('addPaletteColor');
const paletteList = document.getElementById('paletteList');
const edgeFadeSizeInput = document.getElementById('edgeFadeSize');
const edgeFadeSizeValue = document.getElementById('edgeFadeSizeValue');

function buildBluePalette() {
  const colors = [];
  const dark = { r: 5, g: 35, b: 110 };
  const light = { r: 150, g: 210, b: 255 };

  for (let i = 0; i < 16; i += 1) {
    const progress = i / 15;
    const r = Math.round(dark.r + (light.r - dark.r) * progress);
    const g = Math.round(dark.g + (light.g - dark.g) * progress);
    const b = Math.round(dark.b + (light.b - dark.b) * progress);
    const toHex = (value) => value.toString(16).padStart(2, '0');
    colors.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  }

  return colors;
}

const defaultPalette = buildBluePalette();
const defaultLabels = ['T-SHIRT', 'DESIGN', 'TEAM', 'SUMMER', 'PRINT'];
let palette = [...defaultPalette];
let loadedLabels = defaultLabels.map((text) => ({ text, important: false }));

function syncValueLabels() {
  fontSizeValue.textContent = `${fontSizeInput.value}px`;
  labelGapValue.textContent = `${labelGapInput.value}px`;
  rowGapValue.textContent = `${rowGapInput.value}px`;
  edgeFadeSizeValue.textContent = `${edgeFadeSizeInput.value}px`;
}

function normalizeLabels(rawText) {
  return rawText
    .split(/\r?\n/)
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => {
      const important = label.startsWith('*');
      return {
        text: important ? label.slice(1).trim() : label,
        important,
      };
    })
    .filter((label) => label.text);
}

function shuffleLabels(labels) {
  const shuffled = [...labels];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

function getRandomColorIndex(previousIndex) {
  if (palette.length === 1) {
    return 0;
  }

  if (previousIndex < 0) {
    return Math.floor(Math.random() * palette.length);
  }

  const nextIndex = Math.floor(Math.random() * (palette.length - 1));
  return nextIndex >= previousIndex ? nextIndex + 1 : nextIndex;
}

function updatePaletteUI() {
  paletteList.innerHTML = '';

  palette.forEach((color, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'palette-swatch';

    const colorDot = document.createElement('span');
    colorDot.className = 'color-dot';
    colorDot.style.backgroundColor = color;

    const label = document.createElement('span');
    label.textContent = color.toUpperCase();

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.title = 'Remove color';
    removeButton.addEventListener('click', () => {
      if (palette.length <= 1) {
        return;
      }

      palette.splice(index, 1);
      updatePaletteUI();
      renderCanvas();
    });

    swatch.appendChild(colorDot);
    swatch.appendChild(label);
    swatch.appendChild(removeButton);
    paletteList.appendChild(swatch);
  });
}

function addColorToPalette() {
  const selectedColor = paletteColorPicker.value;
  if (!palette.includes(selectedColor)) {
    palette.push(selectedColor);
    updatePaletteUI();
    renderCanvas();
  }
}

function readUploadedLabels(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const labels = normalizeLabels(String(reader.result));
    loadedLabels = labels.length ? labels : defaultLabels.map((text) => ({ text, important: false }));
    renderCanvas();
  };
  reader.readAsText(file);
}

function getTextWidth(label) {
  return ctx.measureText(label).width;
}

function getAlphaForPosition(x, labelWidth, width, fadeSize) {
  if (fadeSize <= 0) {
    return 1;
  }

  const leftEdgeAlpha = x < 0 ? Math.max(0, 1 - Math.abs(x) / fadeSize) : 1;
  const rightEdgeAlpha = x + labelWidth > width ? Math.max(0, 1 - ((x + labelWidth - width) / fadeSize)) : 1;
  return Math.min(leftEdgeAlpha, rightEdgeAlpha);
}

function renderCanvas() {
  const width = Number(outputWidthInput.value) || 1200;
  const height = Number(outputHeightInput.value) || 1600;
  const fontSize = Number(fontSizeInput.value);
  const labelGap = Number(labelGapInput.value);
  const rowGap = Number(rowGapInput.value);
  const fontType = fontTypeInput.value;
  const edgeFadeSize = Number(edgeFadeSizeInput.value);

  previewCanvas.width = width;
  previewCanvas.height = height;
  ctx.clearRect(0, 0, width, height);

  if (!loadedLabels.length) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Upload a labels file to begin', width / 2, height / 2);
    return;
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  let labels = shuffleLabels(loadedLabels);

  const maxLabelWidth = labels.reduce((max, label) => {
    ctx.font = `${fontSize}px ${fontType}`;
    return Math.max(max, getTextWidth(label.text));
  }, 0);

  let y = 30;
  let labelIndex = 0;
  let lastColorIndex = -1;

  while (y + fontSize < height) {
    let x = -Math.random() * maxLabelWidth;

    while (x < width + maxLabelWidth) {
      if (labelIndex % labels.length === 0) {
        labels = shuffleLabels(loadedLabels);
      }
      const label = labels[labelIndex % labels.length];
      ctx.font = `${fontSize}px ${fontType}`;
      const labelWidth = getTextWidth(label.text);
      const alpha = getAlphaForPosition(x, labelWidth, width, edgeFadeSize);

      ctx.globalAlpha = alpha;
      const colorIndex = getRandomColorIndex(lastColorIndex);
      ctx.fillStyle = palette[colorIndex];
      lastColorIndex = colorIndex;
      ctx.fillText(label.text, x, y + fontSize);
      if (label.important) {
        ctx.fillText(label.text, x + 1, y + fontSize);
      }
      ctx.globalAlpha = 1;

      x += labelWidth + labelGap;
      labelIndex += 1;
    }
    y += fontSize + rowGap;
  }
  fadeEdges(ctx, edgeFadeSize);
  drawNote(ctx);
}

function drawNote(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.font = 'bold 480px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "EmojiOne Color", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000'; // color doesn't matter, only the shape/alpha does
  ctx.fillText('🎵', ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.restore();
}

function fadeEdges(ctx, fade = 40) {
  const { width: w, height: h } = ctx.canvas;
  if (fade <= 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';

  // Horizontal (left + right)
  const horizontalFade = Math.min(fade, w / 2);
  const hGrad = ctx.createLinearGradient(0, 0, w, 0);
  hGrad.addColorStop(0, 'transparent');
  hGrad.addColorStop(horizontalFade / w, 'black');
  hGrad.addColorStop(1 - horizontalFade / w, 'black');
  hGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, w, h);

  // Vertical (top + bottom)
  const verticalFade = Math.min(fade, h / 2);
  const vGrad = ctx.createLinearGradient(0, 0, 0, h);
  vGrad.addColorStop(0, 'transparent');
  vGrad.addColorStop(verticalFade / h, 'black');
  vGrad.addColorStop(1 - verticalFade / h, 'black');
  vGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

fontSizeInput.addEventListener('input', () => {
  syncValueLabels();
  renderCanvas();
});

labelGapInput.addEventListener('input', () => {
  syncValueLabels();
  renderCanvas();
});

rowGapInput.addEventListener('input', () => {
  syncValueLabels();
  renderCanvas();
});

edgeFadeSizeInput.addEventListener('input', () => {
  syncValueLabels();
  renderCanvas();
});

outputWidthInput.addEventListener('input', renderCanvas);
outputHeightInput.addEventListener('input', renderCanvas);
fontTypeInput.addEventListener('change', renderCanvas);
labelFileInput.addEventListener('change', readUploadedLabels);
addPaletteColorButton.addEventListener('click', addColorToPalette);
renderButton.addEventListener('click', renderCanvas);
downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'tshirt-plan.png';
  link.href = previewCanvas.toDataURL('image/png');
  link.click();
});

syncValueLabels();
updatePaletteUI();
renderCanvas();
