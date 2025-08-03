import init, { TagFamily } from "https://cdn.jsdelivr.net/npm/apriltag-js@0.0.4/dist/apriltag.min.js";

window.generate = async function () {
  const familyName = document.getElementById("family").value;
  const tagId = parseInt(document.getElementById("tagId").value);
  const tagSize = parseInt(document.getElementById("tagSize").value);
  const borderSize = parseInt(document.getElementById("borderSize").value);

  await init(); // Initialize WASM

  const tagFamily = new TagFamily(familyName);
  const tagBits = tagFamily.getTagBits(tagId); // 2D array

  const totalCells = tagBits.length + 2 * borderSize;
  const cellSize = Math.floor(tagSize / totalCells);
  const canvasSize = totalCells * cellSize;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");

  // Draw white background
  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw tag cells
  for (let y = 0; y < tagBits.length; y++) {
    for (let x = 0; x < tagBits.length; x++) {
      const value = tagBits[y][x];
      ctx.fillStyle = value ? "#000" : "#FFF";
      const px = (x + borderSize) * cellSize;
      const py = (y + borderSize) * cellSize;
      ctx.fillRect(px, py, cellSize, cellSize);
    }
  }

  // Show canvas and download link
  const output = document.getElementById("output");
  output.innerHTML = "";
  output.appendChild(canvas);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `apriltag-${familyName}-${tagId}.png`;
  a.innerText = "Download PNG";
  a.style.display = "block";
  a.style.marginTop = "10px";
  output.appendChild(a);
};
