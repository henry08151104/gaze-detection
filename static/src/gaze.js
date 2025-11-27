//獲取頁面上的元素
const input_video1 = document.getElementsByClassName("input_video1")[0];
const output_video1 = document.getElementsByClassName("output_video1")[0];
const output_video1Ctx = output_video1.getContext("2d");
const grayCtx = output_video1.getContext("2d");
const startbutton = document.getElementById("startbutton");
const loading_bar = document.getElementById("loading_bar");
const positionpoint_center = document.querySelector(".position-point.center");
const positionpoint_top = document.querySelector(".position-point.top_center");
const positionpoint_bottom = document.querySelector(
  ".position-point.bottom_center"
);
const hor_line = document.querySelector(".hor_line");

let center_log = false;
let top_log = false;
let bottom_log = false;
let start_time = Date.now();
let elapsedTimeInSeconds = 0;

//設定起始參數
let numbers = {
  top_right_count: 0,
  bottom_right_count: 0,
  top_left_count: 0,
  bottom_left_count: 0,
};

//重設參數
function resetcount() {
  numbers.top_right_count = 0;
  numbers.bottom_right_count = 0;
  numbers.top_left_count = 0;
  numbers.bottom_left_count = 0;
  elapsedTimeInSeconds = 0;
}

//右眼瞳孔列表
let right_iris_list = [];
//右眼瞳孔中位數
let mid_right_iris_list = [];
//右眼右側列表
let right_right_list = [];
//右眼右側中位數
let mid_right_right_list = [];
//右眼左側列表
let right_left_list = [];
//右眼左側中位數
let mid_right_left_list = [];
//左眼瞳孔列表
let left_iris_list = [];
//左眼瞳孔中位數
let mid_left_iris_list = [];
//左眼右側列表
let left_right_list = [];
//左眼右側中位數
let mid_left_right_list = [];
//左眼左側列表
let left_left_list = [];
//左眼左側中位數
let mid_left_left_list = [];
//右眼上方列表
let right_top_list = [];
//右眼上方中位數
let mid_right_top_list = [];
//右眼下方列表
let right_bottom_list = [];
//右眼下方中位數
let mid_right_bottom_list = [];
//左眼上方列表
let left_top_list = [];
//左眼上方中位數
let mid_left_top_list = [];
//左眼下方列表
let left_bottom_list = [];
//左眼下方中位數
let mid_left_bottom_list = [];

//右眼水平比值
let right_hor_ratio = 0;
//左眼水平比值
let left_hor_ratio = 0;
//右眼垂直比值
let right_ver_ratio = 0;
//左眼垂直比值
let left_ver_ratio = 0;

//加載所需套件
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults(onResults);

const camera = new Camera(input_video1, {
  onFrame: async () => {
    await faceMesh.send({ image: input_video1 });
  },
  width: 1920,
  height: 1080,
});

camera.start().then(() => {
  setTimeout(function () {
    startbutton.style.display = "block";
    loading_bar.style.display = "none";
  }, 2000);
});

//計算兩點距離
function calculateDistance(point1, point2) {
  const deltaX = point2[0] - point1[0];
  const deltaY = point2[1] - point1[1];
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  return distance;
}

//計算經過時間(秒)
function timerFunction() {
  let currentTime = Date.now();
  elapsedTimeInSeconds = Math.floor((currentTime - start_time) / 1000);
}

//一元素取中位數
function median(arr) {
  // 先將陣列排序
  const sortedArr = arr.slice().sort((a, b) => a - b);
  const length = sortedArr.length;

  if (length % 2 === 0) {
    // 如果陣列長度為偶數，取中間兩個數的平均值
    const mid1 = sortedArr[length / 2 - 1];
    const mid2 = sortedArr[length / 2];
    return (mid1 + mid2) / 2;
  } else {
    // 如果陣列長度為奇數，取中間值
    return sortedArr[Math.floor(length / 2)];
  }
}

// 兩項元素取中位數
function median(arr) {
  const length = arr.length;
  const sortedArr = arr.slice().sort((a, b) => a - b);

  const getMedianValue = (sortedArray) => {
    if (length % 2 === 0) {
      const mid1 = sortedArray[length / 2 - 1];
      const mid2 = sortedArray[length / 2];
      return (mid1 + mid2) / 2;
    } else {
      return sortedArray[Math.floor(length / 2)];
    }
  };

  // 分別計算 x, y 的中位數
  const medianX = getMedianValue(sortedArr.map((point) => point[0]));
  const medianY = getMedianValue(sortedArr.map((point) => point[1]));

  return [medianX, medianY];
}

