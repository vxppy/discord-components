import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import defineConfig from '11ty.ts';
import { readFileSync } from 'fs';

const theme = JSON.parse(
    readFileSync('themes/Espresso-color-theme.json', 'utf8'),
);

export default defineConfig(async (config) => {
    config.addPassthroughCopy('src/css');
    config.addPassthroughCopy('src/fonts');
    config.addWatchTarget('src/css');

    const markdownIt = MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });

    markdownIt.use(
        await Shiki({
            themes: {
                light: 'github-light',
                dark: theme,
            },
            defaultColor: false,
        }),
    );

    config.setLibrary('md', markdownIt);

    config.setLiquidOptions({
        jsTruthy: true,
        dynamicPartials: false,
        strictFilters: true,
    });

    config.addGlobalData('siteName', '@vxppy/discord-components');

    config.addFilter('markdown', (value: string) => markdownIt.render(value));

    return {
        pathPrefix: '/discord-components/',
        dir: {
            input: 'src',
            output: '_site',
        },
    };
});
