// Dependencies
const Event = require('../structures/Event');

/**
 * Invite create event
 * @event Egglord#InviteCreate
 * @extends {Event}
*/
class InviteCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Invite} invite The invite that was created
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

module.exports = InviteCreate;
