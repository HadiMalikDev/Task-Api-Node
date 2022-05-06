const knex = require("../database/connection");

module.exports = async ()=> await knex.destroy();
