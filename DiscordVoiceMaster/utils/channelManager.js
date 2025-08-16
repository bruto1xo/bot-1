const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    async lockChannel(channel, client) {
        const channelData = client.tempChannels.get(channel.id);
        
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            Connect: false
        });
        
        channelData.locked = true;
        client.tempChannels.set(channel.id, channelData);
    },

    async unlockChannel(channel, client) {
        const channelData = client.tempChannels.get(channel.id);
        
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            Connect: true
        });
        
        channelData.locked = false;
        client.tempChannels.set(channel.id, channelData);
    },

    async permitUser(channel, userId) {
        await channel.permissionOverwrites.create(userId, {
            Connect: true,
            ViewChannel: true
        });
    },

    async rejectUser(channel, userId, guild) {
        // Remove user from channel if they're in it
        const member = await guild.members.fetch(userId);
        if (member.voice.channelId === channel.id) {
            await member.voice.disconnect('Rejected from channel');
        }
        
        // Deny access
        await channel.permissionOverwrites.create(userId, {
            Connect: false,
            ViewChannel: true
        });
    },

    async lockChat(channel, client) {
        const channelData = client.tempChannels.get(channel.id);
        const ownerId = channelData.ownerId;
        
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            SendMessages: false
        });
        
        await channel.permissionOverwrites.create(ownerId, {
            SendMessages: true
        });
        
        channelData.chatLocked = true;
        client.tempChannels.set(channel.id, channelData);
    },

    async unlockChat(channel, client) {
        const channelData = client.tempChannels.get(channel.id);
        
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            SendMessages: true
        });
        
        channelData.chatLocked = false;
        client.tempChannels.set(channel.id, channelData);
    },

    async transferOwnership(channel, newOwnerId, client) {
        const channelData = client.tempChannels.get(channel.id);
        const oldOwnerId = channelData.ownerId;
        
        // Remove old owner permissions
        await channel.permissionOverwrites.delete(oldOwnerId);
        
        // Add new owner permissions
        await channel.permissionOverwrites.create(newOwnerId, {
            ManageChannels: true,
            ManageRoles: true,
            MoveMembers: true,
            MuteMembers: true,
            DeafenMembers: true
        });
        
        // Update data
        client.channelOwners.delete(oldOwnerId);
        client.channelOwners.set(newOwnerId, channel.id);
        
        channelData.ownerId = newOwnerId;
        client.tempChannels.set(channel.id, channelData);
    }
};
