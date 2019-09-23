/* global require, process */
const chalk = require('chalk');
const app = require('./app');

// eslint-disable-next-line no-process-env
const port = process.env.PORT;

app.listen(port, () => {
    console.log(chalk.bgGreen.gray(`App started on port ${port}`));
});