const express= require("express");
const fs= require("fs");
const { nanoid } = require("nanoid");


let app= express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/votes/vote/:user",(req,res,next)=>{
    if(!req.query.apiKey){
        res.status(401).send("apikey doesn't exist")
    }
    else{
    next();
    }
})
app.use("/votes/party/:party",(req,res,next)=>{
    if(!req.query.apiKey){
        res.status(401).send("apikey doesn't exist")
    }
    else{
    next();
    }
})



app.get("/",(req,res)=>{
    res.send("sever started")
})

app.post("/user/create",(req,res)=>{
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const parsed= JSON.parse(data);
        let newbody={...req.body,id:nanoid()}
        parsed.users=[...parsed.users,newbody];
        fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
            res.status(201).send(`user created ${newbody.id}`)
        })
    })
})

app.post("/user/login",(req,res)=>{
    
    const body=req.body;
    if(body.username===undefined||body.password===undefined){
       return res.status(400).end(JSON.stringify({ status: "please provide username and password" }))
    }
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const parsed=JSON.parse(data);
        
        let count=0;
        for(let i=0;i<parsed.users.length;i++){
            if(parsed.users[i].username==body.username&&parsed.users[i].password==body.password){
              var token=nanoid();
               parsed.users[i].token= token;
              fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
                return res.send(JSON.stringify({ status: "Login Successful", token }));
              })   
              count++;
            }
        }
        if(count==0){
           return  res.status(401).end(JSON.stringify({ status: "Invalid Credentials" }))
        }
    })
})


app.post("/user/logout",(req,res)=>{
    let token= req.query.apiKey;
    fs.readFile("./db.json","utf-8",(err,data)=>{
        let parsed=JSON.parse(data);
        parsed.users=parsed.users.map((el)=>{
            if(el.token===token){
                delete el.token
                return el;
            }else{
                return el;
            }
        })
        fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
            return res.send(JSON.stringify({ status: "user logged out successfully" }))
        })
    })
})


app.get("/votes/party/:party",(req,res)=>{
    let token=req.query.apiKey;
    let {party}= req.params;
    console.log(party)
    if(!token){
       return res.status(401).send("apikey doesn't exist")
    }
    fs.readFile("./db.json","utf-8",(err,data)=>{
     let parsed= JSON.parse(data);
     let result= parsed.users.filter((el)=>{
         return el.party==party;
     })
     console.log
     return res.json(result)
    })

})

app.get("/votes/voters",(req,res)=>{
    let token=req.query.apiKey;
    if(!token){
        return res.status(401).send("apikey doesn't exist")
     }
     fs.readFile("./db.json","utf-8",(err,data)=>{
        let parsed= JSON.parse(data);
        let result= parsed.users.filter((el)=>{
            return el.role==="voter"
        })
        return res.json(result)
       })

})

app.post("/votes/vote/:user",(req,res)=>{
    let token=req.query.apiKey;
    let user=req.params.user;
    if(!token){
        return res.status(401).send("apikey doesn't exist")
     }
     fs.readFile(".db.json","utf-8",(err,data)=>{
         let parsed=JSON.parse(data);
         parsed.users=parsed.users.map((el)=>{
             if(el.name===user){
                 el.votes=el.votes+1;
                 
             }
             return el;
         })
         fs.writeFile("./db.json",JSON.stringify(parsed),"utf-8",()=>{
            return res.send("vote increased")
        })
     })
   
})

app.get("/db",(req,res)=>{
    fs.readFile(".db.json","utf-8",(err,data)=>{
      return res.json(JSON.parse(data));
    })
})

app.post("/db",(req,res)=>{
    fs.writeFile("./db.json",JSON.stringify(req.body),"utf-8",()=>{
        return res.send("data updated");
    })
})


const PORT =process.env.PORT || 8080

app.listen(PORT,()=>{
    console.log("server is on");
})