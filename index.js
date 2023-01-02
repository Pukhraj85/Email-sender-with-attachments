const nodemailer = require('nodemailer')
const express = require('express')
const PORT = process.env.PORT || 4000
const app =express()
const multer = require('multer')
const path = require('path')
app.use(express.json())
app.use(express.static(path.join(__dirname + "public/uploads")))
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

var upload = multer({storage:storage}).array('file',100);
let paths = []
async function majorFucntion(paths,req,res){
    try {
        const transporter =   nodemailer.createTransport({
            service: 'gmail',
            auth : {
                user : 'Your Mail ID',
                pass:'Above Mail Pass'
            },
        });
        var from = req.body.from
        var to = req.body.to
        var subject = req.body.subject
        var message = req.body.message
        const mailOptions = {
            from:from,
            to : to,
            subject:subject,
            text: message,
            //html: '<h1>helllo</h1>',
            attachments:paths
        };
        const result = await transporter.sendMail(mailOptions)
        return result 
    } catch (error) {
        return error
    }
}
app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/index.html")
})
app.post('/sendemail',(req,res)=>{
    
    upload(req,res,(error)=>{
        if(error){
            console.log("error in uploading file")
            return
        }
        else{
            req.files.forEach(file=>{
                paths.push({
                    filename:Date.now()+"file" + path.extname(file.originalname),
                    path:file.path
                })
            });
            console.log(paths)
            majorFucntion(paths,req,res)
            .then((result)=>{
                console.log("Email is sent" + result)
                res.send("email is sent")
            })
            .catch((error)=>{
                console.log("An error occurred"+error.message)
                res.send("Error is there in sending messages")
            })
        }
    })
})

app.listen(PORT,()=>{
    console.log(`App is listening on  port ${PORT}`)
})
