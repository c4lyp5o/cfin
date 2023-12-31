import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'C-FIN',
  description: 'C-FIN Media Server',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`h-full bg-white ${inter.className}`}>
      <body className={`h-full ${inter.className}`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
