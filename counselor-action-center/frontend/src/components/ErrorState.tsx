interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xl font-bold">
        !
      </div>
      <div className="text-center max-w-sm">
        <p className="text-sm font-semibold text-gray-800">Something went wrong</p>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  );
}
