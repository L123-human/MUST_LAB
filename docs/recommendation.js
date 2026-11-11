function rankDishes(dishes, preferredTastes, records) {
  return dishes.map(dish => {
    const matches = dish.tastes.filter(t => preferredTastes.includes(t));
    const feedbackRank = PersonalRecords.tier(records, dish.id);
    let reason = matches.length ? "口味相符：" + matches.join("、") : "符合当前筛选条件";
    if (feedbackRank === 1) reason += "；你已点赞，同分时优先";
    if (feedbackRank === -1) reason += "；你标记了不感兴趣，同分时靠后";
    return { ...dish, score: matches.length, feedbackRank, reason };
  }).sort((a, b) => b.score - a.score || b.feedbackRank - a.feedbackRank || a.id - b.id);
}

function getRecommendation(dishes, prefs, records) {
  const { maxBudget, excludeIngredients = [], preferredTastes = [] } = prefs;
  const rejectReasons = [];
  const hasBudget = maxBudget !== "" && maxBudget != null;
  const budget = Number(maxBudget);
  if (hasBudget && (!Number.isFinite(budget) || budget < 0)) {
    return { list: [], rejectReasons: ["预算须为不小于 0 的数字。"] };
  }
  const candidates = dishes.filter(dish => {
    let reason = "";
    if (dish.available !== true) reason = dish.available === false ? "暂不可供应" : "可售状态待确认";
    else if (dish.verified !== true) reason = "食材待核验";
    else if (excludeIngredients.some(ing => dish.ingredients.includes(ing))) reason = "包含被排除食材";
    else if (hasBudget && (!Number.isFinite(dish.price) || dish.price < 0)) reason = "价格待确认";
    else if (hasBudget && dish.price > budget) reason = "超出预算";
    if (reason) rejectReasons.push("【" + dish.name + "】" + reason);
    return !reason;
  });
  return { list: rankDishes(candidates, preferredTastes, records).slice(0, 5), rejectReasons };
}
