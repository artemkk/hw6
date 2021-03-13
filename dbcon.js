var mysql = require('mysql')

var pool = mysql.createPool(
{
	host: 'classmysql.engr.oregonstate.edu',
	user: 'cs290_kuryacha',
	password: '4584',
	database: 'cs290_kuryacha',
	dateStrings : 'true' // Need for calendar; explain why
})

module.exports.pool = pool