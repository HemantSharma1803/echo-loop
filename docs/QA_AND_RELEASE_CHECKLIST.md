# ECHO//LOOP — QA & Release Checklist

## Static audit completed in the supplied ZIP

- Import-path scan: no missing relative TypeScript/TSX imports detected.
- GitHub Pages workflow added.
- Vite configured with a relative production asset base.
- AI Studio README instructions replaced with production/static deployment documentation.
- `.env.example` no longer implies that a Gemini API key is required to play.
- Favicon and theme metadata added.
- Development diagnostics remain available through F1/backtick but are not part of the normal UI flow.
- A high-impact animation-loop lifecycle issue was fixed: the canvas RAF loop no longer restarts every frame because the HUD callback is now stored in a ref.
- Narrative event subscriptions now return cleanup functions, preventing callback accumulation across level changes.
- Manual loop-reset telemetry now counts only accepted resets, not reset attempts during an active transition.

## Runtime verification to perform after deployment

1. Load the GitHub Pages URL in a fresh browser tab.
2. Start a new game and complete the opening sequence.
3. Verify WASD/arrow movement and E/Space/Enter interaction.
4. Allow a loop to end naturally and verify an Echo appears.
5. Confirm the Echo follows the recorded path and interacts with puzzle objects.
6. Create multiple Echoes and verify previous Echoes continue replaying.
7. Test manual R reset during normal play and during the reset transition.
8. Complete all six Sector 01 chambers.
9. Open/close pause, settings, lore, Echo history, progression and achievements.
10. Reload the page and verify persisted progression remains available.
11. Test the final chamber/climax and replay flow.
12. Test at least one desktop Chromium browser and one mobile/touch browser.
13. Check the browser console for recurring errors.
14. Check the Network panel for failed JS/CSS/asset requests.
15. Run `npm run lint` and `npm run build` in a normal Node environment before the final push.
