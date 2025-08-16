module.exports = {
    // The voice channel ID that triggers temp channel creation
    TRIGGER_CHANNEL_ID: process.env.TRIGGER_CHANNEL_ID || '123456789012345678',
    
    // Category where temp channels will be created
    TEMP_CATEGORY_ID: process.env.TEMP_CATEGORY_ID || '123456789012345678',
    
    // Default channel limit
    DEFAULT_CHANNEL_LIMIT: 10,
    
    // Cleanup delay in milliseconds
    CLEANUP_DELAY: 1000,
    
    // Command prefix
    PREFIX: '.v',
    
    // Colors for embeds
    COLORS: {
        PRIMARY: '#5865F2',
        SUCCESS: '#57F287',
        WARNING: '#FEE75C',
        ERROR: '#ED4245'
    }
};
