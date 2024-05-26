const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const collection = require('./config'); // Assuming you have a MongoDB collection setup

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Route to fetch albums
app.get('/getAlbums', async (req, res) => {
  try {
    const albumsPath = path.join(__dirname, '..', 'public', 'img', 'Nasheeds'); // Adjust path accordingly
    const folders = await fs.readdir(albumsPath);
    const albums = await Promise.all(folders.map(async folder => {
      const folderPath = path.join(albumsPath, folder);
      const stat = await fs.stat(folderPath);
      if (stat.isDirectory()) {
        return {
          folder,
          title: folder,
          description: `Description of ${folder}`,
          cover: `/img/Nasheeds/${folder}/cover.jpeg`
        };
      }
      return null;
    }));
    res.json({ albums: albums.filter(album => album) }); // Filter out null values
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch nasheeds
app.get('/getNasheeds/:folder', async (req, res) => {
  try {
    const folder = req.params.folder;
    if (!folder) {
      return res.status(400).json({ error: 'Folder parameter is required' });
    }
    console.log(folder)
    const folderPath = path.join('public','img','Nasheeds', folder);
    const stat = await fs.stat(folderPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Not a directory' });
    }

    const files = await fs.readdir(folderPath);
    const audioFiles = files.filter(file => ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase()));
    res.json({ nasheeds: audioFiles });
  } catch (error) {
    console.error('Error fetching nasheeds:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  };

  const existingUser = await collection.findOne({ email: data.email });
  if (existingUser) {
    res.send('User already exists');
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;
    const userData = await collection.insertMany(data);
    console.log(userData);
    res.render('login');
  }
});

app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log('Received login request for email:', email);
  const user = await collection.findOne({ email: email });
  console.log('Found user:', user);
  if (user) {
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      res.render('index');
    } else {
      res.send('Invalid password');
    }
  } else {
    res.send('User not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
