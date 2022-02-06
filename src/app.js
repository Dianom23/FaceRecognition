const express = require('express')
const path = require('path')
const fs = require('fs')
const upload = require('express-fileupload')

const app = express()
const port = process.env.PORT || 3000

const basePath = path.join(__dirname, '../public')
const resourcesPath = path.join(__dirname, '../public/resources/')
app.use(express.static(basePath))
app.listen(port, () => {
    console.log(('Server started on port ' + port))
})

let labelImages = []
function loadLabeledImages(){
    
    fs.readdir(resourcesPath, (err, files) => {
        labelImages = []
        files.forEach(img => {
            img = img.replace('.jpg', '')
            console.log(img);
            labelImages.push(img)
        });
        console.log(labelImages)
    });
    return labelImages
}

Promise.all([
    loadLabeledImages()
]).then( () => {
    app.get('/api', function(req, res) {
        let label = loadLabeledImages()
        res.json(label)
    });
    
})

app.use(upload())
app.post('/', (req, res) => {
    if(req.files){
        
        let file = req.files.file
        let fileName = file.name
        file.mv(resourcesPath + fileName, err => {
            if(err){
                res.send(err)
            }
            else{
                console.log('File upload')
            }
        })
    }
})
