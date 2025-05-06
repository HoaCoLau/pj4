const User = require('./User');
const Book = require('./Book');

User.hasMany(Book, { foreignKey: 'user_id' });
Book.belongsTo(User, { foreignKey: 'user_id' });
