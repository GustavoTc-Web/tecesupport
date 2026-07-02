import UiIcon from "./UiIcon";

type FormFeedbackProps = {
  id?: string;
  message: string;
  type: "error" | "success";
};

export default function FormFeedback({
  id,
  message,
  type,
}: FormFeedbackProps) {
  return (
    <div
      id={id}
      className={`form-feedback form-feedback--${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <UiIcon name={type === "error" ? "alert-circle" : "check-circle"} />
      <span>{message}</span>
    </div>
  );
}
