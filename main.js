(async () => {
  const tagModule = await import("https://cdn.jsdelivr.net/npm/apriltag-js@0.0.4/dist/apriltag.min.js");
  await tagModule.default();
  window._tagModule = tagModule;
})();

window.generatePDF = function () {
  const { jsPDF } = window.jspdf;
  const startId = parseInt(document.getElementById("startId").value);
  const endId = parseInt(document.getElementById("endId").value);
  const familyName = document.getElementById("family").value;
  const paperSize = document.getElementById("paperSize").value;

  const tagFamily = new window._tagModule.TagFamily(familyName);
  const pdf = new jsPDF({ format: paperSize });

  for (let tagId = startId; tagId <= endId; tagId++) {
    const tagBits = tagFamily.getTagBits(tagId);
    const cellCount = tagBits.length;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const gridSize = Math.min(pageWidth, pageHeight) - 2 * margin;
    const cellSize = gridSize / cellCount;
    const offsetX = (pageWidth - cellCount * cellSize) / 2;
    const offsetY = (pageHeight - cellCount * cellSize) / 2;

    for (let row = 0; row < cellCount; row++) {
      for (let col = 0; col < cellCount; col++) {
        const x = offsetX + col * cellSize;
        const y = offsetY + row * cellSize;
        pdf.setFillColor(tagBits[row][col] ? 0 : 255);
        pdf.rect(x, y, cellSize, cellSize, "F");
      }
    }

    pdf.setFontSize(18);
    pdf.text(`AprilTag Family: ${familyName}`, pageWidth / 2, margin, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Tag ID: ${tagId}`, margin, pageHeight - margin);
    pdf.text(`Paper Size: ${paperSize.toUpperCase()}`, pageWidth - margin, pageHeight - margin, { align: "right" });

    if (tagId < endId) pdf.addPage();
  }

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apriltags_${familyName}_${startId}-${endId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.generateSVGs = function () {
  const startId = parseInt(document.getElementById("startId").value);
  const endId = parseInt(document.getElementById("endId").value);
  const familyName = document.getElementById("family").value;

  const tagFamily = new window._tagModule.TagFamily(familyName);
  const zip = new JSZip();

  for (let tagId = startId; tagId <= endId; tagId++) {
    const tagBits = tagFamily.getTagBits(tagId);
    const cellCount = tagBits.length;
    const cellSize = 20;
    const size = cellCount * cellSize;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    for (let y = 0; y < cellCount; y++) {
      for (let x = 0; x < cellCount; x++) {
        const color = tagBits[y][x] ? "#000" : "#fff";
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" />`;
      }
    }
    svg += `</svg>`;
    zip.file(`apriltag_${familyName}_${tagId}.svg`, svg);
  }

  zip.generateAsync({ type: "blob" }).then(function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apriltags_${familyName}_${startId}-${endId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};
