export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-indigo-600"
    >
      <div className="text-center text-white">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
        <p className="text-indigo-200 mt-2 text-sm">Building better days, one habit at a time</p>
        <div className="mt-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