function onResults(results) {
  output_video1Ctx.save();
  output_video1Ctx.clearRect(0, 0, output_video1.width, output_video1.height);
  output_video1Ctx.drawImage(
    results.image,
    0,
    0,
    output_video1.width,
    output_video1.height
  );

  //將畫面切成四宮格
  const rectWidth = output_video1.width / 2;
  const rectHeight = output_video1.height / 2;
  output_video1Ctx.strokeStyle = "#00FF00";
  output_video1Ctx.lineWidth = 1;

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const x = j * rectWidth;
      const y = i * rectHeight;
      const centerX = x + rectWidth / 2;
      const centerY = y + rectHeight / 2;

      // 繪製矩形
      output_video1Ctx.strokeRect(x, y, rectWidth, rectHeight);

      // 繪製中心點
      output_video1Ctx.fillStyle = "#00FF00";
      output_video1Ctx.beginPath();
      output_video1Ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
      output_video1Ctx.fill();
    }
  }

  if (results.multiFaceLandmarks) {
    const faceLandmarks = results.multiFaceLandmarks[0];
    //右眼點位
    const right_eye_point = [
      [
        faceLandmarks[33].x * output_video1.width,
        faceLandmarks[33].y * output_video1.height,
      ],
      [
        faceLandmarks[246].x * output_video1.width,
        faceLandmarks[246].y * output_video1.height,
      ],
      [
        faceLandmarks[161].x * output_video1.width,
        faceLandmarks[161].y * output_video1.height,
      ],
      [
        faceLandmarks[160].x * output_video1.width,
        faceLandmarks[160].y * output_video1.height,
      ],
      [
        faceLandmarks[159].x * output_video1.width,
        faceLandmarks[159].y * output_video1.height,
      ],
      [
        faceLandmarks[158].x * output_video1.width,
        faceLandmarks[158].y * output_video1.height,
      ],
      [
        faceLandmarks[157].x * output_video1.width,
        faceLandmarks[157].y * output_video1.height,
      ],
      [
        faceLandmarks[173].x * output_video1.width,
        faceLandmarks[173].y * output_video1.height,
      ],
      [
        faceLandmarks[133].x * output_video1.width,
        faceLandmarks[133].y * output_video1.height,
      ],
      [
        faceLandmarks[155].x * output_video1.width,
        faceLandmarks[155].y * output_video1.height,
      ],
      [
        faceLandmarks[154].x * output_video1.width,
        faceLandmarks[154].y * output_video1.height,
      ],
      [
        faceLandmarks[153].x * output_video1.width,
        faceLandmarks[153].y * output_video1.height,
      ],
      [
        faceLandmarks[145].x * output_video1.width,
        faceLandmarks[145].y * output_video1.height,
      ],
      [
        faceLandmarks[144].x * output_video1.width,
        faceLandmarks[144].y * output_video1.height,
      ],
      [
        faceLandmarks[163].x * output_video1.width,
        faceLandmarks[163].y * output_video1.height,
      ],
      [
        faceLandmarks[7].x * output_video1.width,
        faceLandmarks[7].y * output_video1.height,
      ],
    ];

    //左眼點位
    const left_eye_point = [
      [
        faceLandmarks[362].x * output_video1.width,
        faceLandmarks[362].y * output_video1.height,
      ],
      [
        faceLandmarks[398].x * output_video1.width,
        faceLandmarks[398].y * output_video1.height,
      ],
      [
        faceLandmarks[384].x * output_video1.width,
        faceLandmarks[384].y * output_video1.height,
      ],
      [
        faceLandmarks[385].x * output_video1.width,
        faceLandmarks[385].y * output_video1.height,
      ],
      [
        faceLandmarks[386].x * output_video1.width,
        faceLandmarks[386].y * output_video1.height,
      ],
      [
        faceLandmarks[387].x * output_video1.width,
        faceLandmarks[387].y * output_video1.height,
      ],
      [
        faceLandmarks[388].x * output_video1.width,
        faceLandmarks[388].y * output_video1.height,
      ],
      [
        faceLandmarks[466].x * output_video1.width,
        faceLandmarks[466].y * output_video1.height,
      ],
      [
        faceLandmarks[263].x * output_video1.width,
        faceLandmarks[263].y * output_video1.height,
      ],
      [
        faceLandmarks[249].x * output_video1.width,
        faceLandmarks[249].y * output_video1.height,
      ],
      [
        faceLandmarks[390].x * output_video1.width,
        faceLandmarks[390].y * output_video1.height,
      ],
      [
        faceLandmarks[373].x * output_video1.width,
        faceLandmarks[373].y * output_video1.height,
      ],
      [
        faceLandmarks[374].x * output_video1.width,
        faceLandmarks[374].y * output_video1.height,
      ],
      [
        faceLandmarks[380].x * output_video1.width,
        faceLandmarks[380].y * output_video1.height,
      ],
      [
        faceLandmarks[381].x * output_video1.width,
        faceLandmarks[381].y * output_video1.height,
      ],
      [
        faceLandmarks[382].x * output_video1.width,
        faceLandmarks[382].y * output_video1.height,
      ],
    ];

    const left_iris_point = [
      faceLandmarks[473].x * output_video1.width,
      faceLandmarks[473].y * output_video1.height,
    ];
    const right_iris_point = [
      faceLandmarks[468].x * output_video1.width,
      faceLandmarks[468].y * output_video1.height,
    ];

    if (center_log === true) {
      right_iris_list.push([right_iris_point[0], right_iris_point[1]]);
      right_right_list.push([right_eye_point[0][0], right_eye_point[0][1]]);
      right_left_list.push([right_eye_point[8][0], right_eye_point[8][1]]);

      left_iris_list.push([left_iris_point[0], left_iris_point[1]]);
      left_right_list.push([left_eye_point[0][0], left_eye_point[0][1]]);
      left_left_list.push([left_eye_point[8][0], left_eye_point[8][1]]);
    }
    if (top_log === true) {
      right_top_list.push([right_iris_point[0], right_iris_point[1]]);
      left_top_list.push([left_iris_point[0], left_iris_point[1]]);
    }
    if (bottom_log === true) {
      right_bottom_list.push([right_iris_point[0], right_iris_point[1]]);
      left_bottom_list.push([left_iris_point[0], left_iris_point[1]]);
    }

    //右眼右側距離
    let right_right_intime = calculateDistance(
      right_iris_point,
      right_eye_point[0]
    );
    //右眼左側距離
    let right_left_intime = calculateDistance(
      right_iris_point,
      right_eye_point[8]
    );
    //右眼上方距離
    let right_top_intime = calculateDistance(
      mid_right_top_list,
      right_iris_point
    );
    //右眼下方距離
    let right_bottom_intime = calculateDistance(
      mid_right_bottom_list,
      right_iris_point
    );
    //右眼水平即時比值
    let right_hor_intime = right_right_intime / right_left_intime;
    //右眼垂直即時比值
    let right_ver_intime = right_top_intime / right_bottom_intime;

    //左眼右側距離
    let left_right_intime = calculateDistance(
      left_iris_point,
      left_eye_point[0]
    );
    //左眼左側距離
    let left_left_intime = calculateDistance(
      left_iris_point,
      left_eye_point[8]
    );
    //右眼上方距離
    let left_top_intime = calculateDistance(mid_left_top_list, left_iris_point);
    //右眼下方距離
    let left_bottom_intime = calculateDistance(
      mid_left_bottom_list,
      left_iris_point
    );

    //左眼水平即時比值
    let left_hor_intime = left_right_intime / left_left_intime;
    //左眼垂直即時比值
    let left_ver_intime = left_top_intime / left_bottom_intime;

    if (
      (right_hor_intime < right_hor_ratio ||
        left_hor_intime < left_hor_ratio) &&
      (right_ver_intime < right_ver_ratio || left_ver_intime < left_hor_ratio)
    ) {
      numbers.top_right_count++;
    } else if (
      (right_hor_intime < right_hor_ratio ||
        left_hor_intime < left_hor_ratio) &&
      (right_ver_intime > right_ver_ratio || left_ver_intime > left_hor_ratio)
    ) {
      numbers.bottom_right_count++;
    } else if (
      (right_hor_intime > right_hor_ratio ||
        left_hor_intime > left_hor_ratio) &&
      (right_ver_intime < right_ver_ratio || left_ver_intime < left_hor_ratio)
    ) {
      numbers.top_left_count++;
    } else if (
      (right_hor_intime > right_hor_ratio ||
        left_hor_intime > left_hor_ratio) &&
      (right_ver_intime > right_ver_ratio || left_ver_intime > left_hor_ratio)
    ) {
      numbers.bottom_left_count++;
    }

    timerFunction();
    if (elapsedTimeInSeconds >= 2) {
      let maxNumber = Math.max(...Object.values(numbers));
      let maxcountName = Object.keys(numbers).find(
        (key) => numbers[key] === maxNumber
      );
      if (maxcountName === "top_right_count") {
        output_video1Ctx.fillStyle = "blue";
        output_video1Ctx.font = "48px Arial"; // 設置字體樣式和大小
        output_video1Ctx.fillText("top_right", 1600, 150);
      } else if (maxcountName === "bottom_right_count") {
        output_video1Ctx.fillStyle = "blue";
        output_video1Ctx.font = "48px Arial";
        output_video1Ctx.fillText("bottom_right", 1600, 650);
      } else if (maxcountName === "top_left_count") {
        output_video1Ctx.fillStyle = "blue";
        output_video1Ctx.font = "48px Arial";
        output_video1Ctx.fillText("top_left", 100, 150);
      } else if (maxcountName === "bottom_left_count") {
        output_video1Ctx.fillStyle = "blue";
        output_video1Ctx.font = "48px Arial";
        output_video1Ctx.fillText("bottom_left", 100, 650);
      }
      resetcount();
      start_time = Date.now();
    }

    console.log(right_iris_point);

    output_video1Ctx.restore();
  }
}

