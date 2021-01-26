# Change Log

All notable changes to Godfather will be documented in this file.

## v1.2.1

### Bug Fixes:

-   Mayors can now reveal on stand and during trial-voting.
-   Removed the role categories **Good** and **Evil** because of frequent errors.
-   Cult chats are now created at the start of the game instead of after a successful conversion.
-   Removed a couple of usages of the "lynch".

## v1.2.0

### Features:

-   3 new **roles** and 1 new **faction**: Crusader (Town), Cult Leader and Cult Member (Cult).
-   **Trials**: When enabled (using the setting `enableTrials`), hammered players aren't eliminated, but put on trial and given 30 seconds to defend themselves. After that, the Town can decide whether they're guilty, innocent or abstain from voting.
    1.  Hammering a super saint will force an elimination.
    2.  When trials are enabled, eliminated Jesters can only haunt people voting guilty or abstaining.
-   **Role Modifiers**: Role modifiers let you apply changes to a role. To use modifiers on a role in a setup, use `Rolename +Mod1 +Mod2`. For example: `Serial Killer +innocent +strongman`. Available role modifiers include:
    1.  Innocent: The target will show up as innocent to cops.
    2.  Suspicious: The target will show up as suspicious to cops.
    3.  NVote: The role will have N votes. (+3Vote)
    4.  NShot: (killing roles only) The role will have N bullets.
    5.  Strongman: (killing roles only) The role will have a powerful attack.
-   **Wills**: Allow players to set their will using `=will <message>`. Wills can be disabled by the setting `disableWills`.
-   **Plurality Votes**: When enabled (using the setting `enablePlurality`), the player with the most votes is auto-hammered at EoD, in case a lynch cannot be achieved.

### Mechanics:

-   **Framer**: A Framer's effects last until an investigative role checks their target.
-   **Witch**: Instead of a permanent Basic defence, Witches now have a one-time Basic defence.

### Bug Fixes:

-   Fixed Escort not notifying targets of being roleblocked.
-   Fixed Executioner not having Basic defence.
-   Retributionists can no longer be controlled by Witches.
-   Guilty vigilantes revived by Retributionists no longer shoot themselves the next night.

## v1.1.0

### Features:

-   2 new **roles**: Investigator (Town Investigative) and Juggernaut (Neutral Killing)
-   **Slash commands**: Godfather supports [slash commands](https://i.imgur.com/SckQLM3.png) for votecount, playerlist and remaining. Responses to these commands are only visible to you, so you can quickly check the votecount w/o cluttering the channel.
-   **Join by reaction**: After creating a game, players can join by reacting to a tick-mark on the original message. This prompt lasts for 45 seconds.
-   **Disabling channels**: You can disable bot commands on specific channels using `=disablechannel <channel>`. Run the same command to enable channels again.
-   **Adaptive slowmode**: When enabled (using =set adaptiveSlowmode true), Godfather will change a channel's slowmode depending on how many players are alive.
-   **Numbered nicknames**: When enabled (using =set numberedNicknames true), Godfather will add a player's number to their nickname.
-   **Muting at night**: When enabled (using =set muteAtNight true), Godfather will mute players at night.
-   The bot will now announce Full Moon nights.
-   Night results are sent as one message now.
-   Added a "You have died!" result for dead players.
-   Server admins can delete games, even if they are not the host.
-   Commands are now case insensitive.
-   =playerlist shows the number of alive players.
-   Mafia Vanilla has been renamed to Vanilla Mafia. (with an alias of Mafia Vanilla so it doesn't break existing setups).

### Mechanic Changes:

-   Vigilante bullets are now variable like Veteran alerts:
    -   3-5 players: 1 bullet
    -   6-10 players: 2 bullets
    -   11-18 players: 4 bullets

### Bug Fixes:

-   Reanimators can no longer reanimate (and get shot) by a veteran.
-   Fixed a bug letting doctors self-heal indefinitely.
-   Replacements get action PMs at night.
-   Amnesiacs can remember to be an executioner w/o breaking the bot.

## 1.0.0

### Features:

-   Added 6 new **roles**: Mayor, Werewolf, Reanimator, Ambusher, Guardian Angel, and Witch
-   Added support for **Mafia chats**
-   Godfather will now **mute dead players** if it has enough permissions (can be turned off)
-   **Aliases** for roles (Vigilante -> Vig, Doctor -> Doc) and categories (Random Town -> RT)
-   Server-wide **defaults** for game settings like dayDuration, nightDuration.
-   The **final vote count** is now shown when a player is lynched.
-   Idle timeouts are _reset_ when a new player joins the game.
-   Godfather will now detect **broken setups** (like setups with only one winning side) and prevent you from using them.
-   Support **whispering** during the day (can be turned off)
-   Allow **cancelling** night actions.

### Mechanic Changes

-   Jesters now haunt randomly if no action is sent.
-   Self-heals and self-vests cannot be transported away anymore.
-   Bodyguards can self-vest once per game.
-   Survivors, and Veterans have variable vests and alerts depending on the size of the game:
    -   3-5 players: 1 vest/alert
    -   6-10 players: 2 vests/alerts
    -   11-18 players: 3 alerts and 4 vests
