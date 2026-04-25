export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'window.location.href = "/login";' }} />
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen">
        <p className="text-gray-400 text-sm">Redirecting to login...</p>
      </div>
    </>
  );
}
