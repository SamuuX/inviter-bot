const Event = require('../structures/Event');

/**
 * Ready event
 * @event Egglord#Ready
 * @extends {Event}
*/
class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @readonly
	*/
	async run(bot) {
		bot.logger.log(`${bot.user.tag} is online.`);

		// Fetch all invites from guilds
		for (const guild of [...bot.guilds.cache.values()]) {
			try {
				const invites = await guild.invites.fetch();
				if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
				bot.guildInvites.set(guild.id, invites);
			} catch (err) {
				bot.logger.error(`Error on guild ${guild.id}: ${err.message}`);
			}
		}

		console.log(bot.guildInvites);
	}
}

module.exports = Ready;
