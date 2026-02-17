interface UnicodeTextProps {
  text: string;
  className?: string;
}

export default function UnicodeText({ text, className = '' }: UnicodeTextProps) {
  return (
    <span className={`whitespace-pre-wrap break-words ${className}`} style={{ fontFamily: 'system-ui, sans-serif' }}>
      {text}
    </span>
  );
}
