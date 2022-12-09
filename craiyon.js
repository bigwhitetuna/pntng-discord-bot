require('dotenv').config();

// set up discord client and required gatewaybits
const { Client, GatewayIntentBits, messageLink, DiscordAPIError, AttachmentBuilder } = require("discord.js");
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
    console.log(`${user} submitted craiyon image prompt: '${prompt}', waiting for response...`)
    const result = await craiyon.generate({
      prompt,
    });
    console.log("Result received. Processing now.");
    let bufferImages = [];
    result.images.forEach(image => {
        bufferImages.push(image.base64);
    });
    console.log('Added images to buffer')
    return bufferImages;
}

// check messages and trigger
discordClient.on('messageCreate', async msg => {
    if (msg.content.startsWith('/craiyon ')) {
        // get the text
        const prompt = msg.content.slice(9);
        const user = msg.author.username;
        // display response
        submitImage(prompt, user).then((bufferImages) => {
            console.log('Uploading images as files')
            bufferImages.forEach(i => {
                const file = new AttachmentBuilder(Buffer.from(i, "base64"), `${i.slice(0,12)}`);
                msg.reply({files: [file]})
            });
        console.log('Responded!')
        }).catch((error) => {
        console.log(error)
        });
    }
});