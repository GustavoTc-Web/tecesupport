import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import api from "../api/api";
import { getApiErrorMessage } from "../api/errors";
import FormFeedback from "./FormFeedback";
import UiIcon from "./UiIcon";

type ChangePasswordModalProps = {
  onClose: () => void;
};

type PasswordForm = {
  confirm_password: string;
  current_password: string;
  new_password: string;
};

const emptyForm: PasswordForm = {
  confirm_password: "",
  current_password: "",
  new_password: "",
};

export default function ChangePasswordModal({
  onClose,
}: ChangePasswordModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<PasswordForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements.item(0);
        const lastElement = focusableElements.item(
          focusableElements.length - 1,
        );

        if (
          event.shiftKey &&
          document.activeElement === firstElement &&
          lastElement
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement &&
          firstElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (feedback) {
      setFeedback(null);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await api.post("/users/change-password/", form);
      setForm(emptyForm);
      setFeedback({
        type: "success",
        message: response.data?.detail ?? "Senha alterada com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível alterar a senha. Revise os dados e tente novamente.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      className="profile-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <div className="profile-modal-header">
          <div>
            <span className="section-kicker">Segurança</span>
            <h2 id="change-password-title">Alterar senha</h2>
            <p>Confirme sua senha atual antes de definir uma nova.</p>
          </div>
          <button
            type="button"
            className="profile-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar alteração de senha"
          >
            <UiIcon name="x" />
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="profile-field">
            <span>Senha atual</span>
            <span className="profile-input-shell">
              <UiIcon name="lock" />
              <input
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-describedby={
                  feedback?.type === "error"
                    ? "change-password-feedback"
                    : undefined
                }
                autoFocus
                required
              />
            </span>
          </label>

          <label className="profile-field">
            <span>Nova senha</span>
            <span className="profile-input-shell">
              <UiIcon name="key" />
              <input
                type="password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-describedby={
                  feedback?.type === "error"
                    ? "change-password-feedback"
                    : undefined
                }
                required
              />
            </span>
          </label>

          <label className="profile-field">
            <span>Confirmar nova senha</span>
            <span className="profile-input-shell">
              <UiIcon name="check-circle" />
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-describedby={
                  feedback?.type === "error"
                    ? "change-password-feedback"
                    : undefined
                }
                required
              />
            </span>
          </label>

          {feedback && (
            <FormFeedback
              id="change-password-feedback"
              type={feedback.type}
              message={feedback.message}
            />
          )}

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-button profile-button--secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="profile-button profile-button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="login-spinner" aria-hidden="true" />
              )}
              {isSubmitting ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
