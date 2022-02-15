const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const botService = require('./utils/botUtils');
const TelegramBot = require('node-telegram-bot-api');

const indexRouter = require('../routes');
const usersRouter = require('../routes/users');

require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN_KEY, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(`${new Date().toLocaleString()} New telegram msg from ${chatId}: `, msg);
    if(JSON.parse(process.env.BOT_USERS_IDS).includes(msg.from.id)) {
        // send a message to the chat acknowledging receipt of their message
        bot.sendMessage(chatId, 'Received your message');
    } else {
        bot.sendMessage(chatId, 'Unauth');
    }
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/sendservicemessage', async (req, res) => {

    console.log(`${new Date().toLocaleString()} Send message: `, req.body);

    if(req.body.st !== process.env.SECRET) {
        res.status(401).send('Unauth');
        return;
    }

    const users = JSON.parse(process.env.BOT_USERS_IDS);

    console.log(`${new Date().toLocaleString()} users: `, users);

    for await (let user of users) {
        botService.sendMessage(bot, user, req.body.messageText);
    }
    // const result = await DbUtils.addShipping(dataObj.date, dataObj.shipping);

    res.status(200);
});

module.exports = app;
