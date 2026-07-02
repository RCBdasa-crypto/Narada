import { EMOJI_LIST } from '../utils/helpers';
import './EmojiPicker.css';

export default function EmojiPicker({ onPick }) {
  return (
    <div className="emoji-picker">
      <span className="emoji-picker-label">Эмодзи</span>
      <div className="emoji-grid">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="emoji-btn"
            onClick={() => onPick(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
