export default function PageShell({ children, className = "" }) {
  return (
    <div className={`dotted-bg min-h-screen w-full flex items-center justify-center p-4 ${className}`}>
      {children}
    </div>
  );
}