//按下按鈕之後執行
startbutton.addEventListener("click", function () {
  startbutton.style.display = "none";
  positionpoint_center.style.display = "block";
  positionpoint_center.classList.add("blinking");
  center_log = true;

  setTimeout(function () {
    positionpoint_center.style.display = "none";
    hor_line.style.display = "block";
    positionpoint_top.style.display = "block";
    positionpoint_top.classList.add("blinking");
    center_log = false;
    top_log = true;
    //右眼瞳孔中位數
    mid_right_iris_list = median(right_iris_list);
    //右眼右側中位數
    mid_right_right_list = median(right_right_list);
    //右眼左側中位數
    mid_right_left_list = median(right_left_list);
    //右眼上方中位數
    mid_right_top_list = median(right_top_list);
    //右眼下方中位數
    mid_right_bottom_list = median(right_bottom_list);
    //右眼瞳孔與右側距離
    const right_right_length = calculateDistance(
      mid_right_iris_list,
      mid_right_right_list
    );
    //右眼瞳孔與左測距離
    const right_left_length = calculateDistance(
      mid_right_iris_list,
      mid_right_left_list
    );
    //右眼看中間時左右側比值
    right_hor_ratio = right_right_length / right_left_length;

    //左眼瞳孔中位數
    mid_left_iris_list = median(left_iris_list);
    //左眼右側中位數
    mid_left_right_list = median(left_right_list);
    //左眼左側中位數
    mid_left_left_list = median(left_left_list);
    //左眼上方中位數
    mid_left_top_list = median(left_top_list);
    //左眼下方中位數
    mid_left_bottom_list = median(left_bottom_list);
    //左眼瞳孔與右側距離
    const left_right_lenght = calculateDistance(
      mid_left_iris_list,
      mid_left_right_list
    );
    //左眼瞳孔與左側距離
    const left_left_lenght = calculateDistance(
      mid_left_iris_list,
      mid_left_left_list
    );
    //左眼看中間時左右側比值
    left_hor_ratio = left_right_lenght / left_left_lenght;
  }, 3000);

  setTimeout(function () {
    positionpoint_top.style.display = "none";
    positionpoint_bottom.style.display = "block";
    positionpoint_bottom.classList.add("blinking");
    top_log = false;
    bottom_log = true;

    //右眼瞳孔看上的中位數
    mid_right_top_list = median(right_top_list);
    //左眼瞳孔看上的中位數
    mid_left_top_list = median(left_top_list);
  }, 6000);

  setTimeout(function () {
    positionpoint_bottom.style.display = "none";
    hor_line.style.display = "none";
    output_video1.style.display = "block";
    bottom_log = false;

    //右眼瞳孔看下的中位數
    mid_right_bottom_list = median(right_bottom_list);
    //左眼瞳孔看下的中位數
    mid_left_bottom_list = median(left_bottom_list);

    //右眼瞳孔看中間與看上的距離
    const right_top_lenght = calculateDistance(
      mid_right_iris_list,
      mid_right_top_list
    );
    //右眼瞳孔看中間與看下的距離
    const right_bottom_lenght = calculateDistance(
      mid_right_iris_list,
      mid_right_bottom_list
    );
    //左眼瞳孔看中間與看上的距離
    const left_top_lenght = calculateDistance(
      mid_left_iris_list,
      mid_left_top_list
    );
    //左眼瞳孔看中間與看下的距離
    const left_bottom_lenght = calculateDistance(
      mid_left_iris_list,
      mid_left_bottom_list
    );

    //右眼瞳孔看中間時看上及看下的比值
    right_ver_ratio = right_top_lenght / right_bottom_lenght;
    //左眼瞳孔看中間時看上及看下的比值
    left_ver_ratio = left_top_lenght / left_bottom_lenght;
  }, 9000);
});
