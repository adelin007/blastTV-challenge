export const MAP_NAME_TO_IMAGE_URL: Record<string, string> = {
  de_nuke:
    "https://static.csstats.gg/images/maps/screenshots/cs2/de_nuke_1_png.jpg",
  de_dust2:
    "https://static.csstats.gg/images/maps/screenshots/cs2/de_dust2_2_png.jpg",
  de_mirage:
    "https://static.csstats.gg/images/maps/screenshots/cs2/de_mirage_1_png.jpg",
  de_overpass:
    "https://static.csstats.gg/images/maps/screenshots/cs2/de_overpass_2_png.jpg",
  de_vertigo:
    "https://static.csstats.gg/images/maps/screenshots/cs2/de_vertigo_2_png.jpg",
};

export function getMapImageUrl(mapName: string): string | null {
  return MAP_NAME_TO_IMAGE_URL[mapName.toLowerCase()] ?? null;
}
