import { FONT_FAMILIES } from '../utils/helpers';
import './StyleControls.css';

export default function StyleControls({ label, style, onChange }) {
  const value = style || {};

  function patch(fields) {
    onChange({ ...value, ...fields });
  }

  return (
    <div className="style-controls">
      <span className="style-label">{label}</span>
      <div className="style-row">
        <select
          value={value.fontFamily || FONT_FAMILIES[0]}
          onChange={(e) => patch({ fontFamily: e.target.value })}
          aria-label={`Шрифт: ${label}`}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f.split(',')[0]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="10"
          max="48"
          value={value.fontSize || 16}
          onChange={(e) => patch({ fontSize: Number(e.target.value) })}
          aria-label={`Размер: ${label}`}
        />
        <input
          type="color"
          value={value.color || '#111827'}
          onChange={(e) => patch({ color: e.target.value })}
          aria-label={`Цвет: ${label}`}
        />
      </div>
    </div>
  );
}
