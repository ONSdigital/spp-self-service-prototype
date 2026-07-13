/***********************************************************************************
Imports question manager, summary generator, answer piping and previous link history
************************************************************************************/
import '@ons/prototype-kit/src/helpers/index.js';

// SPP Self Service State Management
document.addEventListener('DOMContentLoaded', () => {
  // 1. Render dynamic statuses from sessionStorage on page load
  
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
    'define-validation-rules': '#0',
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
      const url = taskUrls[id];
      const rootPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/views/'));
      const fullUrl = url.startsWith('/') ? (rootPath + url) : url;
      el.innerHTML = `<a href="${fullUrl}">${taskNames[id]}</a>`;
    }
  });

  // Reference Data Table
  document.querySelectorAll('[data-refdata-id]').forEach(el => {
    const id = el.getAttribute('data-refdata-id');
    const saved = sessionStorage.getItem(`refdata-${id}`);
    if (saved) {
      const data = JSON.parse(saved);
      el.innerHTML = `<span class="ons-status ons-status--${data.variant}">${data.label}</span>`;
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
      sessionStorage.setItem('refdata-survey-period-dates', JSON.stringify({ label: 'Done', variant: 'success' }));
    });
  }

  // Upload trading day weights page: Save and continue
  const btnSaveTradingWeights = document.getElementById('btn-save-trading-weights');
  if (btnSaveTradingWeights) {
    btnSaveTradingWeights.addEventListener('click', () => {
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
