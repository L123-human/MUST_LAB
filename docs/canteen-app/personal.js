/* REQ-1.4 rules, independent of DOM and storage. No authentication is implemented here. */
const PersonalRecords = (() => {
  const MAX_FAVORITES = 20;
  const MAX_TEXT = 200;
  const empty = () => ({ favorites: [], feedback: {} });
  const textLength = (text) => Array.from(text).length;

  function valid(state) {
    return state && Array.isArray(state.favorites) && state.favorites.length <= MAX_FAVORITES &&
      state.favorites.every(Number.isSafeInteger) &&
      new Set(state.favorites).size === state.favorites.length &&
      state.feedback && typeof state.feedback === "object" && !Array.isArray(state.feedback) &&
      Object.entries(state.feedback).every(([id, item]) =>
        /^\d+$/.test(id) && item && ["", "like", "not-interested"].includes(item.mark) &&
        typeof item.text === "string" && textLength(item.text) <= MAX_TEXT);
  }

  function change(state, action, id, value, dishes) {
    if (!Number.isSafeInteger(id) || !dishes.some((d) => d.id === id)) {
      return { error: "找不到这道菜，未保存操作。" };
    }
    const next = { favorites: state.favorites.slice(), feedback: { ...state.feedback } };
    const item = { ...(next.feedback[id] || { mark: "", text: "" }) };
    switch (action) {
      case "favorite":
        if (next.favorites.includes(id)) return { error: "这道菜已经收藏，请勿重复添加。" };
        if (next.favorites.length >= MAX_FAVORITES) return { error: "最多收藏 20 道菜，请先移除一项。" };
        next.favorites.push(id);
        break;
      case "unfavorite":
        next.favorites = next.favorites.filter((dishId) => dishId !== id);
        break;
      case "mark":
        if (!["", "like", "not-interested"].includes(value)) return { error: "请选择有效的反馈标记。" };
        item.mark = value;
        next.feedback[id] = item;
        break;
      case "text":
        if (typeof value !== "string" || textLength(value) > MAX_TEXT) return { error: "文字反馈最多 200 个字符，未保存。" };
        item.text = value.trim();
        next.feedback[id] = item;
        break;
      case "clear-feedback":
        delete next.feedback[id];
        break;
      default:
        return { error: "无效操作，未保存。" };
    }
    if (next.feedback[id] && !next.feedback[id].mark && !next.feedback[id].text) delete next.feedback[id];
    return { state: next };
  }

  function tier(state, id) {
    const mark = state.feedback[id]?.mark;
    return mark === "like" ? 1 : mark === "not-interested" ? -1 : 0;
  }
  return { empty, valid, change, tier, textLength, MAX_FAVORITES, MAX_TEXT };
})();
if (typeof module !== "undefined") module.exports = PersonalRecords;
