import { useState } from "react";

// Requires the admin to type the exact expected value (e.g. a car plate or a
// user's phone number) before the delete button becomes clickable. This
// exists specifically to prevent accidental deletes from a stray click on a
// destructive admin action.
const ConfirmDeleteModal = ({ title, description, expectedValue, confirmLabel, onCancel, onConfirm, disabled }) => {
    const [typed, setTyped] = useState("");

    const matches = typed.trim() === String(expectedValue).trim();

    const handleConfirm = () => {
        if (!matches) return;
        onConfirm();
    };

    return (
        <div className="slot-modal__backdrop">
            <div className="slot-modal__content">
                <h3 className="slot-modal__title">{title}</h3>
                <p className="slot-modal__section">{description}</p>

                <div className="field-group">
                    <label htmlFor="confirm-delete-input" className="field-label">
                        اكتب <strong>{expectedValue}</strong> للتأكيد
                    </label>
                    <input
                        id="confirm-delete-input"
                        type="text"
                        className="input"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        disabled={disabled}
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                <div className="slot-actions">
                    <button
                        type="button"
                        className="btn btn--danger"
                        onClick={handleConfirm}
                        disabled={disabled || !matches}
                    >
                        {confirmLabel}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={disabled}>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
