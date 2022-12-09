require('dotenv').config();

// set up discord client and required gatewaybits
const { Client, GatewayIntentBits, messageLink, DiscordAPIError } = require("discord.js");
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
discordClient.login(process.env.DISCORD_TOKEN)

// setup craiyon connection
let craiyon = require('craiyon');
craiyon = new craiyon.Client();

// friendly message to see bot is working correctly
discordClient.on("ready", () => {
    console.log(`Craiyon bot is ready!`)
});

// function for submitting image request and getting response
const submitImage = async (prompt, user) => {
    console.log(`${user} submitted image prompt: '${prompt}', waiting for response...`)
    let result = await craiyon.generate({
      prompt,
    })
    // TODO: response is base64, need to figure out how to get from base64 arrays to uploads to discord
    const bufferImages = [];
    result.images.forEach(image => {
        bufferImages.push(image);
    });
    return bufferImages;
}

// check messages and trigger
discordClient.on('messageCreate', async msg => {
// const openai = new OpenAIApi(configuration);
    if (msg.content.startsWith('/craiyon ')) {
        // get the text
        const prompt = msg.content.slice(9);
        const user = msg.author.username
        console.log(`${user} submitted image prompt: '${prompt}', waiting for response...`)
        let result = await craiyon.generate({
          prompt,
        })
        // TODO: response is base64, need to figure out how to get from base64 arrays to uploads to discord
        const bufferImages = [];
        result.images.forEach(image => {
            bufferImages.push(image);
        });
        // display response
        submitImage(prompt, user);
        let imageCounter = 0
        bufferImages.forEach(image => {
            const file = new discordClient.Attachment(Buffer.from(base64Data, "base64"), `${imageCounter}`);
            msg.reply(file)
            imageCounter++
        })
        .then((bufferImages) => {
        console.log('Responded!')
        }).catch((error) => {
        console.log(error)
        });
    }
});