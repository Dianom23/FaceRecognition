function OnLoadLableImage(){
    fetch('http://localhost:3000/api')
      .then(response => {
          if(response.ok){
            response.json()
            .then(res => {
                //return JSONtoArray(res)
                // labelImages = res
                console.log(res)
                return res
                
                //return JSON.parse(res)
            });
          }
          else{
              console.log('Ошибка!!!')
          }
      })
}