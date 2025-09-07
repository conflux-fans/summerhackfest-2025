import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',         // HTML in root
    './src/**/*.{ts,tsx,js,jsx}' // All source files
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      colors: {
        background: 'hsl(0, 0.0%, 100.0%)',
        foreground: 'hsl(0, 0%, 0%)',
        card: 'hsl(0, 0.0%, 100.0%)',
        'card-foreground': 'hsl(0, 0%, 0%)',
        popover: 'hsl(0, 0.0%, 100.0%)',
        'popover-foreground': 'hsl(0, 0%, 0%)',
        primary: 'hsl(0, 0.0%, 0.0%)',
        'primary-foreground': 'hsl(0, 0%, 100%)',
        secondary: 'hsl(0, 0.0%, 0.0%)',
        'secondary-foreground': 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0.0%, 0.0%)',
        'accent-foreground': 'hsl(0, 0%, 100%)',
        destructive: 'hsl(0, 0.0%, 100.0%)',
        'destructive-foreground': 'hsl(0, 0%, 0%)',
        border: 'hsla(0, 4.3%, 89.5%, 0.5501306560308074)',
        input: 'hsl(0, 0.0%, 0.0%)',
        ring: 'hsl(0, 0.0%, 100.0%)',
        muted: 'hsl(261, 54.3%, 20.6%)',
        'muted-foreground': 'hsl(0, 0%, 100%)',
        'site-background': 'hsl(0, 0.0%, 100.0%)',
        'site-foreground': 'hsl(0, 0%, 0%)',
      },
      fontFamily: {
        custom: ['Poppins', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: '2.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
            },
            h4: {
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            },
            h5: {
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            },
            h6: {
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            },
            p: {
              fontSize: '1rem',
              lineHeight: '1.5',
              marginBottom: '1rem',
            },
            a: {
              color: 'hsl(240 4.8% 45%)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            blockquote: {
              fontStyle: 'italic',
              color: '#6b7280',
              borderLeft: '4px solid #d1d5db',
              paddingLeft: '1rem',
              margin: '1rem 0',
            },
            code: {
              fontFamily:
                'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '0.875rem',
              backgroundColor: '#f3f4f6',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
            },
            pre: {
              fontFamily:
                'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '0.875rem',
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5rem',
            },
            li: {
              marginBottom: '0.5rem',
            },
            hr: {
              borderColor: '#e5e7eb',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1rem',
            },
            thead: {
              borderBottom: '2px solid #e5e7eb',
            },
            tbody: {},
            tfoot: {},
            th: {
              padding: '0.75rem',
              textAlign: 'left',
              borderBottom: '2px solid #e5e7eb',
            },
            td: {
              padding: '0.75rem',
              borderBottom: '1px solid #e5e7eb',
            },
            caption: {
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem',
            },
            figure: {
              margin: '1rem 0',
            },
            figcaption: {
              fontSize: '0.875rem',
              color: '#6b7280',
              textAlign: 'center',
              marginTop: '0.5rem',
            },
            strong: {
              fontWeight: '700',
            },
            em: {
              fontStyle: 'italic',
            },
            small: {
              fontSize: '0.875rem',
            },
            dl: {
              marginBottom: '1rem',
            },
            dt: {
              fontWeight: '700',
              marginBottom: '0.25rem',
            },
            dd: {
              marginLeft: '1.5rem',
              marginBottom: '0.5rem',
            },
            q: {
              quotes: '"\\201C" "\\201D" "\\2018" "\\2019"',
              fontStyle: 'italic',
            },
            abbr: {
              borderBottom: '1px dotted #6b7280',
              cursor: 'help',
            },
            cite: {
              fontStyle: 'italic',
            },
            mark: {
              backgroundColor: '#fef08a',
              color: '#000',
            },
            sub: {
              verticalAlign: 'sub',
              fontSize: '0.875rem',
            },
            sup: {
              verticalAlign: 'super',
              fontSize: '0.875rem',
            },
            address: {
              fontStyle: 'normal',
              lineHeight: '1.5',
              color: '#6b7280',
              marginBottom: '1rem',
            },
            var: {
              fontStyle: 'italic',
            },
            samp: {
              fontFamily:
                'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
            kbd: {
              fontFamily:
                'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              padding: '0.2rem 0.4rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.25rem',
              backgroundColor: '#f3f4f6',
            },
          },
        },
      },
    },
  },
};

export default config;
