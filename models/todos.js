module.exports = (sequelize, DataTypes)=>{
	return sequelize.define('todo',{
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				len: [1,250] //no empty strings allowed
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	})
}