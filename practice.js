let video;
let poseNet;
let pose;
let skeleton;
let posesArray = [
  "Tree",
  "Chair",
  "Cobra",
  "Warrior III",
  "Dog",
  "Shoulderstand",
  "Triangle",
  "Warrior II",
  "Bridge",
];

var poseImage;

let yogi;
let poseLabel;

var targetLabel;
var errorCounter;
var iterationCounter;
var poseCounter;
var target;

var timeLeft;

function setup() {
  var canvas = createCanvas(500, 600);
  canvas.position(250, 130);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  poseCounter = 0;
  targetLabel = 1;
  target = posesArray[poseCounter];
  document.getElementById("poseName").textContent = target;
  timeLeft = 30;
  document.getElementById("time").textContent = "00:" + timeLeft;
  errorCounter = 0;
  iterationCounter = 0;

  let options = {
    inputs: 34,
    outputs: 6,
    task: "classification",
    debug: true,
  };

  yogi = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model/model2.json",
    metadata: "model/model_meta2.json",
    weights: "model/model.weights2.bin",
  };
  yogi.load(modelInfo, yogiLoaded);
}

function yogiLoaded() {
  console.log("Model ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    yogi.classify(inputs, gotResult);
  } else {
    console.log("Pose not found");
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  document.getElementById("welldone").textContent = "";
  document.getElementById("sparkles").style.display = "none";
  if (results[0].confidence > 0.7) {
    console.log("Confidence");
    if (results[0].label == targetLabel.toString()) {
      console.log(targetLabel);
      iterationCounter = iterationCounter + 1;

      console.log(iterationCounter);

      if (iterationCounter == 30) {
        console.log("30!");
        iterationCounter = 0;
        nextPose();
      } else {
        console.log("doin this");
        timeLeft = timeLeft - 1;
        if (timeLeft < 10) {
          document.getElementById("time").textContent = "00:0" + timeLeft;
        } else {
          document.getElementById("time").textContent = "00:" + timeLeft;
        }
        setTimeout(classifyPose, 1000);
      }
    } else {
      errorCounter = errorCounter + 1;
      console.log("error");
      if (errorCounter >= 4) {
        console.log("four errors");
        iterationCounter = 0;
        timeLeft = 30;
        if (timeLeft < 10) {
          document.getElementById("time").textContent = "00:0" + timeLeft;
        } else {
          document.getElementById("time").textContent = "00:" + timeLeft;
        }
        errorCounter = 0;
        setTimeout(classifyPose, 100);
      } else {
        setTimeout(classifyPose, 100);
      }
    }
  } else {
    console.log("whatwe really dont want");
    setTimeout(classifyPose, 100);
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  document.getElementById("rectangle").style.display = "none";
  console.log("poseNet ready");
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(8);
      stroke(244, 194, 194);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
  pop();
}

function nextPose() {
  if (poseCounter >= 9) {
    console.log("Well done, you have learnt all poses!");
    document.getElementById("finish").textContent = "Amazing!";
    document.getElementById("welldone").textContent = "All poses done.";
    document.getElementById("sparkles").style.display = "block";
  } else {
    console.log("Well done, you all poses!");
    //var stars = document.getElementById("starsid");
    //stars.classList.add("stars.animated");
    errorCounter = 0;
    iterationCounter = 0;
    poseCounter = poseCounter + 1;
    targetLabel = poseCounter + 1;
    console.log("next pose target label" + targetLabel);
    target = posesArray[poseCounter];
    document.getElementById("poseName").textContent = target;
    document.getElementById("welldone").textContent = "Well done, next pose!";
    document.getElementById("sparkles").style.display = "block";
    console.log("classifying again");
    timeLeft = 30;
    document.getElementById("time").textContent = "00:" + timeLeft;
    setTimeout(classifyPose, 4000);
  }
}
