const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const running = new Map();

const commands = [
  new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start sending random numbers"),

  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop sending random numbers")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("Commands registered!");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const channelId = interaction.channelId;

  if (interaction.commandName === "start") {
    if (running.has(channelId)) {
      return interaction.reply("Already running!");
    }

    await interaction.reply("Started! 🔢");

    const interval = setInterval(() => {
      const number = Math.floor(Math.random() * 5000) + 1;
      interaction.channel.send(String(number));
    }, 1000);

    running.set(channelId, interval);
  }

  if (interaction.commandName === "stop") {
    const interval = running.get(channelId);

    if (!interval) {
      return interaction.reply("Not running.");
    }

    clearInterval(interval);
    running.delete(channelId);

    await interaction.reply("Stopped! 🛑");
  }
});

client.login(TOKEN);
