// Load AprilTag family
async function loadFamily(name) {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/apriltag@2.0.3/dist/families/${name}.json`);
  const cfg = await res.json();
  return new window.apriltag.AprilTagFamily(cfg);
}

// Globals
const { jsPDF } = window.jspdf;
const JSZip = window.JSZip;

// PDF
document.getElementById("pdfBtn").addEventListener("click", async () => {
  const startId = +document.getElementById("startId").value;
  const endId = +document.getElementById("endId").value;
  const familyName = document.getElementById("family").value;
  const paperSize = document.getElementById("paperSize").value;

  const tagFamily = await loadFamily(familyName);
  const pdf = new jsPDF({ format: paperSize });

  for (let id = startId; id <= endId; id++) {
    const bits = tagFamily.render(id);
    const N = bits.length;
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    const m = 5;
    const grid = Math.min(w, h) - 2*m;
    const cell = grid / N;
    const ox = (w - N*cell)/2;
    const oy = (h - N*cell)/2;

    bits.forEach((row,y) => {
      row.forEach((bit,x) => {
        pdf.setFillColor(bit?0:255);
        pdf.rect(ox + x*cell, oy + y*cell, cell, cell, "F");
      });
    });

    pdf.setFontSize(18);
    pdf.text(`AprilTag Family: ${familyName}`, w/2, m, { align:"center" });
    pdf.setFontSize(12);
    pdf.text(`Tag ID: ${id}`, m, h-m);
    pdf.text(`Paper Size: ${paperSize.toUpperCase()}`, w-m, h-m, { align:"right" });

    if (id < endId) pdf.addPage();
  }

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `apriltags_${familyName}_${startId}-${endId}.pdf`;
  document.body.appendChild(a);
  a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// SVG + ZIP
document.getElementById("svgBtn").addEventListener("click", async () => {
  const startId = +document.getElementById("startId").value;
  const endId = +document.getElementById("endId").value;
  const familyName = document.getElementById("family").value;

  const tagFamily = await loadFamily(familyName);
  const zip = new JSZip();

  for (let id = startId; id <= endId; id++) {
    const bits = tagFamily.render(id);
    const N = bits.length;
    const cell = 20;
    const size = N*cell;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    bits.forEach((row,y) => {
      row.forEach((bit,x) => {
        svg += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="${bit?"#000":"#fff"}"/>`;
      });
    });
    svg += `</svg>`;
    zip.file(`apriltag_${familyName}_${id}.svg`, svg);
  }

  const blob = await zip.generateAsync({ type:"blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `apriltags_${familyName}_${startId}-${endId}.zip`;
  document.body.appendChild(a);
  a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
