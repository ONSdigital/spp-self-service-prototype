/***********************************************************************************
Imports question manager, summary generator, answer piping and previous link history
************************************************************************************/
import '@ons/prototype-kit/src/helpers/index.js';

// SPP Self Service State Management
document.addEventListener('DOMContentLoaded', () => {
  const rootPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/views/'));

  // 1. Render dynamic statuses from sessionStorage on page load for general pages
  
  // Surveys Table
  document.querySelectorAll('[data-survey-id]').forEach(el => {
    const id = el.getAttribute('data-survey-id');
    const saved = sessionStorage.getItem(`survey-${id}`);
    if (saved) {
      const data = JSON.parse(saved);
      el.innerHTML = `<span class="ons-status ons-status--${data.variant}">${data.label}</span>`;
    }
  });

  // Tasks List
  document.querySelectorAll('[data-task-id]').forEach(el => {
    const id = el.getAttribute('data-task-id');
    const saved = sessionStorage.getItem(`task-${id}`);
    if (saved) {
      const data = JSON.parse(saved);
      el.innerHTML = `<span class="ons-status ons-status--${data.variant}">${data.label}</span>`;
    }
  });

  // Evaluate task link wrappers (making them plain text if locked or links if active/unlocked)
  const taskUrls = {
    'add-survey-forms': '/views/tasklist/addforms/uploadjson.html',
    'choose-reference-datasets': '/views/tasklist/refdata/selectrefdata.html',
    'add-constructed-questions-and-values': '#0',
    'define-validation-rules': '/views/tasklist/addrules/addvalidationrule.html',
    'choose-validation-methods': '#0',
    'configure-prioritisation-workflow-and-layout': '#0',
    'test-survey-setup': '#0',
    'get-methodology-approval': '#0'
  };

  const taskNames = {
    'add-survey-forms': 'Add survey forms',
    'choose-reference-datasets': 'Choose reference datasets',
    'add-constructed-questions-and-values': 'Add constructed questions and values',
    'define-validation-rules': 'Define validation rules',
    'choose-validation-methods': 'Choose validation methods',
    'configure-prioritisation-workflow-and-layout': 'Configure prioritisation workflow and layout',
    'test-survey-setup': 'Test survey set up',
    'get-methodology-approval': 'Get Methodology approval'
  };

  document.querySelectorAll('[data-task-link]').forEach(el => {
    const id = el.getAttribute('data-task-link');
    const savedStatus = sessionStorage.getItem(`task-${id}`);
    
    let label = '';
    if (savedStatus) {
      label = JSON.parse(savedStatus).label;
    } else {
      const statusSpan = document.querySelector(`[data-task-id="${id}"] .ons-status`);
      if (statusSpan) {
        label = statusSpan.textContent.trim();
      }
    }

    if (label === 'Cannot start yet') {
      el.innerHTML = taskNames[id];
    } else {
      let url = taskUrls[id];
      if (id === 'add-survey-forms' && label !== 'To do') {
        url = '/views/tasklist/addforms/formslist.html';
      }
      const fullUrl = url.startsWith('/') ? (rootPath + url) : url;
      el.innerHTML = `<a href="${fullUrl}">${taskNames[id]}</a>`;
    }
  });

  // Reference Data Table (Fallback status restorer for standard template loads)
  document.querySelectorAll('[data-refdata-id]').forEach(el => {
    const id = el.getAttribute('data-refdata-id');
    const saved = sessionStorage.getItem(`refdata-${id}`);
    if (saved) {
      const data = JSON.parse(saved);
      el.innerHTML = `<span class="ons-status ons-status--${data.variant}">${data.label}</span>`;
    }
  });

  // Reference Data Filenames (Fallback filename restorer for standard template loads)
  document.querySelectorAll('[data-refdata-file]').forEach(el => {
    const id = el.getAttribute('data-refdata-file');
    const filename = sessionStorage.getItem(`refdata-file-${id}`);
    if (filename) {
      el.textContent = filename;
    }
  });

  // 2. Attach click handlers to primary buttons to save state in sessionStorage

  // Add form data page: Save and continue
  const btnSaveFormData = document.getElementById('btn-save-form-data');
  if (btnSaveFormData) {
    btnSaveFormData.addEventListener('click', () => {
      sessionStorage.setItem('task-add-survey-forms', JSON.stringify({ label: 'Done', variant: 'success' }));
      sessionStorage.setItem('task-add-constructed-questions-and-values', JSON.stringify({ label: 'To do', variant: 'info' }));
      sessionStorage.setItem('task-define-validation-rules', JSON.stringify({ label: 'To do', variant: 'info' }));
    });
  }

  // Question metadata page: Save and continue
  const btnSaveQuestionMetadata = document.getElementById('btn-save-question-metadata');
  if (btnSaveQuestionMetadata) {
    btnSaveQuestionMetadata.addEventListener('click', () => {
      sessionStorage.setItem('task-add-survey-forms', JSON.stringify({ label: 'Done', variant: 'success' }));
      sessionStorage.setItem('task-add-constructed-questions-and-values', JSON.stringify({ label: 'To do', variant: 'info' }));
      sessionStorage.setItem('task-define-validation-rules', JSON.stringify({ label: 'To do', variant: 'info' }));
    });
  }

  // Return to task list button: Save state as In progress
  const btnReturnTaskList = document.getElementById('btn-return-task-list');
  if (btnReturnTaskList) {
    btnReturnTaskList.addEventListener('click', () => {
      sessionStorage.setItem('task-add-survey-forms', JSON.stringify({ label: 'In progress', variant: 'pending' }));
      sessionStorage.setItem('task-add-constructed-questions-and-values', JSON.stringify({ label: 'To do', variant: 'info' }));
      sessionStorage.setItem('task-define-validation-rules', JSON.stringify({ label: 'To do', variant: 'info' }));
    });
  }

  // Choose reference datasets page: Save and continue
  const btnSaveRefData = document.getElementById('btn-save-refdata');
  if (btnSaveRefData) {
    btnSaveRefData.addEventListener('click', () => {
      sessionStorage.setItem('task-choose-reference-datasets', JSON.stringify({ label: 'Completed', variant: 'success' }));
    });
  }

  // Upload survey period dates page: Save and continue
  const btnSavePeriodDates = document.getElementById('btn-save-period-dates');
  if (btnSavePeriodDates) {
    btnSavePeriodDates.addEventListener('click', () => {
      const fileInput = document.getElementById('period-dates-upload');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        sessionStorage.setItem('refdata-file-survey-period-dates', fileInput.files[0].name);
      }
      sessionStorage.setItem('refdata-survey-period-dates', JSON.stringify({ label: 'Done', variant: 'success' }));
    });
  }

  // Upload trading day weights page: Save and continue
  const btnSaveTradingWeights = document.getElementById('btn-save-trading-weights');
  if (btnSaveTradingWeights) {
    btnSaveTradingWeights.addEventListener('click', () => {
      const fileInput = document.getElementById('trading-weights-upload');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        sessionStorage.setItem('refdata-file-trading-day-weights', fileInput.files[0].name);
      }
      sessionStorage.setItem('refdata-trading-day-weights', JSON.stringify({ label: 'Done', variant: 'success' }));
    });
  }

  // Uploaded reference datasets list page: Save and continue
  const btnSaveProvideRef = document.getElementById('btn-save-provideref');
  if (btnSaveProvideRef) {
    btnSaveProvideRef.addEventListener('click', () => {
      const datesSaved = sessionStorage.getItem('refdata-survey-period-dates');
      const weightsSaved = sessionStorage.getItem('refdata-trading-day-weights');
      
      const datesDone = datesSaved && JSON.parse(datesSaved).label === 'Done';
      const weightsDone = weightsSaved && JSON.parse(weightsSaved).label === 'Done';
      
      if (datesDone && weightsDone) {
        sessionStorage.setItem('task-choose-reference-datasets', JSON.stringify({ label: 'Done', variant: 'success' }));
      } else {
        sessionStorage.setItem('task-choose-reference-datasets', JSON.stringify({ label: 'Started', variant: 'pending' }));
      }
    });
  }

  // Finalise validation rules page: Save and continue
  const btnSaveCompleteRules = document.getElementById('btn-save-completerules');
  if (btnSaveCompleteRules) {
    btnSaveCompleteRules.addEventListener('click', () => {
      const checkedRadio = document.querySelector('input[name="completed-rules"]:checked');
      const val = checkedRadio ? checkedRadio.value : 'no';
      
      if (val === 'yes') {
        sessionStorage.setItem('task-define-validation-rules', JSON.stringify({ label: 'Done', variant: 'success' }));
      } else {
        sessionStorage.setItem('task-define-validation-rules', JSON.stringify({ label: 'Started', variant: 'pending' }));
      }
    });
  }

  // --- ABS123 Metadata Page ---
  const btnSaveAbs123 = document.getElementById('btn-save-abs123');
  if (btnSaveAbs123) {
    const descInput = document.getElementById('form-description');
    const startInput = document.getElementById('period-start');
    const endInput = document.getElementById('period-end');
    
    if (descInput) descInput.value = sessionStorage.getItem('abs123-description') || '';
    if (startInput) startInput.value = sessionStorage.getItem('abs123-period-start') || '';
    if (endInput) endInput.value = sessionStorage.getItem('abs123-period-end') || '';
    
    btnSaveAbs123.addEventListener('click', () => {
      const descVal = descInput ? descInput.value.trim() : '';
      const startVal = startInput ? startInput.value.trim() : '';
      const endVal = endInput ? endInput.value.trim() : '';
      
      sessionStorage.setItem('abs123-description', descVal);
      sessionStorage.setItem('abs123-period-start', startVal);
      sessionStorage.setItem('abs123-period-end', endVal);
      
      if (descVal !== '' && startVal !== '' && endVal !== '') {
        sessionStorage.setItem('abs123-status', 'Done');
      } else {
        sessionStorage.setItem('abs123-status', 'Incomplete');
      }
    });
  }

  // --- ABS234 Metadata Page ---
  const btnSaveAbs234 = document.getElementById('btn-save-abs234');
  if (btnSaveAbs234) {
    const descInput = document.getElementById('form-description');
    const startInput = document.getElementById('period-start');
    const endInput = document.getElementById('period-end');
    
    if (descInput) descInput.value = sessionStorage.getItem('abs234-description') || '';
    if (startInput) startInput.value = sessionStorage.getItem('abs234-period-start') || '';
    if (endInput) endInput.value = sessionStorage.getItem('abs234-period-end') || '';
    
    btnSaveAbs234.addEventListener('click', () => {
      const descVal = descInput ? descInput.value.trim() : '';
      const startVal = startInput ? startInput.value.trim() : '';
      const endVal = endInput ? endInput.value.trim() : '';
      
      sessionStorage.setItem('abs234-description', descVal);
      sessionStorage.setItem('abs234-period-start', startVal);
      sessionStorage.setItem('abs234-period-end', endVal);
      
      if (descVal !== '' && startVal !== '' && endVal !== '') {
        sessionStorage.setItem('abs234-status', 'Done');
      } else {
        sessionStorage.setItem('abs234-status', 'Incomplete');
      }
    });
  }

  // --- ABS345 Metadata Page ---
  const btnSaveAbs345 = document.getElementById('btn-save-abs345');
  if (btnSaveAbs345) {
    const descInput = document.getElementById('form-description');
    const startInput = document.getElementById('period-start');
    const endInput = document.getElementById('period-end');
    
    if (descInput) descInput.value = sessionStorage.getItem('abs345-description') !== null ? sessionStorage.getItem('abs345-description') : 'Convenience stores and supermarkets';
    if (startInput) startInput.value = sessionStorage.getItem('abs345-period-start') !== null ? sessionStorage.getItem('abs345-period-start') : '042027';
    if (endInput) endInput.value = sessionStorage.getItem('abs345-period-end') !== null ? sessionStorage.getItem('abs345-period-end') : '032028';
    
    btnSaveAbs345.addEventListener('click', () => {
      const descVal = descInput ? descInput.value.trim() : '';
      const startVal = startInput ? startInput.value.trim() : '';
      const endVal = endInput ? endInput.value.trim() : '';
      
      sessionStorage.setItem('abs345-description', descVal);
      sessionStorage.setItem('abs345-period-start', startVal);
      sessionStorage.setItem('abs345-period-end', endVal);
      
      if (descVal !== '' && startVal !== '' && endVal !== '') {
        sessionStorage.setItem('abs345-status', 'Done');
      } else {
        sessionStorage.setItem('abs345-status', 'Incomplete');
      }
    });
  }

  // --- Forms List Display Recall & Status Badger ---
  
  // Recall values for ABS123
  const abs123ValDesc = document.getElementById('abs123-val-desc');
  const abs123ValStart = document.getElementById('abs123-val-start');
  const abs123ValEnd = document.getElementById('abs123-val-end');
  if (abs123ValDesc) abs123ValDesc.textContent = sessionStorage.getItem('abs123-description') || '';
  if (abs123ValStart) abs123ValStart.textContent = sessionStorage.getItem('abs123-period-start') || '';
  if (abs123ValEnd) abs123ValEnd.textContent = sessionStorage.getItem('abs123-period-end') || '';

  const abs123StatusEl = document.getElementById('abs123-status');
  if (abs123StatusEl) {
    const status = sessionStorage.getItem('abs123-status') || 'Incomplete';
    if (status === 'Done') {
      abs123StatusEl.innerHTML = '<span class="ons-status ons-status--success">Done</span>';
    } else {
      abs123StatusEl.innerHTML = '<span class="ons-status ons-status--info">Incomplete</span>';
    }
  }

  // Recall values for ABS234
  const abs234ValDesc = document.getElementById('abs234-val-desc');
  const abs234ValStart = document.getElementById('abs234-val-start');
  const abs234ValEnd = document.getElementById('abs234-val-end');
  if (abs234ValDesc) abs234ValDesc.textContent = sessionStorage.getItem('abs234-description') || '';
  if (abs234ValStart) abs234ValStart.textContent = sessionStorage.getItem('abs234-period-start') || '';
  if (abs234ValEnd) abs234ValEnd.textContent = sessionStorage.getItem('abs234-period-end') || '';

  const abs234StatusEl = document.getElementById('abs234-status');
  if (abs234StatusEl) {
    const status = sessionStorage.getItem('abs234-status') || 'Incomplete';
    if (status === 'Done') {
      abs234StatusEl.innerHTML = '<span class="ons-status ons-status--success">Done</span>';
    } else {
      abs234StatusEl.innerHTML = '<span class="ons-status ons-status--info">Incomplete</span>';
    }
  }

  // Recall values for ABS345 (with defaults if empty)
  const abs345ValDesc = document.getElementById('abs345-val-desc');
  const abs345ValStart = document.getElementById('abs345-val-start');
  const abs345ValEnd = document.getElementById('abs345-val-end');
  if (abs345ValDesc) {
    abs345ValDesc.textContent = sessionStorage.getItem('abs345-description') !== null ? sessionStorage.getItem('abs345-description') : 'Convenience stores and supermarkets';
  }
  if (abs345ValStart) {
    abs345ValStart.textContent = sessionStorage.getItem('abs345-period-start') !== null ? sessionStorage.getItem('abs345-period-start') : '042027';
  }
  if (abs345ValEnd) {
    abs345ValEnd.textContent = sessionStorage.getItem('abs345-period-end') !== null ? sessionStorage.getItem('abs345-period-end') : '032028';
  }

  const abs345StatusEl = document.getElementById('abs345-status');
  if (abs345StatusEl) {
    const status = sessionStorage.getItem('abs345-status') !== null ? sessionStorage.getItem('abs345-status') : 'Done';
    if (status === 'Done') {
      abs345StatusEl.innerHTML = '<span class="ons-status ons-status--success">Done</span>';
    } else {
      abs345StatusEl.innerHTML = '<span class="ons-status ons-status--info">Incomplete</span>';
    }
  }

  // 3. Clear data footer link (targeted by text)
  const clearDataLink = Array.from(document.querySelectorAll('.ons-footer a')).find(el => el.textContent.trim() === 'Clear data');
  if (clearDataLink) {
    clearDataLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.clear();
      // Reload current page or redirect to SPP Home root
      window.location.reload();
    });
  }
});
