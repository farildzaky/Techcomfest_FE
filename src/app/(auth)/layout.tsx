export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}