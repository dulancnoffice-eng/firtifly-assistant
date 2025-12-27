// Hardcoded Hugging Face token and endpoints
const HF_TOKEN = "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";
const REPLY_ENDPOINT = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const LANG_ENDPOINT = "https://api-inference.huggingface.co/models/ai4bharat/IndicLID";

async function generateReply() {
  const msg = document.getElementById("custMessage").value;

  // Detect language
  let lang = "unknown";
  try {
    const langRes = await fetch(LANG_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: msg })
    });
    const langData = await langRes.json();
    lang = langData[0]?.label || "unknown";
    document.getElementById("langBadge").innerText = "Detected: " + lang;
  } catch (e) {
    document.getElementById("langBadge").innerText = "Language detection failed";
  }

  // Build prompt
  const persona = document.getElementById("myStory").value;
  const prompt = `Customer said: "${msg}". Reply in the same language (${lang}), short and casual Hinglish if detected. Persona: ${persona}`;

  // Generate reply
  try {
    const res = await fetch(REPLY_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });
    const data = await res.json();
    document.getElementById("replyMessage").value = data[0]?.generated_text || "No reply";
  } catch (e) {
    document.getElementById("replyMessage").value = "Error generating reply";
  }
}

function sendMessage() {
  const custMsg = document.getElementById("custMessage").value;
  const replyMsg = document.getElementById("replyMessage").value;
  const history = document.getElementById("chatHistory");
  const entry = `<p><strong>Customer:</strong> ${custMsg}</p><p><strong>Me:</strong> ${replyMsg}</p><hr>`;
  history.innerHTML += entry;
  saveHistory();
  document.getElementById("custMessage").value = "";
  document.getElementById("replyMessage").value = "";
}

function saveHistory() {
  localStorage.setItem("chatHistory", document.getElementById("chatHistory").innerHTML);
}

function loadHistory() {
  const saved = localStorage.getItem("chatHistory");
  if (saved) document.getElementById("chatHistory").innerHTML = saved;
}

function clearHistory() {
  if (confirm("Delete chat history?")) {
    localStorage.removeItem("chatHistory");
    document.getElementById("chatHistory").innerHTML = "";
  }
}

function downloadChat() {
  const content = document.getElementById("chatHistory").innerText;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chat_history.txt";
  a.click();
}

window.onload = loadHistory;
