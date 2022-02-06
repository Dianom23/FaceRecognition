const video = document.getElementById('video')
const content = document.getElementById('content')
const info = document.getElementById('info')
const uploadFile = document.querySelector('#uploadFile')
const uploadSubmit = document.querySelector('#uploadSubmit')
uploadFile.value = null

uploadSubmit.onclick = () => {
  console.log('click')
  setTimeout(document.location.reload(true),1500)
}

const faceDetectionLi = document.querySelector('#faceDetection')
const happyDetectionLi = document.querySelector('#happyDetection')
const angryDetectionLi = document.querySelector('#angryDetection')

let expressionsScore ={
  happyScore: 0,
  angryScore: 0
}

let identificationCheck ={
  face: false,
  happyExpression: false,
  angryExpression: false
}



let isFaceDetection = true
let FaceDetected = false
let identificationSuccess = false
let timeFixationFace = 0

Promise.all([
    OnLoadLableImage(), 
    //faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('../weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../models'),
    faceapi.nets.ageGenderNet.loadFromUri('../weights'),
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
    recognizeFaces()
}


async function recognizeFaces() {
  const labeledDescriptors = await loadLabeledImages()
  const faceMatched = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    content.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      const results = resizedDetections.map((d) => {
        return faceMatched.findBestMatch(d.descriptor) 
      })


      if(results.length > 0 && results[0]._label != 'unknown' && isFaceDetection){
        timeFixationFace++
        faceDetectionLi.className = 'wait'
        console.log(timeFixationFace)
        if(timeFixationFace == 30){
          stayFace(results[0]._label)
          isFaceDetection = false
        }
      }
      else if(results.length == 0 && isFaceDetection){
        faceDetectionLi.className = ' '
        timeFixationFace = 0
      }

      if(FaceDetected){
        checkExpressions(detections[0].expressions.happy, detections[0].expressions.angry)
      }


      results.forEach( (result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        drawBox.draw(canvas)
      })
    }, 100)
  })
}


let labels = []
function OnLoadLableImage(){
  fetch('https://limitless-hollows-70013.herokuapp.com/api')
  // fetch('http://localhost:3000/api')
    .then(response => {
        if(response.ok){
          response.json()
          .then(res => {
              console.log(res)
              labels = res
          });
        }
        else{
            console.log('Ошибка!!!')
        }
    })
}



async function loadLabeledImages() {
  await OnLoadLableImage()
  await console.log(labels)
  return Promise.all(
    
    labels.map(async (label) => {
      const descriptions = []
      const img = await faceapi.fetchImage(`../resources/${label}.jpg`)
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      descriptions.push(detections.descriptor)
      document.body.append(label+' Faces Loaded | ')
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

let checkFace = false

function stayFace(label){
  console.log(label)
  faceDetectionLi.className = 'confirm'
  happyDetectionLi.className = 'wait'
  angryDetectionLi.className = 'wait'
  FaceDetected = true
  identificationCheck.face = true
}

let timeHappyScore = 0
let timeAngryScore = 0
function checkExpressions(happyScore, angryScore){
  
  if(happyScore >= 0.7){
    if(expressionsScore.happyScore >= 5){
      happyDetectionLi.className = 'confirm'
      identificationCheck.happyExpression = true
    }
    else{
      expressionsScore.happyScore += 1
    }
  }
  else{
    expressionsScore.happyScore = 0
  }

  if(angryScore >= 0.7){
    if(expressionsScore.angryScore >= 5){
      angryDetectionLi.className = 'confirm'
      identificationCheck.angryExpression = true
    }
    else{
      expressionsScore.angryScore += 1
    }
  }
  else{
    expressionsScore.angryScore = 0
  }
  console.log(expressionsScore)
  
  // let timerHappyScore = setInterval(() => {
  //   if(happyScore >= 0.8){
  //     if(timeHappyScore >= 5){
  //       happyDetectionLi.className = 'confirm'
  //       clearInterval(timerHappyScore)
  //     }
  //     else{
  //       timeHappyScore++
  //     }
  //   }
  //   else if(happyScore < 0.8){
  //     timeHappyScore = 0
  //   }
  // }, 1000);

  // let angryHappyScore = setInterval(() => {
  //   if(angryScore >= 0.8){
  //     if(timeAngryScore >= 5){
  //       angryDetectionLi.className = 'confirm'
  //       clearInterval(angryHappyScore)
  //     }
  //     else{
  //       timeAngryScore++
  //     }
  //   }
  //   else if(angryScore < 0.8){
  //     timeAngryScore = 0
  //   }
  // }, 1000);


  // console.log(timeHappyScore, timeAngryScore)

  // if(happyScore > 0.8){
  //   happyDetectionLi.className = 'confirm'
  // }
  // if(angryScore > 0.8){
  //   angryDetectionLi.className = 'confirm'
  // }
  if(identificationCheck.face, identificationCheck.happyExpression, identificationCheck.angryExpression){
    setTimeout(oneFinaly, 1000);
  }
}
// let finaly = document.querySelector('#finaly')


let oneCallFinaly = false;
 
function oneFinaly(){
	if (oneCallFinaly == false){
		alert('Ты вроде норм чел');
	}
	oneCallFinaly = true;
}