var database = {
		host     : 'HOST',
    user     : 'USER',
    password : 'PASSWORD',
    database : 'DATABASE',
    charset  : 'CHARSET'
  };

var knex = require('knex')({
											client: 'mysql',
											connection: database
										});

var bookshelf = require('bookshelf')(knex);

var Team = bookshelf.Model.extend({
  tableName: 'teams',
  hasTimestamps: true,
  
});

var Teams = bookshelf.Collection.extend({
  model: Team
});

var rtnObj = {};
		rtnObj.team = Team;
		rtnObj.teams = Teams;

module.exports = rtnObj;  

