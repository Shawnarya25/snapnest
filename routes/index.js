var express = require('express');
var router = express.Router();
const postModel = require('./post');
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const upload = require('./multer');

// Username login strategy
passport.use(new localStrategy(userModel.authenticate()));

// Email login strategy
passport.use('email-login', new localStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await userModel.findOne({ email: email });
      if (!user) return done(null, false);

      user.authenticate(password, function (err, userObj) {
        if (err) return done(err);
        if (!userObj) return done(null, false);
        return done(null, userObj);
      });

    } catch (error) {
      return done(error);
    }
  }
));

router.get('/', function (req, res) {
  res.render('index'); // username login page
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  console.log(user);

  res.render('profile', { user: user });
});
router.get('/show', isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  console.log(user);

  res.render('show', { user: user });
});
router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.find()
    .populate("user")

  res.render('feed', { user: user, posts: posts });
});
router.get('/thread/:id', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.findById(req.params.id)
    .populate("user")

  res.render('thread', { user: user, elem: posts });
});

// Register user
router.post('/register', function (req, res) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.name,
  });

  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      });
    })
    .catch(function (err) {
      console.log(err);
      res.redirect('/register');
    });
});

// Login using EMAIL at /login
router.post('/login', passport.authenticate('email-login', {
  failureRedirect: '/',
  successRedirect: '/profile',
}));
router.get('/login', function (req, res) {
  res.render('login'); // email login page
});

// Login using USERNAME at /
router.post('/', passport.authenticate('local', {
  failureRedirect: '/',
  successRedirect: '/profile',
}));

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect('/');
  });
});
router.get('/add', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("add", { user: user });
});
router.post('/add', isLoggedIn, upload.single("selectfile"), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  });
  user.posts.push(post._id);//push post id to user's posts array
  await user.save();
  res.redirect('/profile');
});


router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileimage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
