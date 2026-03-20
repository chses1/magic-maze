// teacher.js
window.TeacherPage = (()=>{

  const toast = (msg)=> {
    const el = document.getElementById("toast");
    if(el) el.textContent = msg;
  };

  // ✅ 權限檢查：沒有教師登入就禁止操作
  function requireTeacherOrBlock(actionName = "此操作"){
    const s = StorageAPI.getSession();
    if(!s || s.role !== "teacher"){
      toast(`❌ 需要教師登入才可執行：${actionName}`);
      alert(`❌ 需要教師登入才可執行：${actionName}`);
      return false;
    }
    return true;
  }

  // ✅ UI 鎖定：未登入就禁用按鈕 & 隱藏表格區塊
  function updateControlsLock(){
    const s = StorageAPI.getSession();
    const isTeacher = !!s && s.role === "teacher";

    const btnClearAll = document.getElementById("btnClearAll");
    const btnRefresh = document.getElementById("btnRefresh");
    const filterClass = document.getElementById("filterClass");

    if(btnClearAll) btnClearAll.disabled = !isTeacher;
    if(btnRefresh) btnRefresh.disabled = !isTeacher;
    if(filterClass) filterClass.disabled = !isTeacher;

    // 隱藏 / 顯示「學生總分管理」表格區塊
    const tableCard = document.getElementById("tableCard");
    if(tableCard){
      tableCard.style.display = isTeacher ? "" : "none";
    }
  }

  function setBadge(){
    const s = StorageAPI.getSession();
    const badge = document.getElementById("sessionBadge");
    if(!badge) return;
    badge.textContent = (s?.role === "teacher") ? "教師已登入" : "教師未登入";
    updateControlsLock(); // ✅ 新增：同步鎖定按鈕與顯示區塊
  }

  function calcTotalScore(bestObj){
    if(!bestObj) return 0;
    return Object.keys(bestObj).reduce((sum, k)=> sum + (Number(bestObj[k]?.score) || 0), 0);
  }

  function render(){
    const s = StorageAPI.getSession();
    const area = document.getElementById("tableArea");
    if(!area) return;

    if(!s || s.role !== "teacher"){
      area.textContent = "請先登入教師帳號。";
      return;
    }

    const filterClass = (document.getElementById("filterClass")?.value || "").trim();
    const progress = StorageAPI.getProgress();

    const students = Object.keys(progress)
      .filter(uid => uid !== "teacher")
      .filter(uid => /^\d{5}$/.test(uid))
      .map(uid=>{
        const classId = uid.slice(0,3);
        const seat = uid.slice(3,5);
        const best = progress[uid]?.best || {};
        const passed = Object.keys(best).length;
        const totalScore = calcTotalScore(best);
        return { userId: uid, classId, seat, passed, totalScore };
      })
      .filter(stu => !filterClass || stu.classId === filterClass)
      .sort((a,b)=> a.classId.localeCompare(b.classId) || a.seat.localeCompare(b.seat));

    if(students.length === 0){
      area.textContent = "沒有資料（或篩選條件下無學生）。";
      return;
    }

    const table = document.createElement("table");
    table.className = "table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>班級</th>
          <th>座號</th>
          <th>通關數</th>
          <th>總分</th>
          <th>清除該生總分</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(stu=>`
          <tr>
            <td>${stu.classId}</td>
            <td>${stu.seat}</td>
            <td>${stu.passed}</td>
            <td>${stu.totalScore}</td>
            <td>
              <button class="danger" data-uid="${stu.userId}">清除</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    `;

    area.innerHTML = "";
    area.appendChild(table);

    area.querySelectorAll("button.danger").forEach(btn=>{
      btn.onclick = ()=>{
        if(!requireTeacherOrBlock("清除個別學生總分")) return; // ✅ 新增

        const uid = btn.getAttribute("data-uid");
        const ok = confirm(`確定要清除 ${uid} 的「總分」嗎？（會清空該生所有關卡最佳紀錄與排行榜紀錄）`);
        if(!ok) return;

        StorageAPI.clearStudentTotal(uid);
        toast(`✅ 已清除 ${uid} 的總分`);
        render();
      };
    });
  }

  function bindUI(){
    document.getElementById("btnTeacherLogin").onclick = ()=>{
      const code = document.getElementById("teacherCode").value.trim();
      const s = Auth.loginTeacher({teacherCode: code});
      if(!s){
        toast("教師密碼錯誤。");
        setBadge();
        return;
      }
      toast("教師登入成功！");
      setBadge();
      render();
    };

    document.getElementById("btnTeacherLogout").onclick = ()=>{
      Auth.logout();
      toast("已登出。");
      setBadge();
      render();
    };

    document.getElementById("btnBack").onclick = ()=>{
      location.href = "index.html";
    };

    document.getElementById("btnRefresh").onclick = ()=>{
      if(!requireTeacherOrBlock("更新列表")) return;
      render();
      toast("已更新列表。");
    };

    document.getElementById("btnClearAll").onclick = ()=>{
      if(!requireTeacherOrBlock("清除全部學生總分")) return; // ✅ 新增

      const ok = confirm("⚠️ 確定要清除「全部學生」的總分嗎？（會清空所有學生的最佳紀錄與排行榜）");
      if(!ok) return;

      StorageAPI.clearAllStudentsTotal();
      toast("✅ 已清除全部學生總分");
      render();
    };
  }

  function init(){
    setBadge();
    bindUI();
    updateControlsLock(); // ✅ 新增：初始就鎖
    render();
  }

  return { init };
})();
