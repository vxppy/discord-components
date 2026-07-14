export default function parseHex(color: string) {
    if (color.startsWith('#')) color = color.slice(1);

    if (color.length == 3) {
        color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
    } else if (color.length != 6) {
        return 0;
    }

    const num = parseInt(color, 16);

    return isNaN(num) ? 0 : num;
}
