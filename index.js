require('dotenv').config()
const express = require('express')
const parser = require('body-parser')
const cors = require('cors')
const bodyParser = require('body-parser')
const { executeQuery } = require('./services/execute.js')
require('./services/execute.js')
const app = express()

app.use(bodyParser.json())
app.use(cors())


const server = app.listen(process.env.PORT , function(){
  const port = server.address().port;
  console.log("Listening on PORT NUMBER", port);
})


app.post("/api/test",  async function(req,res) {
  const age = req.body;
  console.log(age)
const result = await executeQuery('SELECT * FROM WCOUNTRY')

res.send(result)

})