/**
 * Minimal YAML syntax highlighter. Not parser-correct — just enough to make
 * code samples readable. Picks out comments, keys, and values per line.
 */
export function YamlBlock({ source }: { source: string }) {
  return (
    <pre className="yaml-block">
      {source.split('\n').map((line, i) => (
        <HighlightedLine key={i} line={line} />
      ))}
    </pre>
  );
}

function HighlightedLine({ line }: { line: string }) {
  const comment = line.match(/^(\s*)(#.*)$/);
  if (comment) {
    return (
      <div>
        <span>{comment[1]}</span>
        <span className="yc">{comment[2]}</span>
      </div>
    );
  }

  const kv = line.match(/^(\s*-?\s*)([a-zA-Z][a-zA-Z0-9_.-]*)(:)(.*)$/);
  if (kv) {
    return (
      <div>
        <span>{kv[1]}</span>
        <span className="yk">{kv[2]}</span>
        <span>{kv[3]}</span>
        <span className="yv">{kv[4]}</span>
      </div>
    );
  }

  return <div>{line}</div>;
}
