const FORM_ENDPOINT = window.ANIVANCE_FORM_ENDPOINT || "/api/leads";

const form = document.querySelector("#lead-form");
const statusText = document.querySelector(".form-status");
const submitButton = document.querySelector(".submit-button");

const fields = {
  name: document.querySelector("#name"),
  email: document.querySelector("#email"),
  message: document.querySelector("#message"),
};

function setError(fieldName, message) {
  const field = fields[fieldName];
  const wrapper = field.closest(".field-group");
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);
  wrapper.classList.toggle("has-error", Boolean(message));
  error.textContent = message || "";
}

function validateForm() {
  let isValid = true;
  const name = fields.name.value.trim();
  const email = fields.email.value.trim();
  const message = fields.message.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  setError("name", "");
  setError("email", "");
  setError("message", "");

  if (!name) {
    setError("name", "Please enter your name.");
    isValid = false;
  }

  if (!email || !emailPattern.test(email)) {
    setError("email", "Please enter a valid email address.");
    isValid = false;
  }

  if (message.length > 1200) {
    setError("message", "Please keep your message under 1,200 characters.");
    isValid = false;
  }

  return isValid;
}

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.className = `form-status ${type}`.trim();
}

async function submitLead(event) {
  event.preventDefault();

  if (!validateForm()) {
    setStatus("Please check the highlighted fields.", "error");
    return;
  }

  const payload = {
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    message: fields.message.value.trim(),
    source: "mps-world-summit-2026",
    submittedAt: new Date().toISOString(),
  };

  submitButton.disabled = true;
  setStatus("Sending...");

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    form.reset();
    setStatus("Thank you. We will be in touch soon.", "success");
  } catch (error) {
    setStatus(`Submission failed: ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function readErrorMessage(response) {
  const fallback = `Request failed with ${response.status}`;

  try {
    const data = await response.json();
    return data.error || fallback;
  } catch (error) {
    return fallback;
  }
}

form.addEventListener("submit", submitLead);

const canvas = document.querySelector("#signal-canvas");
const context = canvas.getContext("2d");
let width = 0;
let height = 0;
let nodes = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(28, Math.floor((width * height) / 28000));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: (index * 137.5) % width,
    y: (index * 91.7) % height,
    radius: 1.4 + (index % 4) * 0.38,
    phase: index * 0.72,
    speed: 0.002 + (index % 5) * 0.00028,
  }));
}

function drawSignal(time) {
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(8, 127, 131, 0.16)");
  gradient.addColorStop(0.48, "rgba(217, 95, 67, 0.08)");
  gradient.addColorStop(1, "rgba(185, 132, 27, 0.14)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  for (const node of nodes) {
    const driftX = Math.sin(time * node.speed + node.phase) * 22;
    const driftY = Math.cos(time * node.speed * 1.4 + node.phase) * 18;
    node.drawX = node.x + driftX;
    node.drawY = node.y + driftY;
  }

  context.lineWidth = 1;
  for (let index = 0; index < nodes.length; index += 1) {
    for (let next = index + 1; next < nodes.length; next += 1) {
      const a = nodes[index];
      const b = nodes[next];
      const distance = Math.hypot(a.drawX - b.drawX, a.drawY - b.drawY);

      if (distance < 155) {
        const alpha = (1 - distance / 155) * 0.22;
        context.strokeStyle = `rgba(8, 95, 99, ${alpha})`;
        context.beginPath();
        context.moveTo(a.drawX, a.drawY);
        context.lineTo(b.drawX, b.drawY);
        context.stroke();
      }
    }
  }

  for (const node of nodes) {
    context.fillStyle = "rgba(8, 95, 99, 0.42)";
    context.beginPath();
    context.arc(node.drawX, node.drawY, node.radius, 0, Math.PI * 2);
    context.fill();
  }

  window.requestAnimationFrame(drawSignal);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.requestAnimationFrame(drawSignal);
