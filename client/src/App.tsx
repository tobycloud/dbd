import { DiscordSDK } from "@discord/embedded-app-sdk";
import { APIGuild } from "discord-api-types/v10";
import { useEffect, useState } from "react";

async function setupDiscordSdk(discordSdk: DiscordSDK) {
  await discordSdk.ready();
  console.log("Discord SDK is ready");

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify", "guilds"],
  });

  // Retrieve an access_token from your activity's server
  const response = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  const auth = await discordSdk.commands.authenticate({ access_token });
  if (auth == null) throw new Error("Authenticate command failed");

  return auth;
}

type AuthData = Awaited<ReturnType<typeof setupDiscordSdk>>;

async function appendVoiceChannelName(discordSdk: DiscordSDK) {
  let activityChannelName = "Unknown";

  // Requesting the channel in GDMs (when the guild ID is null) requires
  // the dm_channels.read scope which requires Discord approval.

  if (discordSdk.channelId != null && discordSdk.guildId != null) {
    // Over RPC collect info about the channel
    console.log("siuuuu", discordSdk.channelId, discordSdk.guildId);
    const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
    console.log("channel", channel);
    if (channel.name == null) return activityChannelName;
    activityChannelName = channel.name;
  }

  // Update the UI with the name of the current voice channel
  return activityChannelName;
}

async function appendGuildAvatar(discordSdk: DiscordSDK, auth: AuthData) {
  // 1. From the HTTP API fetch a list of all of the user's guilds
  const guilds = (await (
    await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
      headers: {
        // NOTE: we're using the access_token provided by the "authenticate" command
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": "application/json",
      },
    })
  ).json()) as APIGuild[];

  // 2. Find the current guild's info, including it's "icon"
  const currentGuild = guilds.find((guild: any) => guild.id === discordSdk.guildId);

  // 3. Append to the UI an img tag with the related information
  if (currentGuild != null) return `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`;
}
export default function App() {
  // Will eventually store the authenticated user's access_token
  const [auth, setAuth] = useState<AuthData>();
  const [voiceChannelName, setVoiceChannelName] = useState<string>();
  const [guildAvatar, setGuildAvatar] = useState<string>();

  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  useEffect(() => {
    setupDiscordSdk(discordSdk).then((auth) => {
      setAuth(auth);
      appendVoiceChannelName(discordSdk).then((name) => setVoiceChannelName(name));
      appendGuildAvatar(discordSdk, auth).then((avatar) => setGuildAvatar(avatar));
    });
  }, []);
  console.log(guildAvatar, auth);
  return (
    <div>
      <img src="/rocket.png" className="logo" alt="Discord" />
      <h1>Hello, World!</h1>
      <p>{auth === undefined ? "Not authenticated" : `Authenticated as ${auth.user.username}#${auth.user.discriminator}`}</p>
      <p>{voiceChannelName === undefined ? "Not in a voice channel" : `In ${voiceChannelName}`}</p>
      <img src={guildAvatar} className="logo" alt="Discord" />
    </div>
  );
}
