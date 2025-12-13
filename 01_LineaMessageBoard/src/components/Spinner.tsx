export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin"
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        border: "2px solid #fff",
        borderTopColor: "transparent",
      }}
    />
  );
}
