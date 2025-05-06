const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('user/users', { users });
    } catch (err) {
        res.status(500).send('Error users');
    }
}
exports.getUserDetail = async (req, res) => {
    const usera = await User.findByPk(req.params.id);
    if (!usera) return res.status(404).send('User not found');
    res.render('user/detail', { usera });
  };

  exports.editUserForm = async (req, res) => {
    const usera = await User.findByPk(req.params.id);
    if (!usera) return res.status(404).send('User not found');
    res.render('user/edit', { usera });
  };

  exports.editUser = async (req, res) => {
    try {
      const usera = await User.findByPk(req.params.id);
      if (!usera) return res.status(404).send('User not found');
  
      usera.email = req.body.email;
      usera.name = req.body.name;
      if (req.file) {
        usera.image = req.file.filename;
      }
      await usera.save();
      res.redirect('/users/' + usera.id);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating user');
    }
  };
