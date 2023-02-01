const {gameOptions, againOptions} = require('./options');

const TelegramApi = require('node-telegram-bot-api');

const token = '5737606412:AAG7JAXN5nBwdBlHKNk4HPvLBEFSeD6dMvI';

const bot = new TelegramApi(token, {polling: true});

const chats = {};

const startGame = async (chatId) => {
  const randomNum = Math.floor(Math.random()*10);
  chats[chatId] = randomNum;
  await bot.sendMessage(chatId, 'Отгадывайте!', gameOptions)
}

const start = () => {
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    console.log(msg);

    bot.setMyCommands([
      {
        command: '/start', description: 'Начальное сообщение'
      },
      {
        command: '/info', description: 'Знакомство'
      },
      {
        command: '/game', description: 'Игра "Отгадай число"'
      },
    ])

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/22c/b26/22cb267f-a2ab-41e4-8360-fe35ac048c3b/192/1.webp');
      return bot.sendMessage(chatId, 'Чатбот denpan приветствует Вас. Выберете в меню интересующий пункт.');
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Меня зовут Денчик, а тебя ${msg.from.first_name}`);
    }

    if (text === '/game') {
      await bot.sendMessage(chatId, `Сейчас я загадаю число от 1 до 9, а Вам нужно будет его отгадать 😏`);
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, 'Я Вас не понимаю');

  });

  bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId);
    }

    await bot.sendMessage(chatId, `Вы выбрали число ${data}`);

    if (+data === +chats[chatId]) {
      return bot.sendMessage(chatId, `Правильно! Это число ${chats[chatId]}. Вы случайно не Коперфильд?🤩`, againOptions);
    } else {
      return bot.sendMessage(chatId, `Почти угадали 😕 Бот загадал число ${chats[chatId]}. В следующий раз должно повезти!`, againOptions);
    }
  })
};

start();

