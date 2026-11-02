/**
 * Strict CSS / SVG color validator & sanitizer.
 * Accepts:
 * - Hex colors: #rgb, #rgba, #rrggbb, #rrggbbaa
 * - rgb/rgba: rgb(r, g, b), rgba(r, g, b, a), rgb(r g b / a)
 * - hsl/hsla: hsl(h, s, l), hsla(h, s, l, a)
 * - Safe named CSS colors (e.g. white, black, transparent, currentColor, etc.)
 * Rejects any string containing quotes, HTML tags, JavaScript, or unexpected characters.
 */

const SAFE_HEX_REGEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_RGB_REGEX = /^rgba?\(\s*([0-9]{1,3}%?\s*,\s*){2}[0-9]{1,3}%?\s*(,\s*(0|1|0?\.[0-9]+)%?)?\s*\)$/i;
const SAFE_HSL_REGEX = /^hsla?\(\s*[0-9]{1,3}(deg)?\s*,\s*[0-9]{1,3}%\s*,\s*[0-9]{1,3}%\s*(,\s*(0|1|0?\.[0-9]+)%?)?\s*\)$/i;

const SAFE_NAMED_COLORS = new Set([
  "transparent", "currentcolor", "inherit",
  "black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia",
  "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua",
  "orange", "aliceblue", "antiquewhite", "aquamarine", "azure", "beige",
  "bisque", "blanchedalmond", "blueviolet", "brown", "burlywood", "cadetblue",
  "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson",
  "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen",
  "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange",
  "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue",
  "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink",
  "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite",
  "forestgreen", "gainsboro", "ghostwhite", "gold", "goldenrod", "greenyellow",
  "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki",
  "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
  "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen",
  "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
  "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "limegreen",
  "linen", "magenta", "mediumaquamarine", "mediumblue", "mediumorchid",
  "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen",
  "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose",
  "moccasin", "navajowhite", "oldlace", "olivedrab", "orangered", "orchid",
  "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip",
  "peachpuff", "peru", "pink", "plum", "powderblue", "rosybrown", "royalblue",
  "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna",
  "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen",
  "steelblue", "tan", "thistle", "tomato", "turquoise", "violet", "wheat",
  "whitesmoke", "yellowgreen"
]);

export function isValidColor(color: string | undefined): boolean {
  if (!color || typeof color !== "string") return false;
  const trimmed = color.trim();
  if (SAFE_HEX_REGEX.test(trimmed)) return true;
  if (SAFE_RGB_REGEX.test(trimmed)) return true;
  if (SAFE_HSL_REGEX.test(trimmed)) return true;
  if (SAFE_NAMED_COLORS.has(trimmed.toLowerCase())) return true;
  return false;
}

export function sanitizeColor(color: string | undefined, defaultColor: string = "#000000"): string {
  if (isValidColor(color)) {
    return (color as string).trim();
  }
  return defaultColor;
}
