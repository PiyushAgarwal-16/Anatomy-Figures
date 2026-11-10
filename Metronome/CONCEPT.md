# Mechanical metronome — Figure first draft

A spring-driven, open-front pyramid metronome on a small wooden plinth. Its pendulum swings left and right; moving the upper weight upward slows the beat. Start at 120 BPM, two beats per complete swing, with one shared model for the weight position and the clock.

Scope: one SVG mechanism, light theme, standalone HTML, no libraries or network requests at runtime. Drag the weight, use arrow keys, pause, reset to 120, and optionally hear the beat. No exploded view, shader, or extended polishing pass.

Model: ideal small-angle compound pendulum, fixed lower mass 60 g at 30 mm, sliding mass 14 g, fixed moment of inertia 0.000060 kg·m². BPM = (60/π)√(g(Ma−mr)/(I₀+mr²)); the escapement is represented by a sustained swing. Range 40–208 BPM. Not a calibration of a specific manufactured metronome. Conventional setting behavior and range: [Wittner manual](https://wittner-gmbh.de/mobil/wittner-metronome-maelzel-instruction-manual.html).

Parts, grouped (60+ purposeful pieces):
- Plinth: four rubber feet, four foot washers, bottom bead, wooden slab, top bevel, four countersunk mounting screws.
- Body: four mounting shoes, bottom molding, lower case, back board, left tapered cheek, right tapered cheek, upper cap, inner left liner, inner right liner, scale board, left ruler rail, right ruler rail, four scale screws, two front retaining clips.
- Movement: lower movement plate, two bearing supports, spring barrel, barrel cover, barrel arbor, two plate screws, pivot shaft, pivot collar, pivot washer, slotted pivot screw, two escapement pallets.
- Pendulum: steel rod, upper end cap, lower fixed bob, bob front plate, two bob screws, sliding weight body, rear sleeve, front bevel plate, thumb screw, thumb screw collar, grip grooves.
- Winder: side boss, key shaft, key shoulder, bow and central slot.

World: mm-like units, z up, plinth 170 × 116, body height 235, pendulum pivot z=110, front plane y=24, camera azimuth 66°, elevation 23°. Draw the mechanism in front of the scale; the winding key sits on the visible side.
