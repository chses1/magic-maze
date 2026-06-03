// auth.js
// ✅ 教師密碼不再寫在前端；改由 Render 後端驗證。
// ✅ Google 登入使用 Firebase Auth 取得 Firebase idToken，再交給 Render 後端換成遊戲 JWT。

const MAGIC_MAZE_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAH4cDZMCFP61OCjJKJuufk5pfxneaY16Y",
  authDomain: "magic-maze-39321.firebaseapp.com",
  projectId: "magic-maze-39321",
  storageBucket: "magic-maze-39321.firebasestorage.app",
  messagingSenderId: "1044442713897",
  appId: "1:1044442713897:web:a01d67c8824b9a13f5b138",
  measurementId: "G-LEN3EDNEYD"
};

let firebaseInitPromise = null;
let pendingGoogleIdToken = "";

function loadExternalScript(src){
  return new Promise((resolve, reject)=>{
    const existing = document.querySelector(`script[src="${src}"]`);
    if(existing){
      if(existing.dataset.loaded === "1") resolve();
      else existing.addEventListener("load", resolve, { once:true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "0";
    script.onload = ()=> {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = ()=> reject(new Error(`無法載入 ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureFirebaseAuth(){
  if(firebaseInitPromise) return firebaseInitPromise;

  firebaseInitPromise = (async()=>{
    await loadExternalScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
    await loadExternalScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js");

    if(!window.firebase?.apps?.length){
      window.firebase.initializeApp(MAGIC_MAZE_FIREBASE_CONFIG);
    }
    return window.firebase.auth();
  })();

  return firebaseInitPromise;
}

async function getGoogleIdTokenFromFirebase(){
  const auth = await ensureFirebaseAuth();
  const provider = new window.firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await auth.signInWithPopup(provider);
  const idToken = await result.user?.getIdToken?.();
  if(!idToken) throw new Error("Google 登入成功，但沒有取得 Firebase 登入憑證。");
  return idToken;
}

async function clearFirebaseClientPersistence(){
  try{
    const auth = await ensureFirebaseAuth();
    await auth.signOut();
  }catch(_err){}

  try{
    const dbs = await indexedDB.databases?.();
    if(Array.isArray(dbs)){
      await Promise.all(dbs
        .map(db => db?.name)
        .filter(name => String(name || "").startsWith("firebaseLocalStorageDb"))
        .map(name => new Promise(resolve => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = req.onerror = req.onblocked = resolve;
        })));
    }
  }catch(_err){}

  try{
    [localStorage, sessionStorage].forEach(store => {
      const keys = [];
      for(let i = 0; i < store.length; i++) keys.push(store.key(i));
      keys
        .filter(key => /^firebase[:.]/i.test(String(key || "")) || String(key || "").includes("firebaseLocalStorage"))
        .forEach(key => store.removeItem(key));
    });
  }catch(_err){}
}

function buildStudentSession(data, fallback = {}){
  const uid = String(data.user?.userId || fallback.studentId || "").trim();
  return {
    ...(data.user || {}),
    token: data.token,
    role: "student",
    userId: uid,
    classId: data.user?.classId || uid.slice(0,3),
    seat: data.user?.seat || uid.slice(3,5),
    name: fallback.name || data.user?.name || data.user?.displayName || "",
    character: data.user?.character || fallback.character || "boy",
    loginAt: Date.now()
  };
}

function buildTeacherSession(data){
  return {
    ...(data.user || {}),
    token: data.token,
    role: "teacher",
    userId: "teacher",
    name: data.user?.displayName || data.user?.name || "教師",
    loginAt: Date.now()
  };
}

window.Auth = {
  async loginGoogleLobby(){
    try{
      pendingGoogleIdToken = await getGoogleIdTokenFromFirebase();
      const data = await StorageAPI.apiFetch("/api/auth/google/lobby", {
        method: "POST",
        body: JSON.stringify({ idToken: pendingGoogleIdToken })
      });

      if(data?.status === "needsStudentSetup"){
        return { status:"needsStudentSetup", role:"student" };
      }

      if(data?.token && data?.user?.role === "teacher"){
        const session = buildTeacherSession(data);
        StorageAPI.setSession(session);
        pendingGoogleIdToken = "";
        return { status:"authenticated", role:"teacher", session };
      }

      if(data?.token && data?.user?.role === "student"){
        const session = buildStudentSession(data);
        StorageAPI.setSession(session);
        pendingGoogleIdToken = "";
        try{ await StorageAPI.flushPendingProgressToBackend?.(); }catch(_err){}
        try{ await StorageAPI.syncMyProgressFromBackend(); }catch(_err){}
        return { status:"authenticated", role:"student", session };
      }

      return null;
    }catch(err){
      pendingGoogleIdToken = "";
      console.error("Google 身分判定失敗", err);
      return null;
    }
  },

  async completeStudentGoogleSetup({ studentId, character } = {}){
    const uid = String(studentId || "").trim();
    if(!pendingGoogleIdToken || !/^\d{5}$/.test(uid)) return null;

    try{
      const data = await StorageAPI.apiFetch("/api/auth/google/student", {
        method: "POST",
        body: JSON.stringify({
          idToken: pendingGoogleIdToken,
          studentId: uid,
          character: ["boy","girl"].includes(String(character || "").trim()) ? String(character).trim() : "boy"
        })
      });

      const session = buildStudentSession(data, { studentId: uid, character });
      StorageAPI.setSession(session);
      pendingGoogleIdToken = "";

      try{ await StorageAPI.flushPendingProgressToBackend?.(); }catch(_err){}
      try{ await StorageAPI.syncMyProgressFromBackend(); }catch(_err){}
      return session;
    }catch(err){
      console.error("Google 學生資料綁定失敗", err);
      return null;
    }
  },

  async loginStudentWithGoogle({ studentId, character } = {}){
    const uid = String(studentId || "").trim();
    if(uid && !/^\d{5}$/.test(uid)) return null;

    try{
      const idToken = await getGoogleIdTokenFromFirebase();
      const data = await StorageAPI.apiFetch("/api/auth/google/student", {
        method: "POST",
        body: JSON.stringify({
          idToken,
          studentId: uid,
          character: ["boy","girl"].includes(String(character || "").trim()) ? String(character).trim() : "boy"
        })
      });

      const session = buildStudentSession(data, { studentId: uid, character });
      StorageAPI.setSession(session);

      try{ await StorageAPI.flushPendingProgressToBackend?.(); }catch(_err){}
      try{ await StorageAPI.syncMyProgressFromBackend(); }catch(_err){}
      return session;
    }catch(err){
      console.error("Google 學生登入失敗", err);
      return null;
    }
  },

  async loginStudent({ studentId, classId, seat, name, character }){
    let uid = "";

    if(studentId != null && String(studentId).trim() !== ""){
      uid = String(studentId).trim();
    }else{
      const seat2 = String(seat ?? "").padStart(2, "0");
      const class3 = String(classId ?? "").padStart(3, "0");
      uid = `${class3}${seat2}`;
    }

    if(!/^\d{5}$/.test(uid)) return null;

    try{
      const data = await StorageAPI.apiFetch("/api/auth/student", {
        method: "POST",
        body: JSON.stringify({
          studentId: uid,
          character: ["boy","girl"].includes(String(character || "").trim()) ? String(character).trim() : "boy"
        })
      });

      const session = buildStudentSession(data, { studentId: uid, name, character });
      StorageAPI.setSession(session);

      try{ await StorageAPI.flushPendingProgressToBackend?.(); }catch(_err){}
      try{ await StorageAPI.syncMyProgressFromBackend(); }catch(_err){}
      return session;
    }catch(err){
      console.error("學生登入失敗", err);
      return null;
    }
  },

  async loginTeacher({ teacherCode }){
    try{
      const data = await StorageAPI.apiFetch("/api/auth/teacher", {
        method: "POST",
        body: JSON.stringify({ teacherCode: String(teacherCode || "") })
      });

      const session = buildTeacherSession(data);
      StorageAPI.setSession(session);
      return session;
    }catch(err){
      console.error("教師登入失敗", err);
      return null;
    }
  },

  async loginTeacherWithGoogle(){
    try{
      const idToken = await getGoogleIdTokenFromFirebase();
      const data = await StorageAPI.apiFetch("/api/auth/google/teacher", {
        method: "POST",
        body: JSON.stringify({ idToken })
      });

      const session = buildTeacherSession(data);
      StorageAPI.setSession(session);
      return session;
    }catch(err){
      console.error("Google 教師登入失敗", err);
      return null;
    }
  },

  async logout(){
    pendingGoogleIdToken = "";
    StorageAPI.clearSession();
    await clearFirebaseClientPersistence();
  },

  requireRole(role){
    const s = StorageAPI.getSession();
    if(!s || s.role !== role){
      location.href = "index.html";
      return null;
    }
    return s;
  }
};

function requireAnyRole(roles){
  const s = StorageAPI.getSession();
  if(!s || !roles.includes(s.role)){
    location.href = "index.html";
    throw new Error("unauthorized");
  }
  return s;
}

Auth.requireAnyRole = requireAnyRole;
