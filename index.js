const express = require('express');
const multiparty = require('multiparty');
const fs = require('fs');
const app = express()

var PORT = process.env.PORT || 3000;

var repo = []

app.use(express.json());
app.set('views','./views')
app.set('view engine','ejs')

// Routes
app.get('/', (req,res) => {
  res.render('index',{repo, id:req.query.id})
})



app.get("/ping", (req,res)=>{
  let obj = {
  "status": "OK",
  "code": 200        
    }

    res.json(obj)
    return
})

app.get("/protocol",(req,res)=>{
  let obj = {
    "version": "v3",
    "messageMethod": "multipartMessage",
    "supportedEncoding": "NONE",
    "supportedCharacterSet": "UTF-8",
    "hasDiscovery": false,
    "message_ContentType": "application/json"
  }

  res.json(obj)
  return

})

app.post("/v3/multipartMessage", (req,res)=>{
  //console.log(req.headers)
  //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
  //console.log(fullUrl)
  var tenant = req.headers['x-tenantid'];
  var data = '';
  var form = new multiparty.Form()
  form.parse(req, (err,fields,files)=>{
    //console.log("err ",err)
    //console.log("fields ",JSON.parse(fields.ParameterRequest[0]).documentName)
    //const _bodname = JSON.parse(fields.ParameterRequest[0]).documentName;
    const _bodname = req.query.documentName
    const _lid = req.query.logicalId
   // BODName.push(_bodname)
    console.log("Received : %s, Lid:%s",_bodname,_lid)
    //console.log("files ",files.MessagePayload[0].path)
    // Read stream from file saved in temp folder
    var reader = fs.createReadStream(files.MessagePayload[0].path)
    reader.on('data',(chunk)=> {
      data += chunk
    })

    reader.on('end',()=>{
   // console.log(data)
   const mapObj = {bod:_bodname, content: data}      

   const obj = {
    lid:_lid,
    document:mapObj
    }
    
    repo.push(obj)

    })
    // Delete file from temp folder
    fs.unlinkSync(files.MessagePayload[0].path)
  })

  var response = {
    "status": "OK",
    "code": 202,
    "message": "The request was processed successfully"
}

  res.set("X-TenantId",tenant).json(response).status(202)
  //res.status(200)
  return
})

app.listen(PORT, ()=> console.log(`server started at http://localhost:${PORT}`))

