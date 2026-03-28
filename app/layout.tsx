import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sentinel Private AI | Secure Document Intelligence',
  description: 'A secure, on-premise document chatbot. Upload PDFs and query them locally using AI. Your data never leaves your infrastructure.',
  keywords: ['document AI', 'private AI', 'RAG', 'PDF chatbot', 'local AI', 'privacy-first'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
