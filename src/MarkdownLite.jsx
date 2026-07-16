function parseInline(text, keyPrefix) {
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/;
  const parts = [];
  let remaining = text;
  let key = 0;
  while (remaining.length) {
    const m = remaining.match(regex);
    if (!m) {
      parts.push(remaining);
      break;
    }
    if (m.index > 0) parts.push(remaining.slice(0, m.index));
    if (m[2] !== undefined) parts.push(<strong key={`${keyPrefix}-${key++}`}>{m[2]}</strong>);
    else if (m[3] !== undefined)
      parts.push(
        <code key={`${keyPrefix}-${key++}`} style={{ background: "rgba(255,255,255,0.08)", padding: "1px 4px", borderRadius: 4, fontSize: "0.92em" }}>
          {m[3]}
        </code>
      );
    else if (m[4] !== undefined) parts.push(<em key={`${keyPrefix}-${key++}`}>{m[4]}</em>);
    else if (m[5] !== undefined) parts.push(<em key={`${keyPrefix}-${key++}`}>{m[5]}</em>);
    remaining = remaining.slice(m.index + m[0].length);
  }
  return parts;
}

function esFilaTabla(line) {
  return /^\s*\|.+\|\s*$/.test(line);
}

function esSeparadorTabla(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function celdasDeFila(line) {
  let l = line.trim();
  if (l.startsWith("|")) l = l.slice(1);
  if (l.endsWith("|")) l = l.slice(0, -1);
  return l.split("|").map((c) => c.trim());
}

function Tabla({ header, filas, keyBase }) {
  return (
    <div style={{ overflowX: "auto", margin: "6px 0 10px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11.5 }}>
        {header && (
          <thead>
            <tr>
              {header.map((h, hi) => (
                <th key={hi} style={{ textAlign: "left", padding: "5px 10px", borderBottom: "1px solid rgba(255,255,255,0.18)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {parseInline(h, `${keyBase}-h-${hi}`)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {filas.map((f, fi) => (
            <tr key={fi} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {f.map((c, ci) => (
                <td key={ci} style={{ padding: "5px 10px", whiteSpace: "nowrap" }}>
                  {parseInline(c, `${keyBase}-${fi}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownLite({ text }) {
  const lines = (text || "").split("\n");
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (esFilaTabla(line)) {
      const filasCrudas = [];
      while (i < lines.length && esFilaTabla(lines[i])) {
        filasCrudas.push({ celdas: celdasDeFila(lines[i]), esSeparador: esSeparadorTabla(lines[i]) });
        i++;
      }
      let header = null;
      let filas = filasCrudas.map((f) => f.celdas);
      if (filasCrudas.length >= 2) {
        header = filasCrudas[0].celdas;
        filas = filasCrudas[1].esSeparador ? filasCrudas.slice(2).map((f) => f.celdas) : filasCrudas.slice(1).map((f) => f.celdas);
      }
      blocks.push(<Tabla key={key} header={header} filas={filas} keyBase={key} />);
      key++;
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const nivel = line.match(/^#+/)[0].length;
      const texto = line.replace(/^#{1,3}\s+/, "");
      const tam = nivel === 1 ? 14 : nivel === 2 ? 13 : 12.5;
      blocks.push(
        <div key={key} style={{ fontSize: tam, fontWeight: 700, margin: "8px 0 4px" }}>
          {parseInline(texto, key++)}
        </div>
      );
      i++;
      continue;
    }

    if (/^(-|\*)\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^(-|\*)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^(-|\*)\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key} style={{ margin: "4px 0 8px", paddingLeft: 18 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: 2 }}>
              {parseInline(it, `${key}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      key++;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key} style={{ margin: "4px 0 8px", paddingLeft: 18 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: 2 }}>
              {parseInline(it, `${key}-${idx}`)}
            </li>
          ))}
        </ol>
      );
      key++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(-|\*)\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) && !/^#{1,3}\s+/.test(lines[i]) && !esFilaTabla(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <div key={key} style={{ margin: "0 0 8px" }}>
        {parseInline(paraLines.join(" "), key++)}
      </div>
    );
  }

  return <>{blocks}</>;
}
