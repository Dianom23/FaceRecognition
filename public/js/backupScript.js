const video = document.getElementById('video')
const content = document.getElementById('content')
const info = document.getElementById('info')


let labelImagesParse =[]

Promise.all([
    labelImagesParse = OnLoadLableImage(),
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
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      const results = resizedDetections.map((d) => {
        return faceMatched.findBestMatch(d.descriptor) 
      })
      results.forEach( (result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        drawBox.draw(canvas)
      })
    }, 100)
  })
}

function loadLabeledImages() {
  //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
  const labels = ['Татьяна Воронина', 'Дмитрий Щербаков']
  console.log(labelImagesParse)
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