// auth.js
window.Auth = {
  // ✅ 學生登入：支援五碼學號（例如 30105）
  // 也保留舊參數 classId/seat 的相容性
  loginStudent({ studentId, classId, seat, name }){
    let uid = "";

    if(studentId != null && String(studentId).trim() !== ""){
      uid = String(studentId).trim();
    }else{
      const seat2 = String(seat ?? "").padStart(2, "0");
      const class3 = String(classId ?? "").padStart(3, "0");
      uid = `${class3}${seat2}`;
    }

    // 基本防呆：一定要 5 碼
    if(!/^\d{5}$/.test(uid)) return null;

    const class3 = uid.slice(0,3);
    const seat2 = uid.slice(3,5);

    const session = {
      role: "student",
      userId: uid,       // ✅ 5 碼
      classId: class3,   // ✅ 前 3 碼
      seat: seat2,       // ✅ 後 2 碼
      name: "",
      loginAt: Date.now()
    };
    StorageAPI.setSession(session);
    return session;
  },

  // ✅ 教師登入：密碼改成 1070
  loginTeacher({teacherCode}){
    const ok = teacherCode === "1070";
    if(!ok) return null;

    const session = {
      role: "teacher",
      userId: "teacher",
      name: "教師",
      loginAt: Date.now()
    };
    StorageAPI.setSession(session);
    return session;
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

// ✅ 允許多角色：例如 requireAnyRole(["student","teacher"])
function requireAnyRole(roles){
  const s = StorageAPI.getSession();
  if(!s || !roles.includes(s.role)){
    location.href = "index.html";
    throw new Error("unauthorized");
  }
  return s;
}

// 掛到 Auth（若你本來就是 window.Auth = {...}，就加進去即可）
Auth.requireAnyRole = requireAnyRole;