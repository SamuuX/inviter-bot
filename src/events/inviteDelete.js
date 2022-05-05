// Dependencies
const Event = require('../structures/Event');

/**
 * Invite delete event
 * @event Egglord#InviteDelete
 * @extends {Event}
*/
class InviteDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Invite} invite The invite that was deleted
	 * @readonly
	*/
	async run(bot, invite) {
		const { guild } = invite;

		// Update invite collection
		try {
			const invites = await guild.invites.fetch();
			if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
			bot.guildInvites.set(guild.id, invites);
		} catch (err) {
			bot.logger.error(err.message);
		}
	}
}

module.exports = InviteDelete;
