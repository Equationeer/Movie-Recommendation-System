// =====================================================================
// CineGraph AI — Frontend Application Controller
// =====================================================================

const form = document.querySelector("#queryForm");
const input = document.querySelector("#queryInput");
const messages = document.querySelector("#messages");
const submitButton = document.querySelector("#submitButton");
const statusPill = document.querySelector("#statusPill");
const metaType = document.querySelector("#metaType");
const metaTime = document.querySelector("#metaTime");
const metaEntities = document.querySelector("#metaEntities");
const suggestions = document.querySelectorAll("[data-query]");
const clearChatBtn = document.querySelector("#clearChatBtn");
const sidebarToggle = document.querySelector("#sidebarToggle");
const sidePanel = document.querySelector("#sidePanel");
const toastContainer = document.querySelector("#toastContainer");

const steps = {
  entities: document.querySelector("#stepEntities"),
  classify: document.querySelector("#stepClassify"),
  answer: document.querySelector("#stepAnswer"),
};

// Toggle mobile sidebar
if (sidebarToggle && sidePanel) {
  sidebarToggle.addEventListener("click", () => {
    sidePanel.classList.toggle("open");
  });

  // Close sidebar on click outside on mobile
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 900 &&
      sidePanel.classList.contains("open") &&
      !sidePanel.contains(e.target) &&
      !sidebarToggle.contains(e.target)
    ) {
      sidePanel.classList.remove("open");
    }
  });
}

function showToast(message, duration = 2500) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.25s ease-out";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function setStatus(label, state = "ready") {
  statusPill.textContent = label;
  statusPill.className = "status-badge";
  if (state === "working") {
    statusPill.classList.add("status-working");
  } else if (state === "error") {
    statusPill.classList.add("status-error");
  } else {
    statusPill.classList.add("status-ready");
  }
}

function resetSteps() {
  Object.values(steps).forEach((step) => {
    step.classList.remove("active", "done");
  });
}

function setStep(name, state) {
  if (!steps[name]) return;
  steps[name].classList.remove("active", "done");
  if (state) {
    steps[name].classList.add(state);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert markdown-like response formatting into clean HTML
function formatMarkdown(text) {
  if (!text) return "";
  
  let formatted = escapeHtml(text);

  // Bold **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Italic *text*
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
  
  // Code `code`
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Handle bullet list items (* or - at start of line)
  const lines = formatted.split("\n");
  let inList = false;
  const processedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (!inList) {
        processedLines.push("<ul>");
        inList = true;
      }
      processedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        processedLines.push("</ul>");
        inList = false;
      }
      if (trimmed.length > 0) {
        processedLines.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) {
    processedLines.push("</ul>");
  }

  return processedLines.join("");
}

function addMessage(role, content, meta = {}) {
  const article = document.createElement("article");
  article.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  const isUser = role === "user";
  const avatarSvg = isUser
    ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;

  const headerHtml = `
    <div class="message-header">
      <div style="display:flex; align-items:center;">
        <div class="avatar-ring ${isUser ? "user-avatar" : "bot-avatar"}">
          ${avatarSvg}
        </div>
        <div class="author-meta">
          <span class="author-name">${isUser ? "You" : "CineGraph AI"}</span>
          <span class="author-role">${isUser ? "Query" : "Knowledge Assistant"}</span>
        </div>
      </div>
      ${
        !isUser
          ? `<button type="button" class="copy-btn" title="Copy response text">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>`
          : ""
      }
    </div>
  `;

  const bodyHtml = isUser
    ? `<div class="message-body"><p>${escapeHtml(content)}</p></div>`
    : `<div class="message-body">${formatMarkdown(content)}</div>`;

  let footerHtml = "";
  if (!isUser && (meta.type || meta.time || (meta.entities && meta.entities.length))) {
    const timeSec = meta.time ? `${(meta.time / 1000).toFixed(2)}s` : "-";
    const modeLabel = meta.type === "similarity" ? "Vector Similarity" : "Graph Traversal";
    const count = meta.entities ? meta.entities.length : 0;

    footerHtml = `
      <div class="message-footer">
        <div class="meta-tags">
          <span class="meta-pill highlight">⚡ ${escapeHtml(modeLabel)}</span>
          <span class="meta-pill">⏱️ ${escapeHtml(timeSec)}</span>
          <span class="meta-pill">🎯 ${count} node${count === 1 ? "" : "s"}</span>
        </div>
      </div>
    `;
  }

  article.innerHTML = headerHtml + bodyHtml + footerHtml;

  // Add copy action
  const copyBtn = article.querySelector(".copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(content);
        showToast("Response copied to clipboard!");
      } catch {
        showToast("Failed to copy text.");
      }
    });
  }

  messages.appendChild(article);
  article.scrollIntoView({ behavior: "smooth", block: "end" });
  return article;
}

