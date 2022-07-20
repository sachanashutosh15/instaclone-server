const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { postsModel } = require('./models');

mongoose.connect('mongodb+srv://sachanashutosh15:Ashutosh_99@cluster0.agcck.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
  console.log('Successfully connected to database...')
})
.catch((error) => {
  console.log(error);
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg'
  || file.mimetype === 'image/png'
  || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const newPostInfo = {};

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
      console.log(file);
      const info = Date().split(' ');
      const timeStamp = info[1] + '_' + info[2] + '_' + info[3] + '_' + info[4].split(':').join('');
      newPostInfo.date = info[2] + ' ' + info[1] + ' ' + info[3];
      newPostInfo.name = timeStamp + file.originalname;
      cb(null, timeStamp + file.originalname)
    },
  }),
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter: fileFilter,
}).single('postImage');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('./uploads'));

app.post('/post', upload, async (req, res) => {
  newPostInfo.likes = 0;
  let data = new postsModel({
    author: req.body.author,
    location: req.body.location,
    description: req.body.description,
    likes: newPostInfo.likes,
    date: newPostInfo.date,
    path: `/uploads/${newPostInfo.name}`,
  })
  await data.save();
  res.status(200).send({"post": "isWorking"});
})

app.get('/posts', async (req, res) => {
  const data = await postsModel.find();
  res.send(data);
})

app.patch('/like', async (req, res) => {
  try {
    const data = await postsModel.updateOne(
      { _id: req.body._id },
      { $set: { likes: req.body.likes + 1 } }
    );
    if (!data.acknowledged) throw new Error('Likes not updated');
    res.status(200).send({ likes: req.body.likes + 1 })
  }
  catch (err) {
    console.log(err);
  }
})

app.listen(process.env.PORT || 5000, () => {
  console.log('server listening on port 5000...')
})
