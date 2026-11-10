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
User-specified travel: head opening 0–180° (folded to extended), arm elevation 5–100°. Head hinge is offset 14 units from the arm centreline so the folded shells meet without occupying the same space. A desk-clearance stop raises the arm as necessary for head angles that would otherwise intersect the desktop. Reset is 100° arm / 75° head opening (−5° absolute pitch).

Lighting now includes a luminous diffuser edge, bloom, seven feathered world-space beam sheets, and a stronger desk pool. All effects share the eased power value, point along the head normal, and vanish when off. Beam sheets stop at the desk and fade near the illustration boundary. The illustration remains a standalone SVG-based first draft.

Verification: model execution and render inspection for on/off, upright, fully folded, nearly horizontal, and exposed diffuser; 25 requested angle combinations checked for finite paths and viewport bounds. Browser automation remains unavailable in this environment; no live-browser pass is claimed.
