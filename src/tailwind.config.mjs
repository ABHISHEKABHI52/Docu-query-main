/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.25', letterSpacing: '0.02em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.35', letterSpacing: '0.015em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0.005em', fontWeight: '500' }],
                xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '600' }],
                '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '700' }],
                '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
                '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '800' }],
                '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
                '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '900' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '900' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '900' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '900' }],
            },
            fontFamily: {
                heading: "helvetica-w01-bold",
                paragraph: "helvetica-w01-roman"
            },
            colors: {
                softyellowaccent: '#FFF9B1',
                foreground: '#1E254E',
                destructive: '#DF3131',
                destructiveforeground: '#FFFFFF',
                background: '#F7F9FF',
                secondary: '#A59FE6',
                'secondary-foreground': '#1E254E',
                'primary-foreground': '#F7F9FF',
                primary: '#1E254E'
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
