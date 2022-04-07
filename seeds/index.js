const seedUsers = require('./user-seeds');
const seedServices = require('./service-seeds');

const sequelize = require('../config/connection');

const seedAll = async () => {
    await sequelize.sync({ force: true });
    console.log('--------------');
    await seedUsers();
    console.log('--------------');

    await seedServices();
    console.log('--------------');


    process.exit(0);
};

seedAll();