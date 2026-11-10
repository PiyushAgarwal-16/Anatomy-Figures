# Philips 61013 — first-draft Figure

One folding desk lamp: the base hinge changes reach, the head hinge aims the light, and the switch controls the diffuser and desk illumination together.

Reference: Philips/Signify decorative lighting catalogue (2023), 61013 Breeze white / AIR black; nominal 270 × 135 × 370 mm, 5 W, 250 lm, 6500 K. Manufacturer hinge-stop angles were not located. This is an illustrative approximation, not dimensional CAD. No swivel axis is invented.

Parts, before geometry (50+):
- Base: four rubber feet, lower shell, seam band, upper shell, four screw recesses, four screw heads, hinge mounting block, switch bezel, rocker, two switch marks.
- Arm: back shell, seam, front shell, lower hinge barrel, two lower washers, two lower caps, lower axle recess, upper hinge barrel, two upper washers, two upper caps, upper axle recess.
- Head: lower bezel, upper shell, perimeter seam, diffuser, twenty LED cells beneath the diffuser, two end caps.

World: mm-like units, x along the lamp's reach, y across its width, z up. Fixed isometric view. Both hinges rotate in the x/z plane. The head normal also determines the centre of the light on the desktop. SVG-only soft illumination for the small first draft; no dependencies or network required in the deliverable.

Scope: dark theme, switch, two independent hinges, direct dragging, keyboard-accessible controls, reset, responsive layout. Full manufacturing geometry and extended polish deferred by request.

## Range and lighting revision
User-specified travel: head opening 0–180° (folded to extended), arm elevation 5–100°. Head hinge is aligned with the arm centreline. The head has an open rear channel, 22 units wide, around the 20-unit arm; its channel floor clears the arm by 0.5 units when folded. A desk-clearance stop raises the arm as necessary for head angles that would otherwise intersect the desktop. Reset is 100° arm / 75° head opening (−5° absolute pitch).

Lighting now includes a luminous diffuser edge, bloom, seven feathered world-space beam sheets, and a stronger desk pool. All effects share the eased power value, point along the head normal, and vanish when off. Beam sheets stop at the desk and fade near the illustration boundary. The illustration remains a standalone SVG-based first draft.

Verification: model execution and render inspection for on/off, upright, fully folded, nearly horizontal, and exposed diffuser; 25 requested angle combinations checked for finite paths and viewport bounds. Browser automation remains unavailable in this environment; no live-browser pass is claimed.

Folded alignment revision: removed the outward hinge offset; the folded arm now runs through the middle of the head. Added a regression check equating a folded head centre point to the corresponding arm centreline point.


## Closed-shell correction
Replaced the two open side cheeks with one closed head housing. The arm meets the centre of the diffuser face across its width when folded, with 0.5 units of clearance. The head housing is offset within the shared hinge frame; the hinge itself stays on the arm centreline. Removed individual internal LED cells, which belong behind the continuous frosted diffuser.

SVG surfaces now resolve their order from depth at the actual overlap polygon, rather than an arbitrary arm/head layer switch. This prevents the stem, hinge caps, and head faces from painting through one another as the angle changes. Verified the 15°, 35°, and 105° head openings shown in the user's screenshots, alongside the fully folded and extended poses.
