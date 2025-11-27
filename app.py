from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import torch
from torchvision import transforms
import torch.nn as nn
import torch.nn.functional as F
import joblib

scaler = joblib.load('scaler1.pkl')

#定義DNN的架構
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(956, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, 128)
        self.fc4 = nn.Linear(128, 64)
        self.fc5 = nn.Linear(64, 4)
        
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        x = F.relu(self.fc4(x))
        x = self.fc5(x)
        return x

#定義CNN的架構
class GazeCNN(nn.Module):
    def __init__(self):
        super(GazeCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size = 3, stride = 1, padding = 0)
        self.pool1 = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, kernel_size = 3, stride = 1, padding = 0)
        self.pool2 = nn.MaxPool2d(2, 2)
        self.conv3 = nn.Conv2d(64, 128, kernel_size = 3, stride = 1, padding = 0)
        self.pool3 = nn.MaxPool2d(2, 2)
        self.fc1_input_size = 128 * 23 * 23
        self.fc1 = nn.Linear(self.fc1_input_size, 1024)
        self.fc2 = nn.Linear(1024, 512)
        self.fc3 = nn.Linear(512, 256)
        self.fc4 = nn.Linear(256, 4)

    def forward(self, x):
        x = self.conv1(x)
        x = F.relu(x)
        x = self.pool1(x)
        x = self.conv2(x)
        x = F.relu(x)
        x = self.pool2(x)
        x = self.conv3(x)
        x = F.relu(x)
        x = self.pool3(x)
        x = x.view(-1, self.fc1_input_size)
        x = self.fc1(x)
        x = F.relu(x)
        x = self.fc2(x)
        x = F.relu(x)
        x = self.fc3(x)
        x = F.relu(x)
        x = self.fc4(x)
        return x

app = Flask(__name__)

#將預訓練的模型參數載入
CNN_MODEL_PATH = 'models/CNN_model.pth'
CNN_model = GazeCNN()
CNN_model.load_state_dict(torch.load(CNN_MODEL_PATH))
CNN_model.eval()

DNN_MODEL_PATH = 'models/DNN_model.pth'
DNN_model = SimpleNN()
DNN_model.load_state_dict(torch.load(DNN_MODEL_PATH))
DNN_model.eval()

#圖像資料預處理
preprocess = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((200,200)),  #調整成為模型能處理的大小
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/Numerical')
def Numerical():
    return render_template('Numerical.html')

@app.route('/CNN')
def CNN():
    return render_template('CNN.html')

@app.route('/DNN')
def DNN():
    return render_template('DNN.html')

#接收前端回傳的點位資料並加以處理
@app.route('/process_landmarks', methods=['POST'])
def process_landmarks():
    data = request.get_json()
    if data and 'points' in data:
        points = data['points']

        #創建一個全黑的圖象
        img_width, img_height = 1920, 1080  #這是圖像的長寬
        image = np.zeros((img_height, img_width, 3), dtype=np.uint8)

        #瞳孔的index
        irsi_point = {468,469,470,471,472,473,474,475,476,477}

        # 將點位繪製到圖上
        for idx, point in enumerate(points):
            x, y = int(point[0]), int(point[1])
            if idx in irsi_point:
                color = (0, 0, 255)  # 红色
            else:
                color = (255, 255, 255)  # 白色
            cv2.circle(image, (x, y), 3, color, -1)

        # 找到x和y的最大最小值
        x_values = [int(point[0]) for point in points]
        y_values = [int(point[1]) for point in points]
        x_min, x_max = min(x_values), max(x_values)
        y_min, y_max = min(y_values), max(y_values)

        new_img = image[y_min - 5:y_max + 5 , x_min - 5:x_max + 5]

        #預處理圖像
        input_tensor = preprocess(new_img)
        input_batch = input_tensor.unsqueeze(0)

        # 檢查CUDA是否可用
        if torch.cuda.is_available():
            input_batch = input_batch.to('cuda')
            CNN_model.to('cuda')

        #進行預測
        with torch.no_grad():
            output = CNN_model(input_batch)

        #獲取預測結果
        _, predicted = torch.max(output, 1)
        result = predicted.item()

        # 返回一個成功的響應
        return jsonify({'status': 'success', 'result': result}), 200
    else:
        # 如果請求格式不正確，返回錯誤
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400

@app.route('/dnn_process_landmarks', methods=['POST'])
def dnn_process_landmarks():
    data = request.get_json()
    # 檢查數據是否存在並且包含了 'points' 這個鍵
    if data and 'points' in data:
        points = data['points']
        flattened_points = [coord for point in points for coord in point]
        flattened_points = np.array(flattened_points).reshape(1, -1)
        flattened_points = scaler.transform(flattened_points)
        input_tensor = torch.tensor(flattened_points, dtype=torch.float32)
        DNN_model.eval()
        with torch.no_grad():
            output = DNN_model(input_tensor)
            probabilities = output.cpu().numpy()
        result = np.argmax(probabilities, axis=1)
        result = int(result.item())

        # 這裡直接回傳接收到的點
        return jsonify({'status': 'success', 'result': result}), 200
    else:
        # 如果數據無效或缺少 'points'，返回一個錯誤響應
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400

if __name__ == '__main__':
    app.run()
