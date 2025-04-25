const { DataTypes } = require('sequelize');
const sequelize = require('./sqliteInstance');
const User = require('./User');
const Video = require('./Video');

const Like = sequelize.define('Like', {
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
}, {
  tableName: 'likes',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'video_id']
    }
  ]
});

Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(Video, { foreignKey: 'video_id' });
User.hasMany(Like, { foreignKey: 'user_id' });
Video.hasMany(Like, { foreignKey: 'video_id' });

module.exports = Like;
