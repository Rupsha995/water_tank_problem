// ---------- 1. THE ALGORITHM ----------
// Water above a column = min(tallest block on its left, tallest block on its right) - its own height
// If that number is negative, there is no water there (so we use 0).

function calculateWater(heights) {
  const n = heights.length;
  const waterPerColumn = new Array(n).fill(0);

  // leftMax[i] = tallest block from index 0 up to i
  const leftMax = new Array(n).fill(0);
  // rightMax[i] = tallest block from index i to the end
  const rightMax = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    leftMax[i] = i === 0 ? heights[i] : Math.max(leftMax[i - 1], heights[i]);
  }
  for (let i = n - 1; i >= 0; i--) {
    rightMax[i] = i === n - 1 ? heights[i] : Math.max(rightMax[i + 1], heights[i]);
  }

  let total = 0;
  for (let i = 0; i < n; i++) {
    const level = Math.min(leftMax[i], rightMax[i]); // water surface height
    waterPerColumn[i] = Math.max(level - heights[i], 0);
    total += waterPerColumn[i];
  }

  return { total, waterPerColumn };
}

// ---------- 2. READ + VALIDATE THE INPUT ----------
// Accepts "0,4,0,0,0,6,0,6,4,0" or "[0,4,0,...]". Heights must be whole numbers >= 0.

function parseInput(text) {
  const cleaned = text.trim().replace(/^\[|\]$/g, "");
  if (cleaned === "") {
    return { error: "Please enter at least one number." };
  }

  const parts = cleaned.split(",").map((p) => p.trim());
  const heights = [];

  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return { error: `"${part}" is not valid. Use whole numbers 0 or greater, separated by commas.` };
    }
    heights.push(Number(part));
  }

  if (heights.length > 60 || Math.max(...heights) > 60) {
    return { error: "Please keep it to 60 blocks and heights of 60 or less." };
  }

  return { heights };
}

// ---------- 3. DRAW THE SVG ----------

const SVG_NS = "http://www.w3.org/2000/svg";

function makeCell(x, y, size, fill) {
  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", size);
  rect.setAttribute("height", size);
  rect.setAttribute("fill", fill);
  rect.setAttribute("stroke", "#c5ced8");
  rect.setAttribute("stroke-width", 1);
  return rect;
}

function drawChart(heights, waterPerColumn) {
  const chart = document.getElementById("chart");
  chart.innerHTML = ""; // clear the previous drawing

  const cols = heights.length;
  const rows = Math.max(...heights, 1); // at least 1 row so the grid is visible
  const cell = 40;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", cols * cell);
  svg.setAttribute("height", rows * cell);
  svg.setAttribute("viewBox", `0 0 ${cols * cell} ${rows * cell}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Blocks in yellow with trapped water in blue");

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      // row 0 is the BOTTOM level; SVG's y axis goes downward, so we flip it
      const level = row + 1;
      const x = col * cell;
      const y = (rows - level) * cell;

      let fill = "#ffffff"; // empty air
      if (level <= heights[col]) {
        fill = "#ffd400"; // block
      } else if (level <= heights[col] + waterPerColumn[col]) {
        fill = "#1fa2e6"; // water sits on top of the block
      }
      svg.appendChild(makeCell(x, y, cell, fill));
    }
  }

  chart.appendChild(svg);
}

// ---------- 4. CONNECT EVERYTHING TO THE PAGE ----------

function run() {
  const input = document.getElementById("heights-input");
  const errorEl = document.getElementById("error");
  const resultEl = document.getElementById("result");

  const parsed = parseInput(input.value);

  if (parsed.error) {
    errorEl.textContent = parsed.error;
    resultEl.textContent = "";
    document.getElementById("chart").innerHTML = "";
    return;
  }

  errorEl.textContent = "";
  const { total, waterPerColumn } = calculateWater(parsed.heights);
  resultEl.textContent = `Output: ${total} Units`;
  drawChart(parsed.heights, waterPerColumn);
}

document.getElementById("calculate-btn").addEventListener("click", run);
document.getElementById("heights-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") run();
});

run(); // show the example when the page first opens
