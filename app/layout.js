import './globals.css';

export const metadata = {
  title: 'Hecta | Corretaje de propiedades',
  description: 'Compra, publica y vende propiedades con respaldo profesional.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
