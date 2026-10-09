export function fieldError(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  if (input.required && !input.value.trim()) return 'Este campo é obrigatório.';
  const validity = input.validity;
  if (validity.badInput) return 'Informe um número válido.';
  if (validity.typeMismatch) return 'Informe um e-mail válido.';
  if (validity.patternMismatch) return 'Use o formato min:seg, como 6:30.';
  if (validity.rangeUnderflow) return `Informe um valor maior ou igual a ${(input as HTMLInputElement).min}.`;
  if (validity.rangeOverflow) return input.type === 'date' ? 'Informe uma data até hoje.' : `Informe um valor menor ou igual a ${(input as HTMLInputElement).max}.`;
  if (validity.stepMismatch) return 'Confira o valor informado.';
  return '';
}

export function formErrors(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of form.querySelectorAll<HTMLInputElement>('input,select,textarea')) {
    const error = fieldError(field);
    if (error) errors[field.name] = error;
  }
  if (Object.keys(errors).length) form.querySelector<HTMLElement>('[name="' + Object.keys(errors)[0] + '"]')?.focus();
  return errors;
}
