import type {
  ChangeEvent,
  HTMLInputTypeAttribute,
} from "react";


interface FormFieldProps {
  label: string;
  name: string;
  value: string;

  onChange: (
    event:
      ChangeEvent<
        HTMLInputElement |
        HTMLTextAreaElement
      >
  ) => void;

  type?:
    | HTMLInputTypeAttribute
    | "textarea";

  placeholder?: string;

  required?: boolean;

  rows?: number;
}


function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  rows = 3,
}: FormFieldProps) {

  return (
    <div className="form-group">

      <label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            *
          </span>
        )}
      </label>


      {type === "textarea" ? (

        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
        />

      ) : (

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />

      )}

    </div>
  );
}


export default FormField;