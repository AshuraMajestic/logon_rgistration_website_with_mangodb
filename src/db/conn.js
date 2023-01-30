const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/AshuraEmployees",{
    useUnifiedTopology: true
}).then(()=>{
    console.log("Connection Created");
}).catch((err)=>{
    console.log("Error: " + err);
});
