# CLAUDE.md — 黑臉貓大作戰 專案指引

## 需求文件

所有遊戲需求記錄在 `docs/requirements/game-requirements.md`。

**重要規則：任何需求變更確認後，必須立即更新需求文件。** 不要等到最後才更新，每次修改確認時就要同步寫進去。

## 專案結構

```
index.html              — 入口頁面
css/style.css           — 樣式（含手機適配）
js/                     — 遊戲程式碼（ES modules）
  config.js             — 所有遊戲常數
  main.js               — 遊戲迴圈、整合所有模組
  input.js              — 鍵盤 + 觸控輸入
  player.js             — 玩家（黑臉貓）
  bullet.js             — 子彈 / 貓掌波
  enemy.js              — 雜兵（小貓、小狗）
  boss.js               — Boss（胖博美）
  powerup.js            — 升級道具
  collision.js          — AABB 碰撞偵測
  sprites.js            — 像素圖繪製
  background.js         — 捲動背景 + 色溫切換
  hud.js                — HUD 介面
  game-state.js         — 遊戲狀態機
tests/                  — 測試檔案（node --test）
docs/
  requirements/         — 需求文件
  superpowers/specs/    — 設計規格書
  superpowers/plans/    — 實作計畫
```

## 開發指引

- **技術棧**：純 HTML5 Canvas + 原生 JavaScript，零依賴
- **測試**：`node --test tests/*.test.js`
- **本地開發**：`python3 -m http.server 8000` 或 `npx serve .`
- **部署**：push 到 main 分支，GitHub Pages 自動部署
- **線上網址**：https://zuwil.github.io/black-face-cat-battle/

## 注意事項

- 所有遊戲常數集中在 `js/config.js`，調整遊戲平衡時修改這裡
- 像素圖用 Canvas API 直接繪製，不使用外部圖片檔案
- 支援電腦鍵盤 + 手機觸控兩種操作方式
