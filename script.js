const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyMkhT1DbhW6kAXhwct333tS-KA5-9uUSNscv6Y7Ht8B82fZSKDUp0_QXJg4Cd2BeGhA/exec';

const leadForm = document.querySelector('.lead-form');
const formMessage = document.querySelector('.form-message');
const submitButton = document.querySelector('.form-submit');
const defaultSubmitText = submitButton ? submitButton.textContent : 'Отправить заявку';
const requiredFields = ['name', 'project', 'request_type', 'task', 'contact'];
const errorText =
  'Не удалось отправить заявку. Пожалуйста, напишите нам напрямую в Telegram или попробуйте позже.';
const successText =
  'Спасибо! Данные успешно отправлены. Мы скоро с вами свяжемся, чтобы уточнить задачу.';

document.querySelectorAll('a[href="#lead-form"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    document.querySelector('#lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function showMessage(type, text) {
  if (!formMessage) return;

  formMessage.textContent = text;
  formMessage.className = `form-message is-visible is-${type}`;
  formMessage.setAttribute('tabindex', '-1');
  formMessage.focus({ preventScroll: true });
}

function clearMessage() {
  if (!formMessage) return;

  formMessage.textContent = '';
  formMessage.className = 'form-message';
}

function setLoading(isLoading) {
  if (!submitButton) return;

  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Отправляем...' : defaultSubmitText;
}

function setFieldError(field, message) {
  const label = field.closest('label');
  const error = label?.querySelector('.field-error');

  label?.classList.toggle('is-invalid', Boolean(message));
  if (error) {
    error.textContent = message;
  }
}

function clearFieldErrors(form) {
  form.querySelectorAll('input, select, textarea').forEach((field) => setFieldError(field, ''));
}

function validateForm(form) {
  let isValid = true;

  requiredFields.forEach((fieldName) => {
    const field = form.elements[fieldName];
    if (!field || !field.value.trim()) {
      setFieldError(field, 'Заполните это поле.');
      isValid = false;
    }
  });

  return isValid;
}

function collectFormData(form) {
  const formData = new FormData(form);
  const payload = {};

  formData.forEach((value, key) => {
    payload[key] = typeof value === 'string' ? value.trim() : value;
  });

  return payload;
}

leadForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  clearMessage();
  clearFieldErrors(form);

  const payload = collectFormData(form);

  if (payload.website) {
    form.reset();
    return;
  }

  if (!validateForm(form)) {
    showMessage('error', 'Пожалуйста, заполните обязательные поля.');
    return;
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_GOOGLE_APPS_SCRIPT')) {
    showMessage('error', errorText);
    return;
  }

  setLoading(true);

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    form.reset();
    clearFieldErrors(form);
    showMessage('success', successText);
    formMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    console.error('Lead form submit failed:', error);
    showMessage('error', errorText);
  } finally {
    setLoading(false);
  }
});
