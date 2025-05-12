// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));

app.listen(3000, () => console.log('Server running at http://localhost:3000'));

// models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  backgroundColor: { type: String, default: '' }
});
module.exports = mongoose.model('User', UserSchema);

// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/create', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.send('User created');
});

module.exports = router;

// scripts/createUser.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

(async () => {
  const hashed = await bcrypt.hash('admin123', 10);
  const user = new User({ username: 'admin', password: hashed });
  await user.save();
  console.log('User created: admin');
  process.exit();
})();

// scripts/seed.js
console.log('No seed data yet. You can add default entries here.');

// public/index.html
<!DOCTYPE html>
<html>
<head>
 // server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

app.listen(3000, () => console.log('Server running at http://localhost:3000'));

// models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  backgroundColor: { type: String, default: '' }
});
module.exports = mongoose.model('User', UserSchema);

// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/create', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.send('User created');
});

module.exports = router;

// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Dummy authentication middleware (replace with real auth)
router.use(async (req, res, next) => {
  const user = await User.findOne({ username: 'admin' });
  req.user = user;
  next();
});

router.post('/background', async (req, res) => {
  const { color } = req.body;
  if (!req.user) return res.status(401).send('Unauthorized');
  req.user.backgroundColor = color;
  await req.user.save();
  res.json({ success: true });
});

router.get('/background', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  res.json({ color: req.user.backgroundColor || '' });
});

module.exports = router;

// scripts/createUser.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

(async () => {
  const hashed = await bcrypt.hash('admin123', 10);
  const user = new User({ username: 'admin', password: hashed });
  await user.save();
  console.log('User created: admin');
  process.exit();
})();

// scripts/seed.js
console.log('No seed data yet. You can add default entries here.');

// public/index.html
<!DOCTYPE html>
<html>
<head>
  <title>Simple Panel</title>
</head>
<body>
  <h1>Welcome to the Panel</h1>
  <label for="bgPicker">Background Color:</label>
  <input type="color" id="bgPicker" />
  <button onclick="setBackground()">Apply</button>

  <script>
    async function setBackground() {
      const color = document.getElementById('bgPicker').value;
      document.body.style.backgroundColor = color;
      localStorage.setItem('bgColor', color);

      await fetch('/api/user/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color })
      });
    }

    window.addEventListener('DOMContentLoaded', async () => {
      const savedColor = localStorage.getItem('bgColor');
      if (savedColor) {
        document.body.style.backgroundColor = savedColor;
        document.getElementById('bgPicker').value = savedColor;
      }

      try {
        const res = await fetch('/api/user/background');
        const data = await res.json();
        if (data.color) {
          document.body.style.backgroundColor = data.color;
          document.getElementById('bgPicker').value = data.color;
        }
      } catch (err) {
        console.warn('Not logged in or failed to load background color');
      }
    });
  </script>
</body>
</html>

// .env
MONGO_URI=mongodb://localhost:27017/panel
