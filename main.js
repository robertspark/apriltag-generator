import init, { TagFamily } from "https://cdn.jsdelivr.net/npm/apriltag-js@0.0.4/dist/apriltag.min.js";
import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm";

window.generatePDF = async function () {
  const startId = parseInt(document.getElementById("startId").value);
  const endId = parseInt(document.getElementById("endId").value);
  const familyName = document.getElementById("family").value;
  const paperSize = document.getElementById("paperSize").value;

  await init();
  const tagFamily = new TagFamily(familyName);

  const pdf = new jsPDF({ format: paperSize });

  for (let tagId = startId; tagId <= endId; tagId++) {
    const tagBits = tagFamily.getTagBits(tagId);
    const cellCount = tagBits.length;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5; // mm
    const gridSize = Math.min(pageWidth, pageHeight) - 2 * margin;
    const cellSize = gridSize / cellCount;
    const offsetX = (pageWidth - cellCount * cellSize) / 2;
    const offsetY = (pageHeight - cellCount * cellSize) / 2;

    for (let row = 0; row < cellCount; row++) {
      for (let col = 0; col < cellCount; col++) {
        const x = offsetX + col * cellSize;
        const y = offsetY + row * cellSize;
        if (tagBits[row][col]) {
          pdf.setFillColor(0, 0, 0);
          pdf.rect(x, y, cellSize, cellSize, "F");
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(x, y, cellSize, cellSize, "F");
        }
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
