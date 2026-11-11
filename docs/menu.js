// 摊位图片沿用项目 assets
const STALLS = [
  { name: "川湘小炒", img: "assets/chuan.jpg" },
  { name: "粤味烧腊", img: "assets/shaola.jpg" },
  { name: "面食工坊", img: "assets/mian.jpg" },
  { name: "轻食沙拉", img: "assets/qingshi.jpg" },
  { name: "现煮汤粉", img: "assets/tangfen.jpg" }
];

/* 热量与宏量为常见份量估算，仅用于界面演示 */
const DISHES = [
  { id: 1, name: "农家小炒肉", stall: 0, price: 18, portion: "中份", tastes: ["微辣", "下饭"], ingredients: ["猪肉", "辣椒", "蒜"], kcal: 420, protein: 28, fat: 26, carb: 14 },
  { id: 2, name: "麻婆豆腐", stall: 0, price: 12, portion: "中份", tastes: ["中辣", "下饭"], ingredients: ["豆腐", "辣椒", "花椒"], kcal: 280, protein: 16, fat: 16, carb: 12 },
  { id: 3, name: "醋溜土豆丝", stall: 0, price: 9, portion: "小份", tastes: ["清淡", "素食", "少油"], ingredients: ["土豆", "醋", "辣椒"], kcal: 160, protein: 3, fat: 4, carb: 28 },
  { id: 4, name: "烧鸭饭", stall: 1, price: 20, portion: "中份", tastes: ["下饭", "高蛋白"], ingredients: ["鸭肉", "青菜", "米饭"], kcal: 680, protein: 32, fat: 22, carb: 82 },
  { id: 5, name: "白切鸡饭", stall: 1, price: 18, portion: "中份", tastes: ["清淡", "高蛋白"], ingredients: ["鸡肉", "姜", "米饭"], kcal: 560, protein: 34, fat: 12, carb: 74 },
  { id: 6, name: "叉烧饭", stall: 1, price: 19, portion: "中份", tastes: ["甜口", "下饭"], ingredients: ["猪肉", "青菜", "米饭"], kcal: 720, protein: 30, fat: 24, carb: 88 },
  { id: 7, name: "红烧牛肉面", stall: 2, price: 20, portion: "大份", tastes: ["微辣", "汤水"], ingredients: ["牛肉", "面条", "青菜"], kcal: 640, protein: 32, fat: 18, carb: 78 },
  { id: 8, name: "番茄鸡蛋面", stall: 2, price: 13, portion: "中份", tastes: ["清淡", "汤水"], ingredients: ["番茄", "鸡蛋", "面条"], kcal: 430, protein: 18, fat: 10, carb: 64 },
  { id: 9, name: "葱油拌面", stall: 2, price: 12, portion: "中份", tastes: ["清淡", "少油"], ingredients: ["面条", "葱", "酱油"], kcal: 480, protein: 14, fat: 12, carb: 76 },
  { id: 10, name: "牛油果鸡胸沙拉", stall: 3, price: 26, portion: "一份", tastes: ["清淡", "高蛋白", "少油"], ingredients: ["鸡胸肉", "牛油果", "生菜"], kcal: 390, protein: 32, fat: 18, carb: 16 },
  { id: 11, name: "藜麦蔬菜碗", stall: 3, price: 22, portion: "一份", tastes: ["清淡", "素食", "少油"], ingredients: ["藜麦", "生菜", "玉米"], kcal: 340, protein: 12, fat: 8, carb: 48 },
  { id: 12, name: "番茄牛肉汤粉", stall: 4, price: 18, portion: "大份", tastes: ["中辣", "汤水"], ingredients: ["牛肉", "番茄", "米粉"], kcal: 520, protein: 26, fat: 12, carb: 70 },
  { id: 13, name: "清汤牛腩粉", stall: 4, price: 20, portion: "大份", tastes: ["清淡", "汤水", "高蛋白"], ingredients: ["牛肉", "米粉", "萝卜"], kcal: 490, protein: 28, fat: 10, carb: 66 }
];

// B 菜单 mock；供应及核验状态仅用于演示。
const MenuApi = (() => {
  const sample = JSON.stringify({
    mock: true,
    stalls: STALLS,
    dishes: DISHES.map(dish => ({ ...dish, available: dish.id !== 12, verified: dish.id !== 11 }))
  });
  return { async read() { return JSON.parse(sample); } };
})();
