export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">API for Anything</h1>
          <p className="mt-1 text-sm text-gray-400">
            Turn any website into an API
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
