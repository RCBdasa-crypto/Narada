import { getAttachmentUrl } from '../api';
import { displayFileName, isImageAttachment } from '../utils/helpers';
import './AttachmentLink.css';

export default function AttachmentLink({ todoId, attachment, className, children, onClick, ...rest }) {
  const fileName = displayFileName(attachment.original_name);

  return (
    <a
      href={getAttachmentUrl(todoId, attachment.id)}
      target="_blank"
      rel="noopener noreferrer"
      className={`attachment-link ${className || ''}`}
      title={`Открыть: ${fileName}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  );
}

export function AttachmentFileLabel({ attachment }) {
  return <>📎 {displayFileName(attachment.original_name)}</>;
}

export function isImageForPreview(attachment) {
  return isImageAttachment(attachment);
}
