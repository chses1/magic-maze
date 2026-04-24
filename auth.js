// auth.js
// ✅ 教師密碼不再寫在前端；改由 Render 後端驗證。
window.Auth = {
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

      const session = {
        ...(data.user || {}),
        token: data.token,
        role: "student",
        userId: uid,
        classId: uid.slice(0,3),
        seat: uid.slice(3,5),
        name: name || data.user?.name || "",
        character: data.user?.character || character || "boy",
        loginAt: Date.now()
      };
      StorageAPI.setSession(session);

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

      const session = {
        ...(data.user || {}),
        token: data.token,
        role: "teacher",
        userId: "teacher",
        name: "教師",
        loginAt: Date.now()
      };
      StorageAPI.setSession(session);

      try{ await StorageAPI.syncTeacherProgressFromBackend(); }catch(_err){}
      return session;
    }catch(err){
      console.error("教師登入失敗", err);
      return null;
    }
  },

  logout(){
    StorageAPI.clearSession();
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
