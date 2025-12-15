export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
      style={{ width: size, height: size }}
    />
  );
}