function createLoadingMessage() {
  const article = document.createElement("article");
  article.className = "message assistant-message";
  article.id = "loadingMessage";
  article.innerHTML = `
    <div class="message-header">
      <div style="display:flex; align-items:center;">
        <div class="avatar-ring bot-avatar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        </div>
        <div class="author-meta">
          <span class="author-name">CineGraph AI</span>
          <span class="author-role">Synthesizing answer...</span>
        </div>
      </div>
    </div>
    <div class="message-body">
      <div class="loading-indicator">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <span class="loading-text" id="loadingStepText">Traversing Knowledge Graph...</span>
      </div>
    </div>
  `;
  messages.appendChild(article);
  article.scrollIntoView({ behavior: "smooth", block: "end" });
  return article;
}

function updateDetails(result) {
  const entities = result.resolved?.entities || [];
  
  if (metaType) {
    metaType.textContent = result.classification?.type === "similarity" ? "Vector Similarity" : "Graph Cypher";
  }
  if (metaTime) {
    metaTime.textContent = result.timings?.total ? `${(result.timings.total / 1000).toFixed(2)}s` : "-";
  }

  if (metaEntities) {
    if (entities.length > 0) {
      metaEntities.innerHTML = entities
        .map(
          (e) => `
          <button type="button" class="node-chip clickable" data-entity="${escapeHtml(e.nodeName)}" title="Click to ask about this entity">
            <span>${escapeHtml(e.nodeName)}</span>
            <small style="opacity:0.65;font-size:0.65rem;">(${escapeHtml(e.label)})</small>
          </button>
        `
        )
        .join("");

      // Add click handlers to entity chips
      metaEntities.querySelectorAll(".node-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const entity = chip.dataset.entity;
          input.value = `Tell me about ${entity}`;
          form.requestSubmit();
        });
      });
    } else {
      metaEntities.innerHTML = `<span class="ghost-text">No specific nodes mapped</span>`;
    }
  }
}

function getApiEndpoint() {
  const isLocalStaticServer =
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.port !== "3000" &&
    window.location.port !== "";

  if (isLocalStaticServer) {
    return "http://localhost:3000/api/query";
  }
  return "/api/query";
}

async function askQuestion(query) {
  addMessage("user", query);
  submitButton.disabled = true;
  setStatus("Working...", "working");
  resetSteps();
  setStep("entities", "active");

  const loader = createLoadingMessage();
  const loadingText = loader.querySelector("#loadingStepText");

  try {
    const stepTimer = setTimeout(() => {
      setStep("entities", "done");
      setStep("classify", "active");
      if (loadingText) loadingText.textContent = "Classifying query intent...";
    }, 700);

    const stepTimer2 = setTimeout(() => {
      setStep("classify", "done");
      setStep("answer", "active");
      if (loadingText) loadingText.textContent = "Retrieving context & generating answer...";
    }, 1800);

    const apiUrl = getApiEndpoint();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    clearTimeout(stepTimer);
    clearTimeout(stepTimer2);

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(
        `Backend server did not respond with JSON (Status ${response.status}). Please make sure 'npm run web' is running on http://localhost:3000.`
      );
    }

    if (!response.ok || !payload.ok) {
      throw new Error(payload?.error || `Request failed with status ${response.status}.`);
    }

    loader.remove();

    setStep("entities", "done");
    setStep("classify", "done");
    setStep("answer", "done");

    const result = payload.result;
    updateDetails(result);

    addMessage("assistant", result.answer, {
      type: result.classification?.type,
      time: result.timings?.total,
      entities: result.resolved?.entities,
    });

    setStatus("Ready", "ready");
  } catch (err) {
    loader.remove();
    resetSteps();
    addMessage("assistant", `⚠️ **Error Encountered:**\n${err.message || "Something went wrong."}`);
    setStatus("Error", "error");
  } finally {
    submitButton.disabled = false;
    input.focus();
  }
}

// Reset chat history
if (clearChatBtn) {
  clearChatBtn.addEventListener("click", () => {
    messages.innerHTML = `
      <div class="message assistant-message intro-message">
        <div class="message-header">
          <div class="avatar-ring bot-avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="author-meta">
            <span class="author-name">CineGraph AI</span>
            <span class="author-role">GraphRAG Agent</span>
          </div>
        </div>
        <div class="message-body">
          <p>Conversation reset. Ask me anything about movies, cast, genres, or recommendations!</p>
        </div>
      </div>
    `;
    resetSteps();
    setStatus("Ready", "ready");
    if (metaType) metaType.textContent = "—";
    if (metaTime) metaTime.textContent = "—";
    if (metaEntities) metaEntities.innerHTML = `<span class="ghost-text">No active query</span>`;
    showToast("Chat cleared");
  });
}

// Form Submission
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  input.value = "";
  input.style.height = "auto";
  askQuestion(query);
});

// Auto-expand textarea & Enter to submit
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Suggestion buttons
suggestions.forEach((button) => {
  button.addEventListener("click", () => {
    const query = button.dataset.query;
    input.value = query;
    form.requestSubmit();
  });
});
