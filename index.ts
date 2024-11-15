import express from "express";

const app: express.Application = express()

const port = process.env.PORT || 3000;

app.get('/', (req, res)=>{
    res.send("Typescript with express")
})

app.listen(port, ()=>{
    console.log(`Typescript with express \n http://localhost:${port}/`)
})