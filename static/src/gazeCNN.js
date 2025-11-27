//獲取頁面上的元素
const input_video = document.getElementsByClassName('input_video')[0];
const output_video = document.getElementsByClassName('output_video')[0];
const output_videoCtx = output_video.getContext('2d');
const grayCtx = output_video.getContext('2d');

let start_time = Date.now();
let interval = 2000;
let predictionCounts = [0, 0, 0, 0];
let elapsedTimeInSeconds = 0;

const classLabels = {
    0: 'bottom_left',
    1: 'bottom_right',
    2: 'top_left',
    3: 'top_right'
};

// 定義位置映射
const labelPositions = {
    0: { x: 100, y: 650 },
    1: { x: 1600, y: 650 },
    2: { x: 100, y: 150 },
    3: { x: 1600, y: 150 }
};

//計算經過時間(秒)
function timerFunction() {
    let currentTime = Date.now();
    elapsedTimeInSeconds = Math.floor((currentTime - start_time) / 1000);
}

//加載所需套件
const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

faceMesh.onResults(onResults);

const camera = new Camera(input_video, {
    onFrame: async () => {
    await faceMesh.send({image: input_video});
    },
    width: 1920,
    height: 1080
});

camera.start()

function onResults(results) {
    output_videoCtx.save();
    output_videoCtx.clearRect(0, 0, output_video.width, output_video.height);
    output_videoCtx.drawImage(results.image, 0, 0, output_video.width, output_video.height);

    //將畫面切成四宮格
    const rectWidth = output_video.width / 2;
    const rectHeight = output_video.height / 2;
    output_videoCtx.strokeStyle = '#00FF00';
    output_videoCtx.lineWidth = 1;

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
        const x = j * rectWidth;
        const y = i * rectHeight;
        const centerX = x + rectWidth / 2;
        const centerY = y + rectHeight / 2;

        // 绘制矩形
        output_videoCtx.strokeRect(x, y, rectWidth, rectHeight);

        // 绘制中心点
        output_videoCtx.fillStyle = '#00FF00';
        output_videoCtx.beginPath();
        output_videoCtx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        output_videoCtx.fill();
        }
    }

    if (results.multiFaceLandmarks) {
        const faceLandmarks = results.multiFaceLandmarks[0];

        const all_points = faceLandmarks.map(landmark => [landmark.x * output_video.width, landmark.y * output_video.height]);

        // 将 all_points 发送到后端进行处理
        fetch('/process_landmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ points: all_points })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {

                predictionCounts[data.result]++;

                // 計算時間
                const currentTime = Date.now();
                if (currentTime - start_time >= interval) {
                    // 每兩秒統計一次結果
                    const maxCount = Math.max(...predictionCounts);
                    const mostFrequentIndex = predictionCounts.indexOf(maxCount);

                    const label = classLabels[mostFrequentIndex];
                    const position = labelPositions[mostFrequentIndex];

                    // 在畫面上顯示結果
                    output_videoCtx.fillStyle = 'blue';
                    output_videoCtx.font = '48px Arial';
                    output_videoCtx.fillText(`${label}`, position.x, position.y);

                    // 重置計數和時間
                    predictionCounts = [0, 0, 0, 0];
                    start_time = currentTime;
                }

            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

        output_videoCtx.restore();
    }
}
