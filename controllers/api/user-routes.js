const router = require("express").Router();
const {
  User,
  Service
} = require("../../models");

// get all developers
router.get('/', (req, res) => {
  User.findAll({
      attributes: {
        exclude: ['password'],
      },
    })
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// get one route
router.get('/:id', (req, res) => {
  User.findOne({
      attributes: {
        exclude: ['password']
      },
      where: {
        id: req.params.id
      },
      include: [
        {
        model: Service,
        attributes: ['id', 'service_title', 'service_type', 'service_description', 'budget', 'user_id', 'created_at']
        }]
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// create a user
router.post('/', (req, res) => {
  User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      account_type: req.body.account_type
    })
    .then((dbUserData) => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.account_type = dbUserData.account_type;
        req.session.loggedIn = true;

        res.json(dbUserData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/login', (req, res) => {
  console.log(req.body)
  User.findOne({
    where:{
      email: req.body.email
    }
  })
  .then(dbUserData => {
    console.log(dbUserData)
    if (!dbUserData) {
      res.status(400).json({ message: 'No user with that email address!' });
      return;
    }
    const validPassword = dbUserData.checkPassword(req.body.password);

    if(!validPassword) {
      res.status(400).json({ message: 'Incorrect password!' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.account_type = dbUserData.account_type;//identifier - who I am
      req.session.loggedIn = true;
      res.json({user: dbUserData, message: 'You are now logged in!'});
    });
  });
});

router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  }
  else {
    res.status(404).end();
  }
});

router.put('/:id', (req, res) => {
  User.update(req.body, {
      individualHooks: true,
      where: {
        id: req.params.id
      }
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', (req, res) => {
  User.destroy({
      where: {
        id: req.params.id,
      },
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
