# Contact source artwork

This directory retains generated source artwork and historical Contact variants
outside the deployed `public/` tree. The live scene uses only the trimmed,
runtime-ready layers in `public/assets/contact`.

Run `node scripts/trim-contact-assets.mjs` after deliberately updating a
current source asset. The script trims the current aurora, moon, and plain;
then splits the current landing-pad source into the rear and front runtime
layers around the documented shared canvas origin.
