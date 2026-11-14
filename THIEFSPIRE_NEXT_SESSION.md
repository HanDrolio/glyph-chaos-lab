# THIEFSPIRE — Current Art & Navigation Status
Updated: 2026-11-13
Repository: HanDrolio/glyph-chaos-lab
Live file: thiefspire.html
Pre-overhaul backup: thiefspire-v3-pre-chibi.html

## Implemented — Chibi art overhaul
- [x] Three unique 64×64 pixel-art thieves: Cutpurse (brown leather / daggers / scarf), Shadow (purple hood / twin blades), Charlatan (red hat / potion magic)
- [x] Playable class selector shows the actual game-drawn chibi portraits
- [x] Larger enemy sprites relative to player sprites
- [x] Redrawn enemy, knight, guard, monster, and boss pixel sprites with readable silhouettes
- [x] Each of the three thieves has a distinct idle/attack animation
- [x] Eighteen enemy types have individually specified motion profiles and attack cues
- [x] Low-resolution stepped frame animation; all artwork is original code-generated graphics
- [x] Castle art, backgrounds, and mobile card controls preserved

## Implemented — Simpler map
- [x] Replaced separate three-choice text menu with a direct-tap map
- [x] Three glowing icon choices on the current floor
- [x] Icons: ⚔️ fight, 💀 elite, 💰 loot, 🛒 merchant, 🔥 rest, ❓ event, 👑 boss
- [x] Still three acts of twelve floors, with three options at every floor
- [x] Map automatically focuses the current act after reload
- [x] One-tap entry, no follow-up confirmation or duplicate room rewards
- [x] Existing save progress is preserved

## Verified in scripted checks
- All three origin choices and class names
- Rendering and attack animation paths for eighteen enemy types
- A full simulated 36-floor run, five fragment pickups, all three bosses
- Resume game in Act II with three clickable choices available

## Next QA
- [ ] Check the visual sizing and clipping on a real iPhone, especially during large boss attacks
- [ ] Confirm the chibi art reads clearly on Safari's actual rendered canvas
- [ ] Adjust palettes, silhouette proportions, and animations from playtester screenshots
- [ ] Rebalance if playtest difficulty still feels unfair

## Rules
- Keep gentle V2.1 balance.
- No loot duplication exploits.
- Preserve earlier playable backups.
- Use existing COSM.OS pixel look as inspiration, not copied sprite sheets.
