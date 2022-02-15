const sendMessage = (bot, chatId, msgStr) => {
    console.log(`${new Date().toLocaleString()} Gonna send telegram msg: `, msgStr);
    bot.sendMessage(chatId, msgStr);
}

module.exports.sendMessage = sendMessage;