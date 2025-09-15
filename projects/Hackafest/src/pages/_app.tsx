import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/styles/critical.css"
          as="style"
          onLoad={() => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/critical.css';
            document.head.appendChild(link);
          }}
        />
        {/* Fallback for browsers that don't support preload */}
        <noscript>
          <link rel="stylesheet" href="/styles/critical.css" />
        </noscript>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}