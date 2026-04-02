interface InfoBoxProps {
  title: string;
  message: string;
}

export function InfoBox({ title, message }: InfoBoxProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl px-4 py-3">
      <p className="text-vinculo-dark font-semibold text-sm mb-1">{title}</p>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}
