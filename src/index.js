const { Client, Collection, Intents: { FLAGS } } = require('discord.js'),
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path'),
	{ token } = require('./config.js');

const bot = new Client({
	partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_SCHEDULED_EVENT'],
	intents: [FLAGS.GUILDS, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_BANS, FLAGS.GUILD_EMOJIS_AND_STICKERS,
		FLAGS.GUILD_MESSAGES, FLAGS.GUILD_MESSAGE_REACTIONS, FLAGS.DIRECT_MESSAGES, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_INVITES,
		FLAGS.GUILD_SCHEDULED_EVENTS],
});
bot.logger = require('./utils/Logger.js');
bot.guildInvites = new Collection();

(async () => {
	const folders = await readdir('./src/events/');
	folders.forEach(async file => {
		delete require.cache[file];
		const { name } = path.parse(file);
		try {
			const event = new (require(`./events/${file}`))(bot, name);
			bot.logger.log(`Loading Event: ${name}`);
			bot.on(name, (...args) => event.run(bot, ...args));
		} catch (err) {
			bot.logger.log(`Failed to load Event: ${name} error: ${err.message}`);
		}
	});

	bot.login(token);
})();
