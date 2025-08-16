const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

module.exports = {
    createControlPanel(member, channel) {
        const embed = new EmbedBuilder()
            .setTitle('🎛️ Voice Channel Control Panel')
            .setDescription(`Welcome to your temporary voice channel, ${member.displayName}!\nUse the buttons below or commands with \`.v\` prefix.`)
            .addFields(
                { name: '👑 Channel Owner', value: `<@${member.id}>`, inline: true },
                { name: '🏷️ Channel Name', value: channel.name, inline: true },
                { name: '👥 User Limit', value: channel.userLimit ? channel.userLimit.toString() : 'No limit', inline: true }
            )
            .setColor(config.COLORS.PRIMARY)
            .setTimestamp()
            .setFooter({ text: 'Temporary Voice Channel System' });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lock_channel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:lock:1405275833882513518>'),
                new ButtonBuilder()
                    .setCustomId('unlock_channel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:openpadlock:1405275859883131062>'),
                new ButtonBuilder()
                    .setCustomId('limit_channel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:steps:1405274012157739218>'),
                new ButtonBuilder()
                    .setCustomId('rename_channel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:pencils:1405275885065736203>'),
                new ButtonBuilder()
                    .setCustomId('help_panel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:emoji_18:1406134003572146228>')
            );

        const actionRow2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('set_status')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:loading:1405275932742385804>'),
                new ButtonBuilder()
                    .setCustomId('permit_user')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:emoji_19:1406135983979626566>'),
                new ButtonBuilder()
                    .setCustomId('reject_user')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:emoji_20:1406136013340020776>'),
                new ButtonBuilder()
                    .setCustomId('lock_chat')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:emoji_21:1406136041953562675>'),
                new ButtonBuilder()
                    .setCustomId('unlock_chat')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:emoji_23:1406136096311607307>')
            );

        return { embed, actionRow, actionRow2 };
    },

    createHelpEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('📚 Voice Channel Commands Help')
            .setDescription('Here are all available commands for managing your temporary voice channel:')
            .addFields(
                { name: '<:emoji_23:1406136096311607307> `.v lock`', value: 'Lock the channel - only permitted users can join', inline: false },
                { name: '🔓 `.v unlock`', value: 'Unlock the channel - anyone can join', inline: false },
                { name: '👥 `.v limit <number>`', value: 'Set user limit (1-99)', inline: false },
                { name: '✏️ `.v rename <name>`', value: 'Rename your channel', inline: false },
                { name: '📝 `.v setstatus <status>`', value: 'Set a status for your channel', inline: false },
                { name: '✅ `.v permit @user`', value: 'Allow a specific user to join', inline: false },
                { name: '❌ `.v reject @user`', value: 'Prevent a specific user from joining', inline: false },
                { name: '💬🔒 `.v lockchat`', value: 'Lock chat - only you can send messages', inline: false },
                { name: '💬🔓 `.v unlockchat`', value: 'Unlock chat - everyone can send messages', inline: false },
                { name: '🎛️ `.v panel`', value: 'Show the control panel again', inline: false }
            )
            .setColor(config.COLORS.PRIMARY)
            .setFooter({ text: 'Only the channel owner can use these commands' })
            .setTimestamp();

        return embed;
    },

    createErrorEmbed(message) {
        return new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription(message)
            .setColor(config.COLORS.ERROR)
            .setTimestamp();
    },

    createSuccessEmbed(message) {
        return new EmbedBuilder()
            .setTitle('✅ Success')
            .setDescription(message)
            .setColor(config.COLORS.SUCCESS)
            .setTimestamp();
    }
};
