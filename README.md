# Linouuuuuuuuuche — Researched Final Edition

Built after reviewing feminine editorial layouts and interactive birthday-cake patterns.

Flow:
1. Editorial birthday cover
2. Doctor off-duty → birthday mode interaction
3. Non-selectable prescription from the heart
4. Detailed wishes for her 26th year
5. SVG luxury cake with microphone blow detection, smoke and uploaded birthday audio
6. Centered detailed love-letter finale

Upload all files including the assets folder to GitHub Pages.


## Mobile viewport fix
This build fixes clipping on smaller phones:
- every page is vertically scrollable
- no nested-scroll trap on details/cake/final pages
- supports dynamic and small mobile viewport units
- short-screen typography and cake sizing adapt automatically
- each page returns to the top when opened


## Long-name mobile fix
Fixed the two long-name overflow issues:
- cover page name
- final birthday page name

The full “Linouuuuuuuuuche” now scales independently and remains centered on narrow phones.


## Phone dimensions
Additional responsive tuning added for:
- 360x800
- 375x812
- 390x844
- 393x852
- 412x915
- 430x932

The long name, navigation, cake and final page are scaled independently for narrow/short phones.


## Native mobile scrolling fix
This build removes fixed/nested scrolling on phones and lets Safari/Chrome use normal document scrolling.
It also explicitly enables vertical touch panning and resets the page to the top when changing screens.


## Mobile scroll v2
Hard mobile scrolling fix:
- active phone screen now uses normal block/document flow instead of a viewport flex container
- removed nested scroll areas
- cake SVG cannot swallow swipe gestures
- added touch-swipe fallback for Android/iOS browsers
- long pages now increase the real document height


## Mobile birthday audio fix
The birthday MP3 is still included.
This version explicitly unlocks/arms the audio during a user gesture so iPhone/Android browsers can play it after microphone-based candle blowing.


## Sound hard fix
- exact uploaded MP3 is embedded directly in index.html
- Web Audio API is unlocked on a real user tap
- MP3 is decoded before the candle moment
- playback no longer depends on delayed HTML audio autoplay
- previous mobile-audio race condition removed
- CSS/JS cache-busting enabled
- mobile scrolling/design left unchanged


## Personal page update
Replaced the old generic “What I hope 26 feels like” list with a more personal page:
- On hard days
- On beautiful days
- On ordinary days
- And always

The sound hard-fix and mobile scrolling remain unchanged.
