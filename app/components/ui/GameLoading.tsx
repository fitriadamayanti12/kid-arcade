// app/components/ui/GameLoading.tsx
export default function GameLoading({ text = 'Memuat game...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🎮</div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>
        <div className="mt-4 flex justify-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );
}