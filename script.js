const db = firebase.firestore();

/* ========= ANON USER ========= */
let anonId = localStorage.getItem("anonId");
if (!anonId) {
  anonId = String(Math.floor(1000 + Math.random() * 9000));
  localStorage.setItem("anonId", anonId);
}
const anonName = `Anonymous #${anonId}`;

/* ========= DOM ========= */
const feed = document.getElementById("feed");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

/* ========= HELPERS ========= */
function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ========= CREATE POST ========= */
sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  await db.collection("posts").add({
    text,
    user: anonName,
    uid: anonId, // MUST exist
    likes: 0,
    likedBy: {}, // 👈 spam-proof
    time: timeNow(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
};

/* ========= RENDER ========= */
function renderPost(doc) {
  const p = doc.data();
  const id = doc.id;

  const liked = p.likedBy && p.likedBy[anonId];

  const div = document.createElement("div");
  div.className = "post";

  div.innerHTML = `
    <div class="post-user">${p.user}</div>
    <div class="post-text">${p.text}</div>
    <div class="post-time">${p.time}</div>

    <div class="actions">
      <button class="like-btn">${liked ? "♥" : "♡"}</button>
      <span>${p.likes || 0}</span>
      <button class="reply-toggle">reply</button>
      ${
        p.uid && String(p.uid) === String(anonId)
          ? `<button class="delete-btn">delete</button>`
          : ""
      }
    </div>

    <div class="replies"></div>

    <div class="reply-box" style="display:none;">
      <input placeholder="write a reply…" />
      <button>send</button>
    </div>
  `;

  feed.prepend(div);

  /* ===== LIKE TOGGLE ===== */
  div.querySelector(".like-btn").onclick = async () => {
    const ref = db.collection("posts").doc(id);

    if (liked) {
      await ref.update({
        [`likedBy.${anonId}`]: firebase.firestore.FieldValue.delete(),
        likes: firebase.firestore.FieldValue.increment(-1)
      });
    } else {
      await ref.update({
        [`likedBy.${anonId}`]: true,
        likes: firebase.firestore.FieldValue.increment(1)
      });
    }
  };

  /* ===== DELETE ===== */
  const del = div.querySelector(".delete-btn");
  if (del) {
    del.onclick = async () => {
      if (!confirm("delete this post?")) return;

      const replies = await db.collection("posts").doc(id).collection("replies").get();
      replies.forEach(r => r.ref.delete());

      await db.collection("posts").doc(id).delete();
    };
  }

  /* ===== REPLIES ===== */
  const repliesDiv = div.querySelector(".replies");
  const toggle = div.querySelector(".reply-toggle");
  const box = div.querySelector(".reply-box");
  const inputReply = box.querySelector("input");
  const sendReply = box.querySelector("button");

  toggle.onclick = () =>
    box.style.display = box.style.display === "none" ? "flex" : "none";

  sendReply.onclick = async () => {
    if (!inputReply.value.trim()) return;

    await db.collection("posts").doc(id).collection("replies").add({
      user: anonName,
      text: inputReply.value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    inputReply.value = "";
    box.style.display = "none";
  };

  db.collection("posts")
    .doc(id)
    .collection("replies")
    .orderBy("createdAt")
    .onSnapshot(snap => {
      repliesDiv.innerHTML = "";
      snap.forEach(r => {
        const d = r.data();
        repliesDiv.innerHTML += `
          <div class="reply">
            <div class="reply-user">${d.user} replied</div>
            <div>${d.text}</div>
          </div>
        `;
      });
    });
}

/* ========= LIVE FEED ========= */
db.collection("posts")
  .orderBy("createdAt", "desc")
  .onSnapshot(snap => {
    feed.innerHTML = "";

    if (snap.empty) {
      feed.innerHTML = `<p style="color:#777;text-align:center;">no unsent messages yet.</p>`;
      return;
    }

    snap.forEach(doc => renderPost(doc));
  });
