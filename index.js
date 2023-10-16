const express       =require('express'),
      bodyParser    = require('body-parser'),
      mongoose      = require('mongoose'),     
      nodemailer    =require('nodemailer'),
      cors          =require('cors')

const teamRoutes = require('./routes/teams');
const adminRoutes = require('./routes/user')

const app = express();
require('dotenv').config();

app.use(express.json())
app.use(cors());
app.use(bodyParser.json({limit: "30mb",extended:true}))
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}))

const url = process.env.MONGODB_URI || 5000;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true})   
.then(() => console.log("Connected to database."))
.catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Welcome to GDSC Hack the Space server!');
});

app.use("/teams",teamRoutes);
app.use("/admin",adminRoutes);



 let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    post: 587,
    security: false,
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
})

app.post('/mail',(req,res,next)=>{
    var message=req.body.message
    var name=req.body.name
    var senderEmail=req.body.email

    var mailOptions={
        from: name,
        to: 'meenalavish2764@gmail.com',
        subject: "Website Contact Message from "+name,
        replyTo: senderEmail,
        html: `${message} <br><br> From:${senderEmail}`
    }

    transporter.sendMail(mailOptions,(err,data)=>{
        if(err){
            res.json({
                status: err
            })
            console.log(err)
        }else{
            res.json({
                status: "success"
            })
            console.log("email sent "+data.response)
        }
    })
})

transporter.verify(function(err,success){
    if(err){
        console.log(err);
    }else{
        console.log("server is ready to send emails")
    }

});
 
const port = process.env.PORT || 5000;

app.listen(port, process.env.IP, () => {
    console.log("showing on port 5000.");
});

