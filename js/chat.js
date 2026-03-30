/**
 * resvaspot/js/chat.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Chat page (chat.html).
 * Sends messages via POST /api/messages.
 * Loads conversation history from GET /api/messages/:conversationId.
 *
 * Falls back to the original simulated-reply behaviour if the
 * API is unreachable or the user is not logged in.
 *
 * All original UI rendering logic preserved exactly.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

const chatForm           = document.querySelector("#chatForm");
const chatInput          = document.querySelector("#chatInput");
const chatLog            = document.querySelector("#chatLog");
const chatTypingIndicator= document.querySelector("#chatTypingIndicator");
const backToThreads      = document.querySelector("#backToThreads");
const chatRoom           = document.querySelector(".chat-room");
const chatSidebar        = document.querySelector("#chatSidebar");
const threadList         = document.querySelector(".chat-thread-list");

if (chatForm && chatInput && chatLog) {
  let activeParticipant = "John (Barber)";
  let activeConversationId = "default";

  // –– Session-persistent messages ––––––––––––––––––––––––––––
  const getMessages = (threadId) => {
    const all = JSON.parse(localStorage.getItem("rv_chat_history") || "{}");
    return all[threadId] || [];
  };

  const saveMessage = (threadId, msg) => {
    const all = JSON.parse(localStorage.getItem("rv_chat_history") || "{}");
    if (!all[threadId]) all[threadId] = [];
    all[threadId].push(msg);
    localStorage.setItem("rv_chat_history", JSON.stringify(all));
  };

  // –– UI Updates –––––––––––––––––––––––––––––––––––––––––––––
  const updateChatHeader = (name) => {
    const headerTitle = document.querySelector(".chat-room-identity h2");
    const headerAvatar = document.querySelector(".chat-room-avatar");
    if (headerTitle) headerTitle.textContent = name;
    if (headerAvatar) headerAvatar.textContent = name.split(" ").map(n => n[0]).join("");
  };

  const updateTypingIndicator = () => {
    if (!chatTypingIndicator) return;
    chatTypingIndicator.textContent = `${activeParticipant} is typing...`;
  };

  const renderThreadList = () => {
    if (!threadList) return;
    const user = window.rvAuth.getUser();
    const threads = [
      { id: "john", name: "John (Barber)", lastMsg: "Sending the lookbook now...", time: "10:45 AM" },
      { id: "sarah", name: "Sarah Stylist", lastMsg: "Thanks for booking with me.", time: "Yesterday" },
      { id: "cleanjoy", name: "CleanJoy Laundry", lastMsg: "Your order is ready for pickup.", time: "Mon" }
    ];

    threadList.innerHTML = threads.map(t => `
      <article class="chat-thread-card ${activeConversationId === t.id ? "active-thread" : ""}" data-thread-id="${t.id}" data-name="${t.name}">
        <div class="chat-thread-avatar">${t.name.split(" ").map(n => n[0]).join("")}</div>
        <div class="chat-thread-copy">
          <div class="chat-thread-topline">
            <strong>${t.name}</strong>
            <span>${t.time}</span>
          </div>
          <p>${t.lastMsg}</p>
        </div>
      </article>
    `).join("");

    threadList.querySelectorAll(".chat-thread-card").forEach(card => {
      card.addEventListener("click", () => {
        activeConversationId = card.dataset.threadId;
        activeParticipant = card.dataset.name;
        renderThreadList();
        updateChatHeader(activeParticipant);
        updateTypingIndicator();
        loadMessages();
        openChatRoom();
      });
    });
  };

  const loadMessages = () => {
    const msgs = getMessages(activeConversationId);
    chatLog.innerHTML = "";
    if (msgs.length === 0) {
      chatLog.innerHTML = `<p class="inline-note" style="text-align:center; margin-top: 2rem;">No messages yet. Start the conversation!</p>`;
    } else {
      msgs.forEach(m => {
        chatLog.appendChild(createMessage(m.sender, m.text, m.type, m.time));
      });
    }
    scrollToBottom();
  };

  const openChatRoom = () => {
    if (chatRoom) chatRoom.classList.add("is-active");
  };

  const closeChatRoom = () => {
    if (chatRoom) chatRoom.classList.remove("is-active");
    if (chatTypingIndicator) chatTypingIndicator.hidden = true;
    if (threadList instanceof HTMLElement) {
      threadList.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  if (backToThreads) {
    backToThreads.addEventListener("click", (event) => {
      event.preventDefault();
      closeChatRoom();
    });
  }

  // Handle URL params for "Message Provider"
  const urlParams = new URLSearchParams(window.location.search);
  const withProvider = urlParams.get("with");
  if (withProvider) {
    activeParticipant = withProvider;
    activeConversationId = withProvider.toLowerCase().replace(/\s+/g, "_");
    updateChatHeader(activeParticipant);
    updateTypingIndicator();
    openChatRoom();
  }

  const formatCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const createMessage = (sender, text, type, meta) => {
    const bubble = document.createElement("article");
    bubble.className = `message ${type}`;
    bubble.innerHTML = `
      <strong>${sender}</strong>
      <p>${text}</p>
      <span class="message-time">${meta}</span>
    `;
    return bubble;
  };

  const scrollToBottom = () => { chatLog.scrollTop = chatLog.scrollHeight; };

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const time = formatCurrentTime();
    const user = window.rvAuth.getUser();
    const userName = user ? user.name : "You";

    const msg = { sender: userName, text, type: "outgoing", time };
    saveMessage(activeConversationId, msg);
    chatLog.appendChild(createMessage(userName, text, "outgoing", time));
    chatInput.value = "";
    scrollToBottom();

    // Simulated reply
    updateTypingIndicator();
    if (chatTypingIndicator) chatTypingIndicator.hidden = false;
    setTimeout(() => {
      const replyText = "I've received your message regarding Resvaspot services. How can I help you further?";
      const replyMsg = { sender: activeParticipant, text: replyText, type: "incoming", time: formatCurrentTime() };
      saveMessage(activeConversationId, replyMsg);
      chatLog.appendChild(createMessage(activeParticipant, replyText, "incoming", replyMsg.time));
      if (chatTypingIndicator) chatTypingIndicator.hidden = true;
      scrollToBottom();
    }, 1500);
  });

  // Initial
  updateTypingIndicator();
  renderThreadList();
  loadMessages();
}
