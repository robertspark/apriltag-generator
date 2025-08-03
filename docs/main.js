// Get PDF/ZIP libraries from global
const { jsPDF } = window.jspdf;
const JSZip = window.JSZip;

// PDF button handler
document.getElementById("pdfBtn").addEventListener("click", () => {
  const startId = parseInt(document.getElementById("startId").value, 10);
  const endId = parseInt(document.getElementById("endId").value, 10);
  const family = document.getElementById("family").value;
  const paper = document.getElementById("paperSize").value;

  const pdf = new jsPDF({ format: paper });

  for (let id = startId; id <= endId; id++) {
    const matrix = window.apriltag.render(family, id);
    const N = matrix.length;

    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const tagSize = Math.min(w, h) - 2 * margin;
    const cell = tagSize / N;
    const ox = (w - tagSize) / 2;
    const oy = (h - tagSize) / 2;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        pdf.setFillColor(matrix[r][c] ? 0 : 255);
        pdf.rect(ox + c * cell, oy + r * cell, cell, cell, "F");
      }
    }

    pdf.setFontSize(18);
    pdf.text(`AprilTag Family: ${family}`, w / 2, margin, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`Tag ID: ${id}`, margin, h - margin);
    pdf.text(`Paper Size: ${paper.toUpperCase()}`, w - margin, h - margin, { align: "right" });

    if (id < endId) pdf.addPage();
  }

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apriltags_${family}_${startId}-${endId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// SVG + ZIP generation
document.getElementById("svgBtn").addEventListener("click", () => {
  const startId = parseInt(document.getElementById("startId").value, 10);
  const endId = parseInt(document.getElementById("endId").value, 10);
  const family = document.getElementById("family").value;

  const zip = new JSZip();

  for (let id = startId; id <= endId; id++) {
    const matrix = window.apriltag.render(family, id);
    const N = matrix.length;
    const cell = 20;
    const size = N * cell;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        svg += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${matrix[r][c] ? "#000" : "#fff"}"/>`;
      }
    }
    svg += `</svg>`;

    zip.file(`apriltag_${family}_${id}.svg`, svg);
  }

  zip.generateAsync({ type: "blob" }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apriltags_${family}_${startId}-${endId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
