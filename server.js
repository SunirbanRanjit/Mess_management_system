const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { JsonWebTokenError } = require('jsonwebtoken');
const User = require('./model/user');
const { MongoClient, ServerApiVersion } = require('mongodb');


const JWT_SECRET = 'fhgshdgfviouedgf9we65928r74rhffeg.[d;f.gv[e;pgrior]';

const app = express();
const server = http.createServer(app);
//const io = socket(server);


mongoose.connect( 'mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
});

console.log(mongoose.connection.readyState);

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());

app.post('/login' , async (req, res) => {
    const {email, password: plainTextpassword } = req.body;
    const user = await User.findOne({email}).lean();
    console.log(email,plainTextpassword);
    if(!user){
        return res.json({state: 'error', error: 'Invalid username!!'});
    }

    if(await bcrypt.compare(plainTextpassword, user.password)){
        // username and password matched
        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, 
            JWT_SECRET
        );
        return res.json({state: 'ok', data: token});
    }

    return res.json({state: 'error', error: 'Invalid password!!'});
})
//
app.post('/register', async (req, res) => {
    const {username, email, room, password: plainTextpassword} = req.body;

    console.log(username,email,room,plainTextpassword);
    if(plainTextpassword.length <8)
        return res.json({status: 'error', error: 'Password should be atleast 8 characters'});
    const password = await bcrypt.hash(plainTextpassword ,  10 );

    try{
        const user = await User.findOne({email}).lean();
        console.log(user);
        const response = await User.create({
            email, username, room, password
        });
        console.log('User created successfully ', response);
    }catch(error){
        console.log(error);
        
        if(error.code === 11000)
            return res.json({status: 'error', error: 'Email ID already in use.'});
        else
            throw error;
        
    }

    res.json({ status: 'ok'});
})

app.post('/authenticate', async (req,res) => {
    const {token} = req.body;
    var today = new Date();
    //console.log(today);
    const dt = `${today.getDate()}/${today.getMonth() + 1}`;
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tm_dt = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}`;
    var off_morning=0,off_night=0,total=0;
    console.log(dt,tm_dt);
    total = await User.find({})
                    .select({username: 1})
                    .count()
    off_morning = await User.find({ $and: [{'attendance.date': dt},
                            {'attendance.morning': false}]})
                            .select({username: 1})
                            .count()
    
    off_night = await User.find({ $and: [{'attendance.date': dt},
                            {'attendance.night': false}]})
                            .select({username: 1})
                            .count()
    //off_night = await User.countDocuments({ 'attendance.night':false }).exec();
    
    const count_morning=total-off_morning;
    const count_night=total-off_night;
    console.log(count_morning,count_night,total,off_morning,off_night); 
    try{
        
        const usr = jwt.verify(token,JWT_SECRET);
        const email = usr.email;
        const user_db = await User.findOne({email}).lean();
        const id=user_db._id;
        const username = `${user_db.username} - ( ${user_db.room} )`;
        //console.log(user_db);
        for(x in user_db.attendance){
            //console.log(x);
            if(user_db.attendance[x].date === tm_dt){
                console.log("found")
                return res.json({state: 'ok' , username, date: dt, m_chk: user_db.attendance[x].morning, n_chk: user_db.attendance[x].night, count_morning, count_night});
            }
        }

        await User.updateOne({'_id':id}, { $push: {
            attendance: {
                date: tm_dt,
                morning: true,
                night: true
        }}});
        return res.json({state: 'ok' , username, date: dt, m_chk: true, n_chk: true , count_morning, count_night});
        
    } catch(error){
        console.log(error);
        return res.json({state: 'error' , error: 'Oops.. \nSomething went wrong\n Log in again'});
    }
});

app.post('/update', async (req, res) => {
    const {token, morning, night} = req.body;
    //console.log(req.body);
    var today = new Date();
    
    today.setDate(today.getDate() + 1);
    const dt = `${today.getDate()}/${today.getMonth() + 1}`;
    console.log(dt);
    try{
        const user = jwt.verify(token, JWT_SECRET);
        //console.log(user);
        const _id = user.id; 
        const u = await User.findOne({_id}).lean();
        await User.updateOne({'_id': _id, 'attendance.date': dt}, { $set: {
            'attendance.$': {
                date: dt,
                morning,
                night
        }}});

        //console.log(u,"inside updatte");
        return res.json({status: 'ok'});
        
             

    } catch(error){
        console.log(error);
        return res.json({status: 'error' , error});
    }
});


app.get('/', (req, res) => {

})

const PORT  =  process.env.PORT || 3000;
server.listen(PORT, ()=> console.log(`Server started at ${PORT} `));
