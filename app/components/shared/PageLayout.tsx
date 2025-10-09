import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}