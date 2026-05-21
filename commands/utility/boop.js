const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('boop')
		.setDescription('booptehsnek'),
	async execute(interaction) {
		await interaction.reply('o///o');
	},
};