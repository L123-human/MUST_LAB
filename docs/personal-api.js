// 本地 mock；正式会话与读写待 A 接入。
const PersonalApi = (() => {
  const storageKey = "canteen_personal_demo_v1";
  const sessionKey = "canteen_personal_demo_active";
  function active() {
    try { return sessionStorage.getItem(sessionKey) === "yes"; }
    catch (_) { return false; }
  }
  function readState() {
    if (!active()) throw new Error("请先开启本地演示。");
    try {
      const raw = localStorage.getItem(storageKey);
      const state = raw === null ? PersonalRecords.empty() : JSON.parse(raw);
      if (!PersonalRecords.valid(state)) throw new Error("invalid records");
      return state;
    } catch (_) {
      throw new Error("无法读取本地收藏与反馈。原记录未覆盖，请检查浏览器存储。");
    }
  }
  return {
    storageKey, sessionKey, active,
    async read() { return readState(); },
    async change(action, dishId, value) {
      const result = PersonalRecords.change(readState(), action, dishId, value, DISHES);
      if (result.error) throw new Error(result.error);
      try { localStorage.setItem(storageKey, JSON.stringify(result.state)); }
      catch (_) { throw new Error("保存失败，原记录未改变。请检查浏览器存储空间或权限。"); }
      return result.state;
    }
  };
})();
