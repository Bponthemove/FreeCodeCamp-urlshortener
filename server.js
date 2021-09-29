require('dotenv').config();
const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Url = require('./schemas/urlModel');


mongoose.connect('mongodb://localhost:27017/urlshortener', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('connection open'))
  .catch((err) => console.log(err))

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }))


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
//find input url in db and return the long version
app.get('/api/shorturl/:input', async (req, res) => {
  try {
    const {input} = req.params
    // const shortUrlNr = parseInt(input)
    console.log(input)
    console.log(Url.findOne( {short_url: `${input}`} ))
    const found = await Url.findOne( {short_url: `${input}`} )
    res.redirect(`https://${found.full_url}`)
  } catch (err) {
      console.log(err)
      console.log(res.status)
  }
})

app.post('/api/shorturl/new', async (req, res, next) => {
  try {
    const { url } = req.body
    //check for valid url, if not respond with json object as asked in tests.
    if (!validURL(url)) {
      return res.json({error: 'invalid url'})
    } else {
      //find url in db and get json response with the corresponding object. 
      //If it is already in the db, than redirect to this website as asked in tests. 
        const foundUrl = await Url.findOne( {full_url: `${url}`} )
        if (foundUrl !== null) {
          res.redirect(`https://${foundUrl.full_url}`)
        } else {
        //if the url is not there, we''ll create a new entry with that url.
        const short_url = await getHighestShort()
        const newUrl = await new Url( {full_url: `${url}`,  short_url: `${short_url}`} )
        await newUrl.save()
        res.json(newUrl)
        } 
    }
  } catch(err) {
    console.log('catch error post request')
    return next(err)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

async function getHighestShort() {
  let shortMax = 1
  //make an array from the collection with short values sorted descending
  //and than pick the first one which should be the highest value.
  //if the array is empty just return 1 as it is the first one
  try {
      const results = await Url.find({}).sort({short_url: 1}).limit().exec()
      console.log(results)
      if (results.length !== 0) {
        shortMax = results[0].short_url + 1
      }
      return shortMax 
  } catch(err) {
      console.log('catch error server.js function getHighestShort')
      console.log(err)
      return shortMax
  }
}



