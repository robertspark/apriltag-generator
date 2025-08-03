// Load AprilTag WASM and API
import init, { TagFamily } from "https://cdn.jsdelivr.net/npm/apriltag@2.0.3/dist/index.js";
await init();

// Grab UMD globals
const { jsPDF } = window.jspdf;
const JSZip = window.JSZip;

// PDF generation
document.getElementById("pdfBtn").addEventListener("click", () => {
  const startId    = parseInt(document.getElementById("startId").value, 10);
  const endId      = parseInt(document.getElementById("endId").value, 10);
  const familyName = document.getElementById("family").value;
  const paperSize  = document.getElementById("paperSize").value;

  const tagFamily = new TagFamily(familyName);
  const pdf = new jsPDF({ format: paperSize });

  for (let tagId = startId; tagId <= endId; tagId++) {
    const tagBits = tagFamily.getTagBits(tagId);
    const N = tagBits.length;
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    const margin = 5;              // mm
    const grid = Math.min(w, h) - 2 * margin;
    const cell = grid / N;
    const ox = (w - N * cell) / 2;
    const oy = (h - N * cell) / 2;

    // draw grid
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        pdf.setFillColor(tagBits[r][c] ? 0 : 255);
        pdf.rect(ox + c*cell, oy + r*cell, cell, cell, "F");
      }
    }

    // labels
    pdf.setFontSize(18);
    pdf.text(`AprilTag Family: ${familyName}`, w/2, margin, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`Tag ID: ${tagId}`, margin, h - margin);
    pdf.text(`Paper Size: ${paperSize.toUpperCase()}`, w - margin, h - margin, { align: "right" });

    if (tagId < endId) pdf.addPage();
  }

  // trigger download
  const blob = pdf.output("blob");
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `apriltags_${familyName}_${startId}-${endId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// SVG + ZIP generation
document.getElementById("svgBtn").addEventListener("click", () => {
  const startId    = parseInt(document.getElementById("startId").value, 10);
  const endId      = parseInt(document.getElementById("endId").value, 10);
  const familyName = document.getElementById("family").value;
  const tagFamily  = new TagFamily(familyName);
  const zip        = new JSZip();

  for (let tagId = startId; tagId <= endId; tagId++) {
    const bits = tagFamily.getTagBits(tagId);
    const N    = bits.length;
    const cell = 20;           // px
    const size = N * cell;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        svg += `<rect x="${c*cell}" y="${r*cell}" width="${cell}" height="${cell}" fill="${bits[r][c] ? "#000" : "#fff"}"/>`;
      }
    }
    svg += `</svg>`;
    zip.file(`apriltag_${familyName}_${tagId}.svg`, svg);
  }

  zip.generateAsync({ type: "blob" }).then(blob => {
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `apriltags_${familyName}_${startId}-${endId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
