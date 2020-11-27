# Change Log

All notable changes to Godfather will be documented in this file.

## 1.0.0

### Features:
* Added 6 new **roles**: Mayor, Werewolf, Reanimator, Ambusher, Guardian Angel, and Witch
* Added support for **Mafia chats**
* Godfather will now **mute dead players** if it has enough permissions (can be turned off)
* **Aliases** for roles (Vigilante -> Vig, Doctor -> Doc) and categories (Random Town -> RT)
* Server-wide **defaults** for game settings like dayDuration, nightDuration.
* The **final vote count** is now shown when a player is lynched.
* Idle timeouts are *reset* when a new player joins the game.
* Godfather will now detect **broken setups** (like setups with only one winning side) and prevent you from using them.
* Support **whispering** during the day (can be turned off)
* Allow **cancelling** night actions.

### Mechanic Changes
* Jesters now haunt randomly if no action is sent.
* Self-heals and self-vests cannot be transported away anymore.
* Bodyguards can self-vest once per game.
* Survivors, and Veterans have variable vests and alerts depending on the size of the game:
  * 3-5 players: 1 vest/alert
  * 6-10 players: 2 vests/alerts
  * 11-18 players: 3 alerts and 4 vests