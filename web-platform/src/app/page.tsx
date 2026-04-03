import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8 text-center">
        <h1 className="text-4xl font-bold">Multi-User Browser Desktop Platform</h1>
        <p className="text-xl text-gray-600">Secure, isolated Linux environments in your browser.</p>
        <Link 
          href="/dashboard" 
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-all shadow-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
