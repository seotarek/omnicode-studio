<?php

declare(strict_types=1);

namespace Omnicode\Security;

/**
 * Strict CSS & SVG Color Validator and Sanitizer in Pure PHP.
 * 
 * Enforces strict whitelists against:
 * - Hex colors: #rgb, #rgba, #rrggbb, #rrggbbaa
 * - Functional notations: rgb(), rgba(), hsl(), hsla()
 * - Standard safe CSS named colors (transparent, currentColor, inherit, black, white, etc.)
 * 
 * Neutralizes any attempted SVG attribute breakout, control characters, quotes, or script tags.
 */
class ColorSanitizer
{
    private const SAFE_HEX_REGEX = '/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/';
    private const SAFE_RGB_REGEX = '/^rgba?\(\s*([0-9]{1,3}%?\s*,\s*){2}[0-9]{1,3}%?\s*(,\s*(0|1|0?\.[0-9]+)%?)?\s*\)$/i';
    private const SAFE_HSL_REGEX = '/^hsla?\(\s*[0-9]{1,3}(deg)?\s*,\s*[0-9]{1,3}%\s*,\s*[0-9]{1,3}%\s*(,\s*(0|1|0?\.[0-9]+)%?)?\s*\)$/i';

    private const SAFE_NAMED_COLORS = [
        'transparent', 'currentcolor', 'inherit',
        'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
        'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
        'orange', 'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige',
        'bisque', 'blanchedalmond', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
        'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson',
        'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
        'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
        'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
        'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
        'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite',
        'forestgreen', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'greenyellow',
        'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki',
        'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
        'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen',
        'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue',
        'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'limegreen',
        'linen', 'magenta', 'mediumaquamarine', 'mediumblue', 'mediumorchid',
        'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen',
        'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose',
        'moccasin', 'navajowhite', 'oldlace', 'olivedrab', 'orangered', 'orchid',
        'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
        'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'rosybrown', 'royalblue',
        'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
        'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
        'steelblue', 'tan', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat',
        'whitesmoke', 'yellowgreen'
    ];

    private static ?array $namedColorsLookup = null;

    /**
     * Checks if a given color string is safe and valid CSS/SVG color.
     */
    public static function isValid(mixed $color): bool
    {
        if (!is_string($color)) {
            return false;
        }

        $trimmed = trim($color);
        if ($trimmed === '') {
            return false;
        }

        if (preg_match(self::SAFE_HEX_REGEX, $trimmed) === 1) {
            return true;
        }

        if (preg_match(self::SAFE_RGB_REGEX, $trimmed) === 1) {
            return true;
        }

        if (preg_match(self::SAFE_HSL_REGEX, $trimmed) === 1) {
            return true;
        }

        if (self::$namedColorsLookup === null) {
            self::$namedColorsLookup = array_fill_keys(self::SAFE_NAMED_COLORS, true);
        }

        return isset(self::$namedColorsLookup[strtolower($trimmed)]);
    }

    /**
     * Sanitizes a color input, returning default fallback if invalid or unsafe.
     */
    public static function sanitize(?string $color, string $default = '#000000'): string
    {
        if ($color !== null && self::isValid($color)) {
            return trim($color);
        }
        return $default;
    }
}
