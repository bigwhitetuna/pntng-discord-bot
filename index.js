// TODO: Register commands so they show up natively in discord
require('dotenv').config();
// set up discord client and required gatewaybits
const { Client, GatewayIntentBits, messageLink } = require("discord.js");
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
discordClient.login(process.env.DISCORD_TOKEN)
// set up openai package and set configuration
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_TOKEN,
});

// function to open connection
const connect = () => {
  return openai = new OpenAIApi(configuration);
}

// friendly message to see bot is working correctly
discordClient.on("ready", () => {
  console.log(`Dalle bot is ready!`)
});

// set completion model
/*
davinci is most expensive, but also best. can view https://beta.openai.com/docs/models to see other model codes to change out 
and https://openai.com/api/pricing/ to see their costs
*/
// TODO: Consider changing this to a variable model selection so I can more easily select between the two
// ada, the worst of all, but hella, hella cheap
// const completionModel = 'text-ada-001';
// babbage, less than curie and straightforward, but not nearly as good
// const completionModel = 'text-babbage-001';
// curie, faster and cheaper than davinci, just not quite as good.
const completionModel = 'text-curie-001';
// davicni, most expensive but also the best. max request 4000 tokens, $.12/1k tokens
// const completionModel = 'text-davinci-003';

/* 
-----------------------------------------------------
check for /dalletext completion prompt and respond
-----------------------------------------------------
*/
// function for submitting TEXT request and getting response
const submitText = async (text , user) => {
  connect()
  console.log(`${user} submitted dalle text: '${text}', waiting for response...`)
  let response = await openai.createCompletion({
    model: completionModel,
    prompt: text,
    max_tokens: 500,
    temperature: 0.6
  });
  return response = response.data.choices[0].text
}
discordClient.on('messageCreate', async msg => {
  if (msg.content.startsWith('/dalletext')) {
    // get the text
    let text = msg.content.slice(11);
    const user = msg.author.username
    submitText(text,user).then((response) => {
      msg.reply(response);
      console.log('Responded!')
    }).catch((error) => {
      console.log(error)
    });
  }
});

/* 
-----------------------------------------------------
check for /dalleimage prompt and respond
-----------------------------------------------------
*/

// function for submitting image request and getting response
const submitImage = async (text, user) => {
  connect()
  console.log(`${user} submitted dalle image prompt: '${text}', waiting for response...`)
  let response = await openai.createImage({
    prompt: text,
    n: 2,
    size: '1024x1024',
    response_format: 'url',
  })
  return response = response.data.data[0].url
}
// TODO: do logic to accept size requests
// const small = '256x256'
// const medium = '512x512'
// const large = '1024x1024'
// TODO: do logic to remove the text for the different size requests so the text is submitted without the command
// TODO: logic for allowing # of responses submission (and removal of that text for submission)
discordClient.on('messageCreate', async msg => {
  // const openai = new OpenAIApi(configuration);
  if (msg.content.startsWith('/dalleimage ')) {
    // get the text
    const text = msg.content.slice(12);
    const user = msg.author.username
    // display response
    submitImage(text, user).then((response) => {
      msg.reply(response);
      console.log('Responded!')
    }).catch((error) => {
      console.log(error)
    });
  }
});
