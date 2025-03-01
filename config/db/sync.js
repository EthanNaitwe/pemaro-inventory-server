// const sequelize = require('./config/database');
// const User = require('./models/User');
const { sequelize } = require('.');
const SocialMediaPlatform = require('../../models/SocialMediaPlatform');
// const SocialMediaPlatform = require('./models/SocialMediaPlatform');
// const UserSocialAccount = require('./models/UserSocialAccount');

(async () => {
    try {
        await sequelize.sync({ force: true }); // `force: true` drops tables before recreating (use with caution)
        console.log('Database & tables created!');

        // Insert predefined social media platforms
        await SocialMediaPlatform.bulkCreate([
            { platform_name: 'LinkedIn', platform_url: 'https://www.linkedin.com/' },
            { platform_name: 'Facebook', platform_url: 'https://www.facebook.com/' },
            { platform_name: 'Instagram', platform_url: 'https://www.instagram.com/' },
            { platform_name: 'X', platform_url: 'https://x.com/' },
        ]);

        console.log('Social Media Platforms added!');
        process.exit();
    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();
