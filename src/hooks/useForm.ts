import { useState } from "react";

// Define the types for form field properties
type FormField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validation?: (value: string) => string | null; // Function to validate the field, returning an error message or null
};

type FormState = {
  [key: string]: string;
};

type ErrorState = {
  [key: string]: string | null;
};

// Custom Hook to handle form state, errors, and loading state
const useForm = (fields: FormField[]) => {
  const [formData, setFormData] = useState<FormState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field on change
    const field = fields.find((field) => field.name === name);
    if (field?.validation) {
      const error = field.validation(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (onSubmit: (data: FormState) => Promise<void>) => {
    if (loading) return;
    // Basic validation before submission
    const newErrors: ErrorState = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.validation) {
        const error = field.validation(formData[field.name] || "");
        if (error) newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
};

export default useForm;