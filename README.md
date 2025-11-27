# Gaze Detection System

這個專案是我碩士論文延伸出來的作品，用來偵測使用者的視線，並預測使用者在螢幕上的注視區域（四象限 / 不同區塊），並透過網頁介面呈現結果。

---

## 🔍 專案簡介 (Overview)

- 使用 Python 與 Flask 建立一個可以在 **localhost** 執行的視線偵測系統。
- 前端使用 HTML / JavaScript / CSS（放在 `templates/` 和 `static/` 資料夾）。
- 後端負責處理影像 / 特徵 / 模型推論，並回傳結果顯示在網頁上。

## ✨ 功能特色 (Features)

- 透過攝影機或輸入資料取得使用者相關特徵。
- 使用訓練好的模型進行預測。
- 在網頁前端即時顯示預測結果（例如：使用者注視的區塊）。
- 系統設計可配合研究情境（例如：廣告注視、介面使用行為分析等）。

## 🛠 技術棧 (Tech Stack)

- **Backend**：Python, Flask
- **Frontend**：HTML, CSS, JavaScript
- **Machine Learning / Deep Learning**：
  - CNN model
  - DNN model
  - （詳見下方 📥 Model Download）

## 📥 Model Download

由於模型檔案 (.pth) 容量較大，因此沒有直接放在 GitHub。
請從以下連結下載模型檔：

🔗 **Models Download:**
[Download models from Google Drive](https://drive.google.com/drive/u/1/folders/1h-OyzlQoauPCJ61OClmGdkmBoeBjqgjl)

下載後請將對應的模型檔放置到專案目錄中，例如：

```text
gaze-detection/
├─ models/
│  ├─ CNN_model.pth
│  └─ DNN_model.pth
```

---

## 📁 專案結構 (Project Structure)

大致結構如下：

```text
gaze-detection/
├─ app.py              # Flask 入口檔案
├─ templates/          # HTML 模板
├─ static/
│  └─ src/             # 前端相關資源 (JS / CSS 等)
├─ models/
│  └─ CNN_model.pth/   # CNN model權重檔
│  └─ DNN_model.pth    # DNN model權重檔
├─ scaler1.pkl         # 前處理用的 scaler
└─ .gitignore          # 忽略較大的模型權重檔
```

## 🚀 如何在本機執行 (Run on Localhost)

1️⃣ 建立虛擬環境（可選但建議）

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

2️⃣ 安裝必要套件

```bash
pip install -r requirements.txt
```

3️⃣ 啟動 Flask 伺服器

```bash
python app.py
```

3️⃣ 啟動後在瀏覽器輸入：

http://localhost:5000
即可開啟系統界面。

## 📚 主要依賴套件 (Key Dependencies)

```text
Flask==3.1.2
opencv-python==4.12.0.88
numpy==2.2.5
joblib==1.5.2
scikit-learn==1.7.2
torch==2.5.1+cu121
torchvision==0.20.1+cu121
```

## 🔮 未來規劃 (Future Work)

- 使預測更加精準
- 新增更美觀的前端視覺化

## 👤 Author

- GitHub: https://github.com/henry08151104
