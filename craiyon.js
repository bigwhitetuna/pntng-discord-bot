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
        // TODO: add support for limiting the # of response images (max 9) so there isn't a wall of images if you don't want it
        const prompt = msg.content.slice(9);
        const user = msg.author.username;
        msg.reply(`Craiyon responds a little slow, so it may take a few minutes to populate. Just be patient!`)
        // display response
        submitImage(prompt, user).then((bufferImages) => {
            console.log('Uploading images as files')
            // trying to add them as all one upload instead of individual ones
            let imageArray = []
            bufferImages.forEach(i => {
                const image = new AttachmentBuilder(Buffer.from(i, "base64"), `${i.slice(0,12)}`);
                imageArray.push(image)
            });
            msg.reply({files: imageArray})
        console.log('Responded!')
        console.log('--------------------')
        }).catch((error) => {
        console.log(error)
        });
    }
});