# unsent

an anonymous real-time confession wall.

people can post messages they never sent — thoughts, feelings, or words left unsaid — without creating an account.

---

## features
- anonymous posting (no login required)
- real-time updates across users
- replies to confessions
- like / unlike posts (no spam)
- delete your own posts
- clean, minimal dark UI
- mobile-friendly

---

## how anonymity works
each user is assigned an anonymous ID (e.g. `Anonymous #1234`) which is stored in the browser using `localStorage`.

this means:
- the anonymous username stays the same on the same device
- no personal information is collected
- clearing browser data or using incognito will create a new anonymous ID

---

## tech stack
- HTML
- CSS
- JavaScript
- **Firebase Firestore** (realtime database)

---

## backend (firebase)
this project uses **Firebase Firestore** to:
- store posts and replies
- sync data in real time between users
- manage likes and deletions
- enforce basic ownership logic (only the creator can delete their post)

no authentication is used — anonymity is intentional.

---

## live demo
https://asmitamathur18.github.io/unsent/

---

## notes
this project was built as a lightweight full-stack web app to explore:
- realtime databases
- frontend + backend integration
- anonymous identity handling without accounts
