const {gameOptions, againOptions, startOptions} = require('./options');

const TelegramApi = require('node-telegram-bot-api');
const axios = require('axios');

const token = '5737606412:AAG7JAXN5nBwdBlHKNk4HPvLBEFSeD6dMvI';

const bot = new TelegramApi(token, {polling: true});

const farengToC = (farengate) => Math.round(farengate/37.8);

const chats = {};

const startGame = async (chatId) => {

  chats[chatId] = Math.floor(Math.random()*3 + 1);
  await bot.sendMessage(chatId, 'Отгадывайте!', gameOptions)
};

const startInfo = async (chatId, msg) => {
  await bot.sendMessage(chatId, `Меня зовут Денчик, а Вас ${msg.from.first_name}`)
}

const startWeather= async (chatId) => {
  await bot.sendMessage(chatId, `Если хотите узнать погоду у себя в регионе, пришлите своё местоположение`);
}

const start = () => {
  bot.on('message', async (msg) => {
    console.log(msg);
    const text = msg.text;
    const chatId = msg.chat.id;


    bot.setMyCommands([
      {
        command: '/start', description: 'В начало'
      },
      {
        command: '/info', description: 'Знакомство'
      },
      {
        command: '/game', description: 'Игра'
      },
      {
        command: '/weather', description: 'Погода"'
      },
    ])

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/22c/b26/22cb267f-a2ab-41e4-8360-fe35ac048c3b/192/1.webp');
      return bot.sendMessage(chatId, 'Чатбот denpan приветствует Вас. Выберете в меню интересующий пункт.', startOptions);

    }

    if (text === '/info') {
      return startInfo(chatId, msg);
    }

    if (text === '/game') {
      await bot.sendMessage(chatId, `Сейчас я загадаю число от 1 до 3, а Вам нужно будет его отгадать 😏`);
      return startGame(chatId);
    }

    if (text === '/weather') {
      return startWeather(chatId);
    }

    if (msg.location) {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${msg.location.latitude}&lon=${msg.location.longitude}&appid=67b5008e3c6240c8a741c2c506623565`;
      try {
        const resp = await axios(url);
        await bot.sendMessage(chatId, `Сейчас в ${resp.data.name} ${farengToC(resp.data.main.temp)}°, скорость ветра ${resp.data.wind.speed}м/c`);
        return;
      } catch (err) {
        await bot.sendMessage(chatId, `Не могу загрузить данные`);
        return
      }
    }

    return bot.sendMessage(chatId, 'Я Вас не понимаю');

  });

  bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/game') {
      await bot.sendMessage(chatId, `Сейчас я загадаю число от 1 до 3, а Вам нужно будет его отгадать 😏`);
      return startGame(chatId);
    }

    if (data === '/info') {
      return startInfo(chatId, msg);
    }

    if (data === '/weather') {
      return startWeather(chatId);
    }

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

