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

  // Upload survey forms page: Save and continue
  const btnSaveForms = document.getElementById('btn-save-forms');
  if (btnSaveForms) {
    btnSaveForms.addEventListener('click', () => {
      sessionStorage.setItem('task-add-survey-forms', JSON.stringify({ label: 'Completed', variant: 'success' }));
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
