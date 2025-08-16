const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Collections for commands and temporary channels
client.commands = new Collection();
client.tempChannels = new Collection(); // Store temp channel data
client.channelOwners = new Collection(); // Store channel ownership
client.cooldowns = new Collection(); // Command cooldowns
client.voiceConnection = null; // Store voice connection

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Handle prefix commands
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('.v ')) return;

    const args = message.content.slice(3).trim().split(/ +/);
    const command = client.commands.get('voice');
    if (!command) return;

    // Check cooldowns
    const { cooldowns } = client;
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more seconds before using this command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error('Error executing command:', error);
        await message.reply('There was an error executing this command!');
    }
});

// Handle owner-only commands with + prefix
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('+')) return;
    
    // Check if user is the bot owner
    if (message.author.id !== process.env.OWNER_ID) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args[0].toLowerCase();
    
    try {
        switch (command) {
            case 'join':
                let targetChannel;
                let channelName;
                
                // Check if channel ID is provided as argument
                if (args[1]) {
                    targetChannel = message.guild.channels.cache.get(args[1]);
                    if (!targetChannel || targetChannel.type !== 2) { // 2 = voice channel
                        return message.reply('❌ Invalid voice channel ID provided!');
                    }
                    channelName = targetChannel.name;
                } else {
                    // Use user's current voice channel
                    if (!message.member.voice.channel) {
                        return message.reply('❌ You need to be in a voice channel or provide a channel ID!');
                    }
                    targetChannel = message.member.voice.channel;
                    channelName = targetChannel.name;
                }
                
                const connection = joinVoiceChannel({
                    channelId: targetChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });
                
                client.voiceConnection = connection;
                
                connection.on(VoiceConnectionStatus.Ready, () => {
                    message.reply(`✅ Joined ${channelName}!`);
                });
                
                connection.on(VoiceConnectionStatus.Disconnected, () => {
                    client.voiceConnection = null;
                });
                
                break;
                
            case 'leave':
                const existingConnection = getVoiceConnection(message.guild.id);
                if (!existingConnection) {
                    return message.reply('❌ I\'m not connected to any voice channel!');
                }
                
                existingConnection.destroy();
                client.voiceConnection = null;
                await message.reply('✅ Left the voice channel!');
                break;
                
            default:
                // Don't respond to unknown + commands
                break;
        }
    } catch (error) {
        console.error('Error executing owner command:', error);
        await message.reply('❌ An error occurred while executing the command!');
    }
});

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    client.user.setActivity('Temporary Voice Channels', { type: 'WATCHING' });
});

client.login(process.env.DISCORD_TOKEN);
