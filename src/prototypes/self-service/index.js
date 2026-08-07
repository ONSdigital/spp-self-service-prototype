/***********************************************************************************
Imports question manager, summary generator, answer piping and previous link history
************************************************************************************/
import '@ons/prototype-kit/src/helpers/index.js';

// SPP Self Service State Management
document.addEventListener('DOMContentLoaded', () => {
  const rootPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/views/'));

  // --- Survey Select & Header Replacement State Management ---
  
  // 1. Capture select clicks on migrate.html
  const selectLinks = document.querySelectorAll('.spp-survey-select-link');
  selectLinks.forEach(link => {
    link.addEventListener('click', () => {
      const surveyId = link.getAttribute('data-survey-id');
      const surveyCode = link.getAttribute('data-survey-code');
      const surveyName = link.getAttribute('data-survey-name');
      
      const surveyObj = {
        id: surveyId,
        code: surveyCode,
        name: surveyName
      };
      
      sessionStorage.setItem('current-survey', JSON.stringify(surveyObj));
    });
  });

  // 2. Dynamic H1 Header Replacement on formslist.html
  if (window.location.pathname.includes('formslist.html')) {
    const formslistH1 = document.querySelector('h1');
    if (formslistH1) {
      const rawSurvey = sessionStorage.getItem('current-survey');
      if (rawSurvey) {
        try {
          const survey = JSON.parse(rawSurvey);
          if (survey && survey.name && survey.id) {
            formslistH1.textContent = `${survey.name} - ${survey.id}`;
          } else {
            formslistH1.textContent = 'Forms list - No survey selected';
          }
        } catch (err) {
          console.error("Error parsing current-survey on formslist page:", err);
          formslistH1.textContent = 'Forms list - No survey selected';
        }
      } else {
        formslistH1.textContent = 'Forms list - No survey selected';
      }
    }
  }

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

  // --- Forms List Dynamic Cards Rendering ---
  const accordionArea = document.getElementById('spp-forms-accordion-area');
  if (accordionArea) {
    const rawForms = sessionStorage.getItem('uploaded-forms');
    let formsList = [];
    if (rawForms) {
      try {
        formsList = JSON.parse(rawForms);
      } catch (err) {
        console.error("Error parsing uploaded-forms in formslist:", err);
      }
    }
    
    if (formsList && formsList.length > 0) {
      let html = '<div class="ons-grid">';
      
      formsList.forEach((form, index) => {
        const title = form.form_title || 'Untitled Form';
        const filename = form.filename || '';
        const formId = form.form_id || '';
        const version = form.version || '0.0.1';
        
        html += `
          <div class="ons-grid__col ons-col-6@m">
            <div class="ons-card" style="border: 1px solid var(--ons-color-borders); border-radius: 4px; padding: 1.5rem; margin-bottom: 1.5rem; background: var(--ons-color-white); height: calc(100% - 1.5rem); box-sizing: border-box;">
              <div class="ons-card__body">
                <h2 class="ons-card__title ons-u-fs-m" id="card-title-${index}" style="margin: 0 0 1rem 0;">
                  <a href="${rootPath}/views/tasklist/addforms/uploadjson.html?edit=${index}" class="ons-card__link">${title}</a>
                </h2>
                <div class="ons-card__content">
                  <dl class="spp-description-list" style="margin: 0; padding: 0; list-style: none;">
                    <div class="spp-description-list__item" style="display: flex; align-items: baseline; width: 100%; margin-bottom: 0.5rem;">
                      <dt class="spp-description-list__term" style="font-weight: bold; min-width: 140px; flex-shrink: 0; margin-right: 1rem;">File name:</dt>
                      <dd class="spp-description-list__value" style="margin: 0;">${filename}</dd>
                    </div>
                    <div class="spp-description-list__item" style="display: flex; align-items: baseline; width: 100%; margin-bottom: 0.5rem;">
                      <dt class="spp-description-list__term" style="font-weight: bold; min-width: 140px; flex-shrink: 0; margin-right: 1rem;">Form ID:</dt>
                      <dd class="spp-description-list__value" style="margin: 0;">${formId}</dd>
                    </div>
                    <div class="spp-description-list__item" style="display: flex; align-items: baseline; width: 100%; margin-bottom: 0;">
                      <dt class="spp-description-list__term" style="font-weight: bold; min-width: 140px; flex-shrink: 0; margin-right: 1rem;">Version:</dt>
                      <dd class="spp-description-list__value" style="margin: 0;">${version}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      
      // Inject the dynamic HTML!
      accordionArea.innerHTML = html;
    }
  }

  // --- Upload JSON Page Multi-form Persistence & In-place Editing ---
  const btnSaveForms = document.getElementById('btn-save-forms');
  
  // Parse edit parameter if present in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const editIndexParam = urlParams.get('edit');
  const isEditMode = editIndexParam !== null;
  const editIndex = isEditMode ? parseInt(editIndexParam, 10) : -1;
  
  // 1. Pre-populate the fields and show associated file if we are in Edit Mode
  if (isEditMode && editIndex >= 0) {
    const rawForms = sessionStorage.getItem('uploaded-forms');
    let formsList = [];
    if (rawForms) {
      try {
        formsList = JSON.parse(rawForms);
      } catch (err) {
        console.error("Error parsing uploaded-forms for pre-population:", err);
      }
    }
    
    const editingForm = formsList[editIndex];
    if (editingForm) {
      const titleInput = document.getElementById('form-title');
      
      if (titleInput) titleInput.value = editingForm.form_title || '';
      
      // Dynamically display the currently associated filename next to the file uploader
      const fileInput = document.getElementById('survey-form-upload');
      if (fileInput) {
        const uploaderWrapper = fileInput.closest('.ons-field');
        if (uploaderWrapper) {
          const infoPara = document.createElement('p');
          infoPara.className = 'ons-u-mt-xs';
          infoPara.style.fontWeight = 'bold';
          infoPara.innerHTML = `Associated file: <code style="background: var(--ons-color-grey-15); padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace;">${editingForm.filename}</code>`;
          uploaderWrapper.appendChild(infoPara);
        }
      }
    }
  }

  // 2. Handle button click (Save & continue)
  if (btnSaveForms) {
    btnSaveForms.addEventListener('click', async (e) => {
      e.preventDefault(); // Intercept browser's instant navigation
      
      const fileInput = document.getElementById('survey-form-upload');
      const titleInput = document.getElementById('form-title');
      
      const formTitle = titleInput ? titleInput.value.trim() : '';
      
      // Retrieve the existing array of forms from sessionStorage
      let formsList = [];
      const existingList = sessionStorage.getItem('uploaded-forms');
      if (existingList) {
        try {
          formsList = JSON.parse(existingList);
        } catch (err) {
          console.error("Error parsing uploaded-forms from sessionStorage:", err);
        }
      }
      
      let filename = '';
      let shouldSave = false;
      let formId = '';
      let version = '0.0.1';
      
      // Helper function to extract schema_version from the uploaded file asynchronously
      const getUploadedSchemaVersion = (file) => {
        return new Promise((resolve) => {
          if (!file) {
            resolve('0.0.1');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const json = JSON.parse(evt.target.result);
              if (json && json.schema_version) {
                resolve(String(json.schema_version));
              } else {
                resolve('0.0.1');
              }
            } catch (err) {
              console.warn("Unable to parse schema_version from JSON, falling back to '0.0.1':", err);
              resolve('0.0.1');
            }
          };
          reader.onerror = () => {
            resolve('0.0.1');
          };
          reader.readAsText(file);
        });
      };
      
      if (isEditMode && editIndex >= 0 && formsList[editIndex]) {
        // Edit Mode: check if a new file is uploaded, otherwise fall back to the existing filename
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          filename = fileInput.files[0].name;
          // Extract version from newly uploaded schema file
          version = await getUploadedSchemaVersion(fileInput.files[0]);
        } else {
          filename = formsList[editIndex].filename; // Fall back to existing file name
          version = formsList[editIndex].version;   // Keep existing version unchanged
        }
        
        // Preserve original Form ID exactly
        formId = formsList[editIndex].form_id;
        shouldSave = true; // Always save in edit mode
      } else {
        // Create Mode: we must select a file to save
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          filename = fileInput.files[0].name;
          shouldSave = true;
          
          // Generate a new random 3-digit Form ID
          formId = Math.floor(100 + Math.random() * 900);
          
          // Extract version from uploaded schema file
          version = await getUploadedSchemaVersion(fileInput.files[0]);
        }
      }
      
      if (shouldSave) {
        const formEntity = {
          filename: filename,
          form_title: formTitle,
          form_id: formId,
          version: version
        };
        
        if (isEditMode && editIndex >= 0) {
          // Update in-place
          formsList[editIndex] = formEntity;
        } else {
          // Create / Append new form
          formsList.push(formEntity);
        }
        
        // Save the updated array back to sessionStorage
        sessionStorage.setItem('uploaded-forms', JSON.stringify(formsList));
      }
      
      // Perform navigation programmatically once the async operations have finished
      window.location.href = btnSaveForms.getAttribute('href') || (rootPath + "/views/tasklist/addforms/formslist.html");
    });
  }

  // --- Existing Surveys Table Client-side Pagination ---
  const paginationContainer = document.getElementById('spp-survey-pagination');
  const surveysTable = document.getElementById('existing-surveys-table');
  
  if (paginationContainer && surveysTable) {
    function navigatePage(pageNumber) {
      if (pageNumber < 1 || pageNumber > 2) return;
      
      // 1. Show/Hide table rows (10 per page)
      const rows = surveysTable.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        if (pageNumber === 1) {
          if (index < 10) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        } else {
          if (index >= 10) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        }
      });
      
      // 2. Update active states on the pagination component
      const items = Array.from(paginationContainer.querySelectorAll('.ons-pagination__item'));
      
      const previousItem = items.find(el => el.classList.contains('ons-pagination__item--previous'));
      const nextItem = items.find(el => el.classList.contains('ons-pagination__item--next'));
      
      const pageItems = items.filter(el => 
        !el.classList.contains('ons-pagination__item--previous') && 
        !el.classList.contains('ons-pagination__item--next')
      );
      
      // Reset all page items
      pageItems.forEach(item => {
        item.classList.remove('ons-pagination__item--current');
        const anchor = item.querySelector('a');
        if (anchor) anchor.removeAttribute('aria-current');
      });
      
      // Set current active item
      const activeItem = pageItems[pageNumber - 1];
      if (activeItem) {
        activeItem.classList.add('ons-pagination__item--current');
        const anchor = activeItem.querySelector('a');
        if (anchor) anchor.setAttribute('aria-current', 'true');
      }
      
      // Manage visibility of Prev/Next items
      if (previousItem) {
        previousItem.style.display = pageNumber === 1 ? 'none' : '';
      }
      if (nextItem) {
        nextItem.style.display = pageNumber === 2 ? 'none' : '';
      }
      
      // Set internal state tracker
      paginationContainer.setAttribute('data-current-page', pageNumber);
    }
    
    // Initialise on page load to Page 1
    navigatePage(1);
    
    // Attach click event listeners to pagination links
    const links = paginationContainer.querySelectorAll('.ons-pagination__link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const currentPage = parseInt(paginationContainer.getAttribute('data-current-page') || '1', 10);
        
        const parent = link.closest('.ons-pagination__item');
        if (parent) {
          if (parent.classList.contains('ons-pagination__item--previous')) {
            navigatePage(currentPage - 1);
          } else if (parent.classList.contains('ons-pagination__item--next')) {
            navigatePage(currentPage + 1);
          } else {
            const pageNum = parseInt(link.textContent.trim(), 10);
            if (!isNaN(pageNum)) {
              navigatePage(pageNum);
            }
          }
        }
      });
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
