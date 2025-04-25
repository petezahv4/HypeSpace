const { DataTypes } = require('sequelize');
const sequelize = require('./sqliteInstance');
const User = require('./User');
const Video = require('./Video');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  video_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'comments',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Video, { foreignKey: 'video_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
Video.hasMany(Comment, { foreignKey: 'video_id' });

module.exports = Comment;
