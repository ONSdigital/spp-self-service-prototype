/***********************************************************************************
Imports question manager, summary generator, answer piping and previous link history
************************************************************************************/
import '@ons/prototype-kit/src/helpers/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const rootPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/views/'));
  const table = document.getElementById('existing-surveys-table');
  const pagination = document.getElementById('spp-survey-pagination');

  const getCurrentValidationRule = () => {
    const rawRule = sessionStorage.getItem('current-validation-rule');

    if (!rawRule) {
      return {};
    }

    try {
      return JSON.parse(rawRule) || {};
    } catch (err) {
      console.error('Error parsing current-validation-rule from sessionStorage:', err);
      return {};
    }
  };

  const setCurrentValidationRule = (updates) => {
    const currentRule = getCurrentValidationRule();
    sessionStorage.setItem('current-validation-rule', JSON.stringify({ ...currentRule, ...updates }));
  };

  const getCurrentSurvey = () => {
    const rawSurvey = sessionStorage.getItem('current-survey');

    if (!rawSurvey) {
      return null;
    }

    try {
      return JSON.parse(rawSurvey);
    } catch (err) {
      console.error('Error parsing current-survey from sessionStorage:', err);
      return null;
    }
  };

  const updateSurveyBreadcrumb = () => {
    const surveyBreadcrumb = document.getElementById('breadcrumb-survey');

    if (!surveyBreadcrumb) {
      return;
    }

    const survey = getCurrentSurvey();

    if (!survey || !survey.code || !survey.id) {
      surveyBreadcrumb.textContent = 'Survey';
      surveyBreadcrumb.removeAttribute('title');
      return;
    }

    surveyBreadcrumb.textContent = `${survey.code} (${survey.id})`;
    surveyBreadcrumb.setAttribute('title', survey.name || '');
  };

  const updateFormDatasetVisibility = () => {
    const survey = getCurrentSurvey();
    const dataset = survey && survey.code === 'MBS' ? 'mbs' : 'dummy';

    document.querySelectorAll('[data-form-dataset]').forEach((element) => {
      element.hidden = element.getAttribute('data-form-dataset') !== dataset;
    });
  };

  const SURVEY_CATALOG = [
    { id: '001', code: 'NBS', name: 'New Business Survey' },
    { id: '002', code: 'BERD', name: 'Business Enterprise Research and Development' },
    { id: '007', code: 'LCRE', name: 'Low Carbon & Renewable Energy Economy Survey' },
    { id: '009', code: 'MBS', name: 'Monthly Business Survey' },
    { id: '010', code: 'PI', name: 'Purchases Inquiry' },
    { id: '017', code: 'QSS', name: 'Quarterly Stocks Survey' },
    { id: '023', code: 'RSI', name: 'Monthly Business Survey (Retail Sales Index)' },
    { id: '024', code: 'QFS', name: 'Quarterly Fuels Survey' },
    { id: '093', code: 'FSPS', name: 'Financial Survey of Pension Schemes' },
    { id: '134', code: 'MWSS', name: 'Monthly Wages & Salaries Survey' },
    { id: '139', code: 'QBS', name: 'Quarterly Business Survey' },
    { id: '141', code: 'ASHE', name: 'Annual Survey of Hours and Earnings' },
    { id: '144', code: 'UKIS', name: 'UK Innovation Survey' },
    { id: '228', code: 'CONST', name: 'Monthly Business Survey (Construction)' },
    { id: '266', code: 'QFS', name: 'Financial Services Survey' }
  ];

  const applySurveyFromQueryParams = () => {
    const surveyParam = new URLSearchParams(window.location.search).get('survey');
    if (!surveyParam) {
      return;
    }

    const code = surveyParam.trim().toUpperCase();
    const matchedSurvey = SURVEY_CATALOG.find((s) => s.code === code);

    if (matchedSurvey) {
      const previousSurvey = getCurrentSurvey();
      if (!previousSurvey || previousSurvey.code !== matchedSurvey.code || previousSurvey.id !== matchedSurvey.id) {
        sessionStorage.removeItem('current-validation-rule');
      }
      sessionStorage.setItem('current-survey', JSON.stringify(matchedSurvey));
    }
  };

  applySurveyFromQueryParams();
  updateSurveyBreadcrumb();
  updateFormDatasetVisibility();

  if (table && pagination) {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const itemsPerPage = 10;
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    let currentPage = 1;

    function renderPage(page) {
      currentPage = page;

      // 1. Show/hide table rows (10 per page)
      rows.forEach((row, idx) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        if (idx >= start && idx < end) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });

      // 2. Update pagination buttons
      const paginationItems = Array.from(pagination.querySelectorAll('.ons-pagination__item'));
      const prevBtn = paginationItems.find(el => el.classList.contains('ons-pagination__item--previous'));
      const nextBtn = paginationItems.find(el => el.classList.contains('ons-pagination__item--next'));
      const pageBtns = paginationItems.filter(el => 
        !el.classList.contains('ons-pagination__item--previous') && 
        !el.classList.contains('ons-pagination__item--next')
      );

      // Reset active styles
      pageBtns.forEach(item => {
        item.classList.remove('ons-pagination__item--current');
        const link = item.querySelector('a');
        if (link) {
          link.removeAttribute('aria-current');
        }
      });

      // Set active style for current page
      const currentItem = pageBtns[currentPage - 1];
      if (currentItem) {
        currentItem.classList.add('ons-pagination__item--current');
        const link = currentItem.querySelector('a');
        if (link) {
          link.setAttribute('aria-current', 'true');
        }
      }

      // Show/hide previous & next buttons
      if (prevBtn) {
        prevBtn.style.display = currentPage === 1 ? 'none' : '';
      }
      if (nextBtn) {
        nextBtn.style.display = currentPage === totalPages ? 'none' : '';
      }
    }

    // Initialize to Page 1
    renderPage(1);

    // Attach click listeners to all pagination links
    const paginationLinks = pagination.querySelectorAll('.ons-pagination__link');
    paginationLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = link.closest('.ons-pagination__item');
        if (!parent) return;

        if (parent.classList.contains('ons-pagination__item--previous')) {
          if (currentPage > 1) {
            renderPage(currentPage - 1);
          }
        } else if (parent.classList.contains('ons-pagination__item--next')) {
          if (currentPage < totalPages) {
            renderPage(currentPage + 1);
          }
        } else {
          const pageNum = parseInt(link.textContent.trim(), 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            renderPage(pageNum);
          }
        }
      });
    });
  }

  // Handle survey link selection and store details in sessionStorage
  const surveyLinks = document.querySelectorAll('.spp-survey-select-link');
  surveyLinks.forEach(link => {
    link.addEventListener('click', () => {
      const surveyId = link.getAttribute('data-survey-id');
      const surveyCode = link.getAttribute('data-survey-code');
      const surveyName = link.getAttribute('data-survey-name');
      const previousSurvey = getCurrentSurvey();

      const surveyObj = {
        id: surveyId,
        code: surveyCode,
        name: surveyName
      };

      // The selected form/question belongs to the previous survey, so don't
      // carry it into a different survey.
      if (!previousSurvey || previousSurvey.code !== surveyCode || previousSurvey.id !== surveyId) {
        sessionStorage.removeItem('current-validation-rule');
      }

      sessionStorage.setItem('current-survey', JSON.stringify(surveyObj));
    });
  });

  // Handle dynamic H1 replacement on survey.html
  if (window.location.pathname.includes('survey.html')) {
    const surveyH1 = document.querySelector('h1');
    if (surveyH1) {
      const rawSurvey = sessionStorage.getItem('current-survey');
      if (rawSurvey) {
        try {
          const survey = JSON.parse(rawSurvey);
          if (survey && survey.name && survey.id && survey.code) {
            surveyH1.textContent = `${survey.name} (${survey.code} - ${survey.id})`;
          } else {
            surveyH1.textContent = 'Manage Survey';
          }
        } catch (err) {
          console.error("Error parsing current-survey on survey page:", err);
          surveyH1.textContent = 'Manage Survey';
        }
      } else {
        surveyH1.textContent = 'Manage Survey';
      }
    }
  }

  // 1. Dynamic H1 Header Replacement on formslist.html
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
          <div class="ons-grid__col ons-col-4@m">
            <div class="ons-card" style="border: 1px solid var(--ons-color-borders); border-radius: 4px; padding: 1.5rem; margin-bottom: 1.5rem; background: var(--ons-color-white); height: calc(100% - 1.5rem); box-sizing: border-box;">
              <div class="ons-card__body">
                <h2 class="ons-card__title ons-u-fs-m" id="card-title-${index}" style="margin: 0 0 1rem 0;">
                  <a href="${rootPath}/views/configuration/forms/manageform.html?formIndex=${index}" class="ons-card__link">${title}</a>
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
                  </dl>
                  <p style="margin: 0.5rem 0 0 0;"><a href="${rootPath}/views/configuration/forms/formpreview.html?formIndex=${index}&formTitle=${encodeURIComponent(title)}">Preview form</a></p>
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
      
      // Helper function to extract metadata from the uploaded file asynchronously
      const getUploadedFormMetadata = (file) => {
        return new Promise((resolve) => {
          if (!file) {
            resolve({ version: '0.0.1', formId: 'Unknown ID' });
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const json = JSON.parse(evt.target.result);
              const ver = (json && json.schema_version) ? String(json.schema_version) : '0.0.1';
              const fid = (json && json.form_type) ? String(json.form_type) : 'Unknown ID';
              resolve({ version: ver, formId: fid });
            } catch (err) {
              console.warn("Unable to parse metadata from JSON, falling back:", err);
              resolve({ version: '0.0.1', formId: 'Unknown ID' });
            }
          };
          reader.onerror = () => {
            resolve({ version: '0.0.1', formId: 'Unknown ID' });
          };
          reader.readAsText(file);
        });
      };
      
      if (isEditMode && editIndex >= 0 && formsList[editIndex]) {
        // Edit Mode: check if a new file is uploaded, otherwise fall back to the existing filename
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          filename = fileInput.files[0].name;
          const metadata = await getUploadedFormMetadata(fileInput.files[0]);
          version = metadata.version;
          formId = metadata.formId;
        } else {
          filename = formsList[editIndex].filename; // Fall back to existing file name
          version = formsList[editIndex].version;   // Keep existing version unchanged
          formId = formsList[editIndex].form_id;    // Keep existing Form ID unchanged
        }
        
        shouldSave = true; // Always save in edit mode
      } else {
        // Create Mode: we must select a file to save
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          filename = fileInput.files[0].name;
          shouldSave = true;
          
          const metadata = await getUploadedFormMetadata(fileInput.files[0]);
          version = metadata.version;
          formId = metadata.formId;
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
      window.location.href = btnSaveForms.getAttribute('href') || (rootPath + "/views/configuration/forms/formslist.html");
    });
  }

  // Handle manageform.html logic
  if (window.location.pathname.includes('manageform.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const formIndexParam = urlParams.get('formIndex');
    if (formIndexParam !== null) {
      const formIndex = parseInt(formIndexParam, 10);
      const rawForms = sessionStorage.getItem('uploaded-forms');
      if (rawForms) {
        try {
          const formsList = JSON.parse(rawForms);
          const form = formsList[formIndex];
          if (form) {
            // Populate the summary values using row IDs and ONS span classes
            const titleEl = document.querySelector('#form-title-row .ons-summary__text');
            const idEl = document.querySelector('#form-id-row .ons-summary__text');
            const versionEl = document.querySelector('#form-version-row .ons-summary__text');
            const fileEl = document.querySelector('#uploaded-file-row .ons-summary__text');

            if (titleEl) titleEl.textContent = form.form_title || 'Untitled Form';
            if (idEl) idEl.textContent = form.form_id || '';
            if (versionEl) versionEl.textContent = form.version || '0.0.1';
            if (fileEl) fileEl.textContent = form.filename || '';

            // Update change links
            const changeTitleBtn = document.querySelector('#form-title-row a.ons-summary__button') || document.querySelector('#form-title-row a');
            const changeFileBtn = document.querySelector('#uploaded-file-row a.ons-summary__button') || document.querySelector('#uploaded-file-row a');

            const editUrl = `${rootPath}/views/configuration/forms/uploadjson.html?edit=${formIndex}`;
            if (changeTitleBtn) changeTitleBtn.setAttribute('href', editUrl);
            if (changeFileBtn) changeFileBtn.setAttribute('href', editUrl);
          }
        } catch (err) {
          console.error("Error loading form details on manageform page:", err);
        }
      }
    }
  }

  // Handle version link selection and store details in sessionStorage
  const versionLinks = document.querySelectorAll('.spp-version-select-link');
  versionLinks.forEach(link => {
    link.addEventListener('click', () => {
      const versionName = link.getAttribute('data-version-name');
      sessionStorage.setItem('current-version-name', versionName || '');
    });
  });

  // Handle dynamic H1 replacement on formpreview.html
  if (window.location.pathname.includes('formpreview.html')) {
    const previewH1 = document.getElementById('form-preview-h1');
    if (previewH1) {
      const urlParams = new URLSearchParams(window.location.search);
      const formIndexParam = urlParams.get('formIndex');
      if (formIndexParam !== null) {
        const formIndex = parseInt(formIndexParam, 10);
        const rawForms = sessionStorage.getItem('uploaded-forms');
        if (rawForms) {
          try {
            const formsList = JSON.parse(rawForms);
            const form = formsList[formIndex];
            if (form) {
              const title = form.form_title || 'Untitled Form';
              const formId = form.form_id || 'Unknown ID';
              previewH1.textContent = `${title} - ${formId}`;
            } else {
              previewH1.textContent = 'Form preview';
            }
          } catch (err) {
            console.error("Error loading form details on formpreview page:", err);
            previewH1.textContent = 'Form preview';
          }
        } else {
          previewH1.textContent = 'Form preview';
        }
      } else {
        const formTitle = urlParams.get('formTitle');
        const formId = urlParams.get('formId');
        if (formTitle && formId) {
          previewH1.textContent = `${formTitle} - ${formId}`;
        } else {
          previewH1.textContent = 'Form preview';
        }
      }
    }
  }

  const RULES_STORAGE_KEYS = ['spp-validation-rules-mbs', 'spp-validation-rules-dummy'];

  // Clear data footer link — forget everything except the currently selected survey
  const clearDataLink = document.getElementById('clear-data-link') || Array.from(document.querySelectorAll('.ons-footer a')).find(el => el.textContent.trim() === 'Clear data');
  if (clearDataLink) {
    clearDataLink.addEventListener('click', (e) => {
      e.preventDefault();
      const preservedSurvey = sessionStorage.getItem('current-survey');
      sessionStorage.clear();
      if (preservedSurvey) {
        sessionStorage.setItem('current-survey', preservedSurvey);
      }
      RULES_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    });
  }

  const getRulesStorageKey = () => {
    const survey = getCurrentSurvey();
    return survey && survey.code === 'MBS' ? 'spp-validation-rules-mbs' : 'spp-validation-rules-dummy';
  };

  const getStoredRules = () => {
    const raw = localStorage.getItem(getRulesStorageKey());
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error parsing validation rules from localStorage:', err);
      return [];
    }
  };

  const saveStoredRules = (rules) => {
    localStorage.setItem(getRulesStorageKey(), JSON.stringify(rules));
  };

  const getNextRuleId = (rules) => {
    const maxNum = rules.reduce((max, r) => {
      const num = parseInt(r.ruleId, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return String(maxNum + 1).padStart(3, '0');
  };

  const getQuestionContextFromElement = (el) => {
    const survey = getCurrentSurvey();

    return {
      surveyId: survey && survey.id ? survey.id : '',
      surveyCode: survey && survey.code ? survey.code : '',
      surveyName: survey && survey.name ? survey.name : '',
      ruleId: el.getAttribute('data-rule-id') || '',
      formId: el.getAttribute('data-form-id') || '',
      formTitle: el.getAttribute('data-form-title') || '',
      sourceFormId: el.getAttribute('data-source-form-id') || '',
      questionCode: el.getAttribute('data-question-code') || '',
      questionLabel: el.getAttribute('data-question-label') || '',
      questionType: el.getAttribute('data-question-type') || '',
      questionRequired: el.getAttribute('data-question-required') === 'true',
      questionReadOnly: el.getAttribute('data-question-readonly') === 'true',
      questionDecimalPlaces: parseInt(el.getAttribute('data-question-decimal-places'), 10) || 0,
      questionMaxLength: parseInt(el.getAttribute('data-question-max-length'), 10) || 0,
      questionDerivedFormula: el.getAttribute('data-question-derived-formula') || '',
      errorMessage: el.getAttribute('data-error-message') || ''
    };
  };

  const formatFormId = (idRaw) => {
    if (!idRaw) {
      return '009';
    }
    return /^\d+$/.test(String(idRaw)) ? String(idRaw).padStart(3, '0') : String(idRaw);
  };

  const getSelectedTargets = (rule) => {
    if (Array.isArray(rule.selectedQuestions) && rule.selectedQuestions.length > 0) {
      return rule.selectedQuestions;
    }
    if (rule.questionCode || rule.formTitle) {
      return [rule];
    }
    return [];
  };

  const formatQuestionSummary = (rule, fallback = 'Q100') => {
    const targets = getSelectedTargets(rule);
    if (targets.length === 0) {
      return fallback;
    }
    const codes = Array.from(new Set(targets.map((q) => q.questionCode).filter(Boolean)));
    return codes.join(', ') || fallback;
  };

  const formatFormSummary = (rule, fallback = 'Form 1 (009)') => {
    const targets = getSelectedTargets(rule);
    if (targets.length === 0) {
      return fallback;
    }
    const labels = Array.from(
      new Set(
        targets
          .map((q) => {
            const title = q.formTitle || '';
            const sourceId = q.sourceFormId ? formatFormId(q.sourceFormId) : '';
            return title ? `${title}${sourceId ? ` (${sourceId})` : ''}` : '';
          })
          .filter(Boolean)
      )
    );
    return labels.join(', ') || fallback;
  };

  const TEMPLATE_NAMES = {
    CQTCVACQ: 'Compare Question To A Constant Value And A Comparison Question',
    CVDLPGTX: 'Construction Value Decrease Last Period Greater Than X',
    CVILPGTX: 'Construction Value Increase Last Period Greater Than X',
    DAE: 'Date Adjustment Error',
    DALW: 'Date Adjustment Long Warning',
    DAME: 'Date Adjustment Midpoint Error',
    DASW: 'Date Adjustment Short Warning',
    DIVWTIT: 'Difference In Values Within Threshold And Tolerance',
    DTE: 'Double Text Equality',
    FV: 'Fixed Value',
    IV: 'Invalid Value',
    MGR: 'Missing Grouping Response',
    MGVE: 'Missing Group Value when Expected',
    NV: 'Negative Value',
    POPM: 'Period on Period Movement',
    POPMF: 'Period on Period Movement with Formid',
    POPMPS: 'Period on Period Movement Previous Status',
    POPMRZ: 'Period on Period Movement Ratio To Zero',
    POPQVQ: 'Period on Period Q Vs Q',
    POPQVQCELL: 'Period on Period Question versus Question Cell',
    POPRRM: 'Period on Period Ratio of Ratios Movement',
    POPZC: 'Period on Period Zero Continuity',
    PPVB: 'Previous Period Value is Blank',
    PPVZ: 'Previous Period Value is Zero',
    QAYCQVELZ: 'Response equals string value and another response equals non-string value',
    QEZCGZ: 'Question Equal to Zero and Comparison Greater than Zero',
    QEZCGZC: 'Question is blank or 0 and previous clear response is 0',
    QGVQEPP: 'Question Greater Than Threshold and Question Equal to Previous Period Question',
    QMVCLT: 'Question matches value and Comparison less than threshold',
    QVDQ: 'Question vs Derived Question',
    QVQ: 'Question vs Question',
    QVQGZ: 'Question Vs Derived Question and Greater Than Zero',
    QVQT: 'Current period Value vs Derived Value Greater than Threshold',
    QVV: 'Comment Present',
    QZCNRU: 'Question is 0 and Contributor is New Reporting Unit',
    QZNCSPP: 'Question is 0 and Not a Clear status in Previous Period',
    SEF: 'Selective Editing Fail',
    TCC: 'Total count check',
    TCCF: 'Totals Components Correction Failed',
    VB: 'Value is Blank',
    VBZ: 'Value is Blank or Zero',
    VBZCY: 'Value is Blank or Zero and Comparison question is Yes',
    VDCLTX: 'Value Divided by Comparison less than X',
    VDLPGTX: 'Value Decrease Last Period Greater Than X',
    VDSLPADF: 'Value Decrease Since Last Period And Different FormID',
    VFDSLPADF: 'Value FTE Decrease Since Last Period And Different FormID',
    VFISLPADF: 'Value FTE Increase Since Last Period And Different FormID',
    VGTPC: 'Value is Greater Than Product of Comparison',
    VGZAQTC: 'Value Greater than Zero and Question Threshold Criteria',
    VILPGTX: 'Value Increase Last Period Greater Than X',
    VISLPADF: 'Value Increase Since Last Period And Different FormID',
    VLCSLPDF: 'Value Large Change Since Last Period And Different FormID',
    VOVLVOV: 'Value Operator Value Logical_operator Value Operator Value',
    VP: 'Value Present',
    VPSIC: 'Value Present SIC',
    VRWV: 'Values Returned Without Values',
    VZ: 'Value is Zero'
  };

  const INITIAL_FORMULAS = {
    VDLPGTX:
      'abs(question - comparison_question) > threshold AND question < (comparison_question * percentage) AND previous_period_and_status_clear_exists = 1 AND previous_form_id = current_form_id AND question != -1',
    QVQ: 'question operator comparison_question',
    VRWV: '(question_1 > 0 OR question_2 > 0) AND (question_3 = 0 AND question_4 = 0)',
    QEZCGZ: 'question = 0 AND comparison_question > 0',
    VGZAQTC: 'question > 0 AND comparison_question > 0 AND question comparison_operator threshold * comparison_question'
  };

  const buildRuleFormulaString = (templateCode, primaryQuestionCode, params = {}) => {
    const getParam = (key) => (params && params[key] !== undefined && params[key] !== null ? String(params[key]).trim() : '');

    const formatResponseCall = (responseType, qcode, offsetRaw, fallbackPlaceholder) => {
      const fn = responseType || '';
      const code = qcode || primaryQuestionCode;
      const offset = offsetRaw === '' || offsetRaw === undefined || offsetRaw === null ? '0' : offsetRaw;
      if (!fn) {
        return fallbackPlaceholder;
      }
      return `${fn}(${code}, ${offset})`;
    };

    const formatThresholdValue = (thresholdType, thresholdValRaw) => {
      if (thresholdType === 'surveyconfig') {
        return thresholdValRaw === '' ? 'surveyconfig()' : `surveyconfig(${thresholdValRaw})`;
      }
      const val = thresholdValRaw === '' ? '0' : thresholdValRaw;
      if (thresholdType === 'constant') {
        return val;
      }
      return val || 'threshold';
    };

    const formatPercentageDecimal = (percentageRaw) => {
      if (percentageRaw === '' || percentageRaw === undefined || percentageRaw === null) {
        return '0';
      }
      const cleaned = String(percentageRaw).replace(/%/g, '').trim();
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        return cleaned || 'percentage';
      }
      return String(Number((num / 100).toFixed(6)));
    };

    const isPlaceholderValue = (val) => !val || val === '-- Select --';

    const formatPrimaryExpr = (prefix, fallback = 'question') =>
      formatResponseCall(getParam(`${prefix}-question-type`) || 'response', primaryQuestionCode, '0', fallback);

    const formatCompExpr = (prefix, fieldKey = 'comparison', fallback = 'comparison_question', usePrimaryFallback = true) => {
      const qcodeVal = getParam(`${prefix}-${fieldKey}-qcode`) || (usePrimaryFallback ? primaryQuestionCode : '');
      if (!qcodeVal) {
        return fallback;
      }
      return formatResponseCall(
        getParam(`${prefix}-${fieldKey}-type`) || 'response',
        qcodeVal,
        getParam(`${prefix}-${fieldKey}-offset`),
        fallback
      );
    };

    if (templateCode === 'VDLPGTX') {
      const qExpr = formatPrimaryExpr('vdlpgtx');
      const compExpr = formatCompExpr('vdlpgtx');
      const thresholdExpr = formatThresholdValue(
        getParam('vdlpgtx-threshold-type') || 'constant',
        getParam('vdlpgtx-threshold-value')
      );
      const percentageExpr = formatPercentageDecimal(getParam('vdlpgtx-percentage-value'));

      return `abs(${qExpr} - ${compExpr}) > ${thresholdExpr} AND ${qExpr} < (${compExpr} * ${percentageExpr}) AND previous_period_and_status_clear_exists = 1 AND previous_form_id = current_form_id AND ${qExpr} != -1`;
    }
    if (templateCode === 'QVQ') {
      const qExpr = formatPrimaryExpr('qvq');
      const compExpr = formatCompExpr('qvq');
      const rawOp = getParam('qvq-operator');
      const op = isPlaceholderValue(rawOp) ? 'operator' : rawOp;
      return `${qExpr} ${op} ${compExpr}`;
    }
    if (templateCode === 'VRWV') {
      const q1Expr = formatPrimaryExpr('vrwv', 'question_1');
      const q2Expr = formatCompExpr('vrwv', 'q2', 'question_2', false);
      const q3Expr = formatCompExpr('vrwv', 'q3', 'question_3', false);
      const q4Expr = formatCompExpr('vrwv', 'q4', 'question_4', false);
      return `(${q1Expr} > 0 OR ${q2Expr} > 0) AND (${q3Expr} = 0 AND ${q4Expr} = 0)`;
    }
    if (templateCode === 'QEZCGZ') {
      const qExpr = formatPrimaryExpr('qezcgz');
      const compExpr = formatCompExpr('qezcgz');
      return `${qExpr} = 0 AND ${compExpr} > 0`;
    }
    if (templateCode === 'VGZAQTC') {
      const qExpr = formatPrimaryExpr('vgzaqtc');
      const compExpr = formatCompExpr('vgzaqtc');
      const rawOp = getParam('vgzaqtc-operator');
      const op = isPlaceholderValue(rawOp) ? 'comparison_operator' : rawOp;
      const threshold = getParam('vgzaqtc-threshold') === '' ? '0' : getParam('vgzaqtc-threshold');
      return `${qExpr} > 0 AND ${compExpr} > 0 AND ${qExpr} ${op} ${threshold} * ${compExpr}`;
    }
    return INITIAL_FORMULAS[templateCode] || '';
  };

  const renderMultilineFormula = (container, formulaText) => {
    if (!container) {
      return;
    }
    const parts = String(formulaText || '')
      .split(/\s+\b(AND|OR)\b\s+/i)
      .map((part) => part.trim())
      .filter(Boolean);

    container.innerHTML = '';
    parts.forEach((part) => {
      const p = document.createElement('p');
      const upper = part.toUpperCase();
      p.textContent = upper === 'AND' || upper === 'OR' ? upper : part;
      container.appendChild(p);
    });
  };

  const addNewRuleButton = document.getElementById('add-new-rule-button');
  if (addNewRuleButton) {
    addNewRuleButton.addEventListener('click', () => {
      sessionStorage.removeItem('current-validation-rule');
    });
  }

  // create.html — restore checkboxes only when explicitly editing from summary
  const allQuestionCheckboxes = document.querySelectorAll('[data-select-question-checkbox]');
  if (allQuestionCheckboxes.length > 0) {
    const existingRule = getCurrentValidationRule();
    if (existingRule.editingQuestions) {
      const targetsToRestore = getSelectedTargets(existingRule);
      allQuestionCheckboxes.forEach((cb) => {
        const formId = cb.getAttribute('data-form-id') || '';
        const qCode = cb.getAttribute('data-question-code') || '';
        if (
          targetsToRestore.some(
            (q) => (q.formId ? q.formId === formId : true) && q.questionCode === qCode
          )
        ) {
          cb.checked = true;
        }
      });
    }
  }

  const createSaveContinueButton = document.getElementById('create-save-continue-button');
  if (createSaveContinueButton) {
    createSaveContinueButton.addEventListener('click', () => {
      const survey = getCurrentSurvey();
      const activeDataset = survey && survey.code === 'MBS' ? 'mbs' : 'dummy';
      const container = document.querySelector(`[data-form-dataset="${activeDataset}"]`) || document;
      const checkedBoxes = Array.from(container.querySelectorAll('[data-select-question-checkbox]:checked'));

      if (checkedBoxes.length > 0) {
        const selectedQuestions = checkedBoxes.map(getQuestionContextFromElement);
        const existingRule = getCurrentValidationRule();
        setCurrentValidationRule({
          ...selectedQuestions[0],
          ruleId: existingRule.ruleId || '',
          severity: existingRule.severity || 'error',
          errorMessage: existingRule.errorMessage || '',
          selectedQuestions,
          editingQuestions: false,
          templateCode: '',
          parameters: {}
        });
      }
    });
  }

  // rules.html — render paginated rule summary table from localStorage
  const ruleSummaryTable = document.getElementById('rule-summary-table');
  const ruleSummaryEmpty = document.getElementById('rule-summary-empty');
  const ruleSummaryPagination = document.getElementById('rule-summary-pagination');
  if (ruleSummaryTable) {
    const tbody = ruleSummaryTable.querySelector('tbody');
    const rules = getStoredRules();
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    if (rules.length === 0) {
      ruleSummaryTable.hidden = true;
      if (ruleSummaryEmpty) {
        ruleSummaryEmpty.hidden = false;
      }
      if (ruleSummaryPagination) {
        ruleSummaryPagination.hidden = true;
      }
    } else {
      ruleSummaryTable.hidden = false;
      if (ruleSummaryEmpty) {
        ruleSummaryEmpty.hidden = true;
      }

      if (tbody) {
        const configureUrl = `${rootPath}/views/configuration/rules/summary.html`;
        tbody.innerHTML = rules
          .map(
            (rule) => `<tr class="ons-table__row">
              <td class="ons-table__cell">${escapeHtml(rule.ruleId)}</td>
              <td class="ons-table__cell">${escapeHtml(rule.templateCode)}</td>
              <td class="ons-table__cell">${escapeHtml(rule.questionCode)}</td>
              <td class="ons-table__cell">${escapeHtml(rule.errorMessage || 'Validation check failed.')}</td>
              <td class="ons-table__cell"><a href="${configureUrl}" data-manage-rule-link data-rule-id="${escapeHtml(rule.ruleId)}">Manage</a></td>
            </tr>`
          )
          .join('');
      }

      ruleSummaryTable.querySelectorAll('[data-manage-rule-link]').forEach((link) => {
        link.addEventListener('click', () => {
          const ruleId = link.getAttribute('data-rule-id') || '';
          const matchedRule = rules.find((r) => r.ruleId === ruleId);
          if (matchedRule) {
            const restoredSelectedQuestions =
              Array.isArray(matchedRule.selectedQuestions) && matchedRule.selectedQuestions.length > 0
                ? matchedRule.selectedQuestions
                : [
                    {
                      formId: matchedRule.formId || 'form-1',
                      formTitle: matchedRule.formTitle || 'Form 1',
                      sourceFormId: formatFormId(matchedRule.sourceFormId),
                      questionCode: matchedRule.questionCode || 'Q100',
                      questionLabel: matchedRule.questionLabel || ''
                    }
                  ];

            setCurrentValidationRule({
              ...matchedRule,
              selectedQuestions: restoredSelectedQuestions,
              editingQuestions: false,
              parameters: matchedRule.parameters || {}
            });
          }
        });
      });

      if (ruleSummaryPagination) {
        ruleSummaryPagination.hidden = totalPages <= 1;

        const renderRuleSummaryPage = (page) => {
          const rows = Array.from(ruleSummaryTable.querySelectorAll('tbody tr'));
          const start = (page - 1) * itemsPerPage;
          const end = start + itemsPerPage;

          rows.forEach((row, idx) => {
            row.style.display = idx >= start && idx < end ? '' : 'none';
          });

          const positionEl = ruleSummaryPagination.querySelector('.ons-pagination__position');
          if (positionEl) {
            positionEl.textContent = `Page ${page} of ${totalPages}`;
          }

          const itemsList = ruleSummaryPagination.querySelector('.ons-pagination__items');
          if (itemsList) {
            let itemsHtml = '';
            if (page > 1) {
              itemsHtml += `<li class="ons-pagination__item ons-pagination__item--previous"><a href="#${page - 1}" class="ons-pagination__link ons-pagination__link--no-underline" rel="prev" data-page="${page - 1}"><span class="ons-pagination__link-text">Previous</span></a></li>`;
            }
            for (let p = 1; p <= totalPages; p += 1) {
              const currentCls = p === page ? ' ons-pagination__item--current' : '';
              const ariaCurrent = p === page ? ' aria-current="true"' : '';
              itemsHtml += `<li class="ons-pagination__item${currentCls}"><a href="#${p}" class="ons-pagination__link"${ariaCurrent} data-page="${p}">${p}</a></li>`;
            }
            if (page < totalPages) {
              itemsHtml += `<li class="ons-pagination__item ons-pagination__item--next"><a href="#${page + 1}" class="ons-pagination__link ons-pagination__link--no-underline" rel="next" data-page="${page + 1}"><span class="ons-pagination__link-text">Next</span></a></li>`;
            }
            itemsList.innerHTML = itemsHtml;

            itemsList.querySelectorAll('.ons-pagination__link').forEach((link) => {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = parseInt(link.getAttribute('data-page'), 10);
                if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
                  renderRuleSummaryPage(targetPage);
                }
              });
            });
          }
        };

        renderRuleSummaryPage(1);
      }
    }
  }

  // template.html — display selected questions and remember the template selected
  const templateSelectedQuestions = document.getElementById('template-selected-questions');
  if (templateSelectedQuestions) {
    const currentRule = getCurrentValidationRule();
    const selectedQuestions = Array.isArray(currentRule.selectedQuestions) && currentRule.selectedQuestions.length > 0
      ? currentRule.selectedQuestions
      : currentRule.questionCode
        ? [currentRule]
        : [];

    if (selectedQuestions.length > 0) {
      const codes = Array.from(new Set(selectedQuestions.map((q) => q.questionCode).filter(Boolean)));
      if (codes.length > 0) {
        const noun = codes.length === 1 ? 'question' : 'questions';
        templateSelectedQuestions.textContent = `You have selected the ${noun}: ${codes.join(', ')}`;
        templateSelectedQuestions.hidden = false;
      }
    }
  }

  const selectRuleButtons = document.querySelectorAll('[data-select-btn]');
  selectRuleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newTemplateCode = (btn.getAttribute('data-template-code') || '').toUpperCase();
      const existingRule = getCurrentValidationRule();
      const isSameTemplate = (existingRule.templateCode || '').toUpperCase() === newTemplateCode;
      setCurrentValidationRule({
        templateCode: newTemplateCode,
        parameters: isSameTemplate ? existingRule.parameters || {} : {}
      });
    });
  });

  // Template page — type-ahead search, ghost CTA group filters, single-select checkboxes, and pagination
  const templatePage = document.getElementById('template-page');
  const templateSearch = templatePage ? templatePage.querySelector('.ons-js-template-search') : null;

  if (templatePage && templateSearch) {
    const input = templateSearch.querySelector('.ons-js-autosuggest-input');
    const listbox = templateSearch.querySelector('.ons-js-autosuggest-listbox');
    const resultsTitle = templateSearch.querySelector('.ons-autosuggest__results-title');
    const instructions = templateSearch.querySelector('.ons-js-autosuggest-instructions');
    const ariaStatus = templateSearch.querySelector('.ons-js-autosuggest-aria-status');
    const noResultsMessage = templatePage.querySelector('#template-no-results');
    const templateTable = templatePage.querySelector('#template-selection-table');
    const templateTableContainer = templateTable
      ? templateTable.closest('.ons-table-scrollable') || templateTable
      : null;
    const templatePagination = templatePage.querySelector('#template-selection-pagination');
    const groupButtons = Array.from(templatePage.querySelectorAll('[data-template-group-btn]'));
    const saveContinueButton = templatePage.querySelector('#template-save-continue-button');
    const maxSuggestions = 10;
    const itemsPerPage = 10;
    let currentTemplatePage = 1;
    const selectedGroups = new Set();

    const tbody = templateTable ? templateTable.querySelector('tbody') : null;

    let items = Array.from(templatePage.querySelectorAll('[data-select-template-radio]')).map((radio) => {
      const code = radio.getAttribute('data-template-code') || '';
      const name = radio.getAttribute('data-template-name') || '';
      const group = radio.getAttribute('data-template-group') || '';
      const row = radio.closest('tr');

      return {
        row,
        radio,
        code,
        name,
        group,
        codeLower: code.toLowerCase(),
        nameLower: name.toLowerCase(),
        groupLower: group.toLowerCase()
      };
    });

    const syncTemplateRadioState = () => {
      const checkedItem = items.find((item) => item.radio.checked);

      if (checkedItem) {
        const newTemplateCode = checkedItem.code.toUpperCase();
        const existingRule = getCurrentValidationRule();
        const isSameTemplate = (existingRule.templateCode || '').toUpperCase() === newTemplateCode;
        setCurrentValidationRule({
          templateCode: newTemplateCode,
          parameters: isSameTemplate ? existingRule.parameters || {} : {}
        });
      }
    };

    const existingRuleForTemplate = getCurrentValidationRule();
    if (existingRuleForTemplate.templateCode) {
      const preselected = items.find(
        (item) => item.code.toUpperCase() === existingRuleForTemplate.templateCode.toUpperCase()
      );
      if (preselected) {
        preselected.radio.checked = true;
        if (tbody && preselected.row) {
          tbody.prepend(preselected.row);
        }
        items = [preselected, ...items.filter((item) => item !== preselected)];
      }
    }
    syncTemplateRadioState();

    items.forEach((item) => {
      item.radio.addEventListener('change', syncTemplateRadioState);
    });

    if (saveContinueButton) {
      saveContinueButton.addEventListener('click', () => {
        syncTemplateRadioState();
      });
    }

    let matches = [];
    let highlightedIndex = null;

    // Use the ONS autosuggest markup and initialisation styles without the
    // component's own remote-data behaviour.
    templateSearch.classList.add('ons-autosuggest--initialised');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listbox.getAttribute('id'));
    input.setAttribute(
      'aria-describedby',
      [input.getAttribute('aria-describedby'), instructions.getAttribute('id')].filter(Boolean).join(' ')
    );
    input.setAttribute('aria-haspopup', 'true');
    input.setAttribute('aria-owns', listbox.getAttribute('id'));
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('role', 'combobox');
    listbox.setAttribute('aria-labelledby', resultsTitle.getAttribute('id'));

    const setAriaStatus = (message) => {
      ariaStatus.textContent = message;
    };

    const closeListbox = () => {
      listbox.innerHTML = '';
      matches = [];
      highlightedIndex = null;
      templateSearch.classList.remove('ons-autosuggest--has-results');
      input.removeAttribute('aria-activedescendant');
      input.setAttribute('aria-expanded', 'false');
    };

    const findMatches = (query) => {
      const normalisedQuery = query.trim().toLowerCase();

      if (!normalisedQuery) {
        return [];
      }

      return items
        .filter((item) => selectedGroups.size === 0 || selectedGroups.has(item.group))
        .map((item) => {
          const codeIndex = item.codeLower.indexOf(normalisedQuery);
          const nameIndex = item.nameLower.indexOf(normalisedQuery);
          let rank = -1;

          if (item.codeLower === normalisedQuery) {
            rank = 0;
          } else if (codeIndex === 0) {
            rank = 1;
          } else if (codeIndex > 0) {
            rank = 2;
          } else if (nameIndex !== -1) {
            rank = 3;
          }

          return { item, rank };
        })
        .filter((match) => match.rank !== -1)
        .sort((a, b) => a.rank - b.rank || a.item.code.localeCompare(b.item.code));
    };

    const renderTemplateTable = (resetPage = false) => {
      const normalisedQuery = input.value.trim().toLowerCase();

      const matchingItems = items.filter((item) => {
        const matchesQuery =
          !normalisedQuery ||
          item.codeLower.includes(normalisedQuery) ||
          item.nameLower.includes(normalisedQuery) ||
          item.groupLower.includes(normalisedQuery);
        const matchesGroup = selectedGroups.size === 0 || selectedGroups.has(item.group);
        return matchesQuery && matchesGroup;
      });

      const totalPages = Math.max(1, Math.ceil(matchingItems.length / itemsPerPage));
      if (resetPage || currentTemplatePage > totalPages) {
        currentTemplatePage = 1;
      }

      const start = (currentTemplatePage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const visibleSet = new Set(matchingItems.slice(start, end));

      items.forEach((item) => {
        if (item.row) {
          item.row.hidden = !visibleSet.has(item);
          item.row.style.display = visibleSet.has(item) ? '' : 'none';
        }
      });

      if (templateTableContainer) {
        templateTableContainer.hidden = matchingItems.length === 0;
      }

      if (noResultsMessage) {
        noResultsMessage.hidden = matchingItems.length > 0;
      }

      if (templatePagination) {
        templatePagination.hidden = matchingItems.length === 0 || totalPages <= 1;

        const positionEl = templatePagination.querySelector('.ons-pagination__position');
        if (positionEl) {
          positionEl.textContent = `Page ${currentTemplatePage} of ${totalPages}`;
        }

        const itemsList = templatePagination.querySelector('.ons-pagination__items');
        if (itemsList) {
          let itemsHtml = '';
          if (currentTemplatePage > 1) {
            itemsHtml += `<li class="ons-pagination__item ons-pagination__item--previous"><a href="#${currentTemplatePage - 1}" class="ons-pagination__link ons-pagination__link--no-underline" rel="prev" data-page="${currentTemplatePage - 1}"><span class="ons-pagination__link-text">Previous</span></a></li>`;
          }
          for (let p = 1; p <= totalPages; p += 1) {
            const currentCls = p === currentTemplatePage ? ' ons-pagination__item--current' : '';
            const ariaCurrent = p === currentTemplatePage ? ' aria-current="true"' : '';
            itemsHtml += `<li class="ons-pagination__item${currentCls}"><a href="#${p}" class="ons-pagination__link"${ariaCurrent} data-page="${p}">${p}</a></li>`;
          }
          if (currentTemplatePage < totalPages) {
            itemsHtml += `<li class="ons-pagination__item ons-pagination__item--next"><a href="#${currentTemplatePage + 1}" class="ons-pagination__link ons-pagination__link--no-underline" rel="next" data-page="${currentTemplatePage + 1}"><span class="ons-pagination__link-text">Next</span></a></li>`;
          }
          itemsList.innerHTML = itemsHtml;

          itemsList.querySelectorAll('.ons-pagination__link').forEach((link) => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const targetPage = parseInt(link.getAttribute('data-page'), 10);
              if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
                currentTemplatePage = targetPage;
                renderTemplateTable(false);
              }
            });
          });
        }
      }
    };

    groupButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const groupName = btn.getAttribute('data-template-group-btn') || '';
        if (selectedGroups.has(groupName)) {
          selectedGroups.delete(groupName);
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        } else {
          selectedGroups.add(groupName);
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        }
        renderTemplateTable(true);
      });
    });

    const highlightMatch = (element, text, query) => {
      const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());

      if (matchIndex === -1) {
        element.textContent = text;
        return;
      }

      element.append(document.createTextNode(text.slice(0, matchIndex)));

      const strong = document.createElement('strong');
      strong.textContent = text.slice(matchIndex, matchIndex + query.length);
      element.append(strong, document.createTextNode(text.slice(matchIndex + query.length)));
    };

    const updateHighlight = () => {
      const options = Array.from(listbox.querySelectorAll('[role="option"]'));

      options.forEach((option, index) => {
        const isHighlighted = index === highlightedIndex;

        option.classList.toggle('ons-autosuggest__option--focused', isHighlighted);

        if (isHighlighted) {
          option.setAttribute('aria-selected', 'true');
          input.setAttribute('aria-activedescendant', option.id);
          setAriaStatus(`${matches[index].item.code}: ${matches[index].item.name}.`);
        } else {
          option.removeAttribute('aria-selected');
        }
      });

      if (highlightedIndex === null) {
        input.removeAttribute('aria-activedescendant');
      }
    };

    const selectMatch = (match) => {
      input.value = match.item.code;
      renderTemplateTable(true);
      closeListbox();
      setAriaStatus(`You have selected ${match.item.code}.`);

      if (match.item.radio && !match.item.radio.disabled) {
        match.item.radio.focus({ preventScroll: true });
      }
    };

    const renderSuggestions = (query) => {
      const normalisedQuery = query.trim();

      listbox.innerHTML = '';
      input.removeAttribute('aria-activedescendant');
      highlightedIndex = null;

      if (!normalisedQuery) {
        closeListbox();
        setAriaStatus('');
        return;
      }

      const allMatches = findMatches(normalisedQuery);
      matches = allMatches.slice(0, maxSuggestions);

      if (!matches.length) {
        const noResultsOption = document.createElement('li');
        noResultsOption.className = 'ons-autosuggest__option ons-autosuggest__option--no-results';
        noResultsOption.textContent = 'No templates found. Try a different template code.';
        listbox.appendChild(noResultsOption);

        resultsTitle.classList.add('ons-u-d-no');
        templateSearch.classList.add('ons-autosuggest--has-results');
        input.setAttribute('aria-expanded', 'true');
        setAriaStatus('No suggestions found.');
        return;
      }

      matches.forEach((match, index) => {
        const option = document.createElement('li');
        option.className = 'ons-autosuggest__option';
        option.id = `${listbox.getAttribute('id')}__option--${index}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-label', `${match.item.code}: ${match.item.name}`);

        const code = document.createElement('span');
        highlightMatch(code, match.item.code, normalisedQuery);

        const name = document.createElement('span');
        name.className = 'ons-autosuggest__category ons-u-lighter ons-u-fs-s ons-u-db';
        name.textContent = match.item.name;

        option.append(code, name);
        option.addEventListener('mousedown', (event) => event.preventDefault());
        option.addEventListener('click', () => selectMatch(match));

        listbox.appendChild(option);
      });

      resultsTitle.classList.remove('ons-u-d-no');
      templateSearch.classList.add('ons-autosuggest--has-results');
      input.setAttribute('aria-expanded', 'true');

      let statusMessage =
        allMatches.length === 1
          ? 'There is one suggestion available.'
          : `There are ${allMatches.length} suggestions available.`;

      if (allMatches.length > maxSuggestions) {
        statusMessage += ' Results have been limited to 10 suggestions. Type more characters to improve your search.';
      }

      setAriaStatus(statusMessage);
    };

    input.addEventListener('input', () => {
      const query = input.value;
      renderTemplateTable(true);
      renderSuggestions(query);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim()) {
        renderSuggestions(input.value);
      }
    });

    input.addEventListener('blur', () => {
      window.setTimeout(closeListbox, 100);
    });

    input.addEventListener('keydown', (event) => {
      const isOpen = templateSearch.classList.contains('ons-autosuggest--has-results');

      if (event.key === 'ArrowDown') {
        if (!isOpen && input.value.trim()) {
          event.preventDefault();
          renderSuggestions(input.value);
          highlightedIndex = 0;
          updateHighlight();
        } else if (matches.length) {
          event.preventDefault();
          highlightedIndex = highlightedIndex === null ? 0 : Math.min(highlightedIndex + 1, matches.length - 1);
          updateHighlight();
        }
      } else if (event.key === 'ArrowUp' && isOpen && matches.length) {
        event.preventDefault();
        highlightedIndex = highlightedIndex === null ? matches.length - 1 : Math.max(highlightedIndex - 1, 0);
        updateHighlight();
      } else if (event.key === 'Enter' && isOpen && highlightedIndex !== null && matches[highlightedIndex]) {
        event.preventDefault();
        selectMatch(matches[highlightedIndex]);
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeListbox();
      }
    });

    renderTemplateTable(true);
  }

  // configure.html — multi-template parameter form (VDLPGTX, QVQ, VRWV, QEZCGZ, VGZAQTC)
  if (window.location.pathname.includes('configure')) {
    const SUPPORTED_TEMPLATES = ['VDLPGTX', 'QVQ', 'VRWV', 'QEZCGZ', 'VGZAQTC'];
    const currentRule = getCurrentValidationRule();
    const templateCode = (currentRule.templateCode || 'VDLPGTX').toUpperCase();
    const isSupported = SUPPORTED_TEMPLATES.includes(templateCode);
    const primaryQuestionCode = currentRule.questionCode || 'Q100';

    const container = document.getElementById('configure-rule-container');
    const fallback = document.getElementById('configure-fallback');
    const templateCodeHeading = document.getElementById('configure-template-code');
    const templateNameEl = document.getElementById('configure-template-name');
    const fallbackTemplateCode = document.getElementById('configure-fallback-template-code');
    const fallbackTemplateName = document.getElementById('configure-fallback-template-name');
    const templateName = TEMPLATE_NAMES[templateCode] || '';

    if (container) {
      container.hidden = !isSupported;
    }

    if (fallback) {
      fallback.hidden = isSupported;
    }

    if (templateCodeHeading) {
      templateCodeHeading.textContent = templateCode;
    }

    if (templateNameEl) {
      templateNameEl.textContent = templateName;
      templateNameEl.hidden = !templateName;
    }

    if (fallbackTemplateCode) {
      fallbackTemplateCode.textContent = templateCode;
    }

    if (fallbackTemplateName) {
      fallbackTemplateName.textContent = templateName;
      fallbackTemplateName.hidden = !templateName;
    }

    if (isSupported) {
      document.querySelectorAll('[data-template-section]').forEach((section) => {
        section.hidden = section.getAttribute('data-template-section') !== templateCode;
      });

      const questionElement = document.getElementById('configure-question');
      const formElement = document.getElementById('configure-form');
      const form = document.getElementById('configure-rule-form');

      if (questionElement) {
        questionElement.textContent = formatQuestionSummary(currentRule, primaryQuestionCode);
      }

      if (formElement) {
        formElement.textContent = formatFormSummary(currentRule, 'Form 1 (009)');
      }

      const allCodesText = formatQuestionSummary(currentRule, primaryQuestionCode);
      document.querySelectorAll('[data-primary-qcode]').forEach((el) => {
        el.textContent = allCodesText;
      });

      document.querySelectorAll('[data-default-primary-qcode]').forEach((input) => {
        input.value = primaryQuestionCode;
      });

      const errorMessageInput = document.getElementById('rule-error-message');
      if (errorMessageInput && currentRule.errorMessage) {
        errorMessageInput.value = currentRule.errorMessage;
      }

      if (currentRule.severity) {
        const severityRadio = document.querySelector(`input[name="rule-severity"][value="${currentRule.severity}"]`);
        if (severityRadio) {
          severityRadio.checked = true;
        }
      }

      const getSelectedSeverity = () => {
        const checked = document.querySelector('input[name="rule-severity"]:checked');
        return checked ? checked.value : 'error';
      };

      const getValue = (id) => {
        const el = document.getElementById(id);
        return el && el.value !== undefined && el.value !== null ? el.value.trim() : '';
      };

      const setValue = (idOrName, value) => {
        if (value === undefined || value === null) {
          return;
        }
        const radioMatch = document.querySelector(
          `input[type="radio"][name="${idOrName}"][value="${value}"]`
        );
        if (radioMatch) {
          radioMatch.checked = true;
          return;
        }
        const el = document.getElementById(idOrName);
        if (el) {
          if (el.type === 'radio') {
            if (value === true || value === 'true' || el.value === value) {
              el.checked = true;
            }
          } else {
            el.value = value;
          }
        }
      };

      const restoreConfigureFormState = () => {
        const latestRule = getCurrentValidationRule();
        const latestParams = latestRule.parameters || {};

        // Prevent @ons/prototype-kit QuestionManager from overwriting configure form fields via sessionStorage[pathname]
        sessionStorage.removeItem(window.location.pathname);

        ['qvq-operator', 'vgzaqtc-operator'].forEach((opId) => {
          const opSelect = document.getElementById(opId);
          if (opSelect) {
            opSelect.selectedIndex = 0;
          }
        });

        ['vrwv-q2-qcode', 'vrwv-q3-qcode', 'vrwv-q4-qcode'].forEach((qId) => {
          setValue(qId, '');
        });

        [
          'vdlpgtx-question-type',
          'vdlpgtx-comparison-type',
          'qvq-question-type',
          'qvq-comparison-type',
          'vrwv-question-type',
          'vrwv-q2-type',
          'vrwv-q3-type',
          'vrwv-q4-type',
          'qezcgz-question-type',
          'qezcgz-comparison-type',
          'vgzaqtc-question-type',
          'vgzaqtc-comparison-type'
        ].forEach((radioGroupName) => {
          setValue(radioGroupName, 'response');
        });
        setValue('vdlpgtx-comparison-offset', '1');
        setValue('vdlpgtx-threshold-type', 'constant');
        setValue('vdlpgtx-threshold-value', '');
        setValue('vdlpgtx-percentage-value', '0');
        [
          'qvq-comparison-offset',
          'vrwv-q2-offset',
          'vrwv-q3-offset',
          'vrwv-q4-offset',
          'qezcgz-comparison-offset',
          'vgzaqtc-comparison-offset',
          'vgzaqtc-threshold'
        ].forEach((offsetOrThresholdId) => {
          setValue(offsetOrThresholdId, '0');
        });

        document.querySelectorAll('[data-default-primary-qcode]').forEach((input) => {
          input.value = primaryQuestionCode;
        });

        Object.entries(latestParams).forEach(([key, val]) => {
          if (
            key.endsWith('-response') ||
            key.endsWith('-adjustedresponse') ||
            key.endsWith('-constant') ||
            key.endsWith('-surveyconfig')
          ) {
            return;
          }
          setValue(key, val);
        });

        if (errorMessageInput) {
          errorMessageInput.value = latestRule.errorMessage || '';
        }

        if (latestRule.severity) {
          const severityRadio = document.querySelector(`input[name="rule-severity"][value="${latestRule.severity}"]`);
          if (severityRadio) {
            severityRadio.checked = true;
          }
        }
      };

      const savedParameters = currentRule.parameters || {};
      restoreConfigureFormState();
      // Re-apply after @ons/prototype-kit QuestionManager's setTimeout(0) so it cannot clobber restored values
      window.setTimeout(restoreConfigureFormState, 0);

      const formulaContent = document.getElementById('formula-content');

      const collectParameters = () => {
        const activeSection = document.querySelector(`[data-template-section="${templateCode}"]`);
        const params = {};
        if (activeSection) {
          activeSection.querySelectorAll('input[id], select[id]').forEach((el) => {
            if (el.type === 'radio') {
              if (el.checked && el.name) {
                params[el.name] = el.value;
              }
            } else {
              params[el.id] = el.value;
            }
          });
        }
        return params;
      };

      const persistDraftRuleState = () => {
        setCurrentValidationRule({
          templateCode,
          severity: getSelectedSeverity(),
          errorMessage: getValue('rule-error-message'),
          parameters: collectParameters()
        });
      };

      if (form) {
        form.addEventListener('input', persistDraftRuleState);
        form.addEventListener('change', persistDraftRuleState);
      }

      const toggleFormulaModeButton = document.getElementById('toggle-formula-mode-button');
      const toggleFormulaModeText = toggleFormulaModeButton
        ? toggleFormulaModeButton.querySelector('.ons-btn__text')
        : null;
      let showingBaseFormula = false;

      const updateToggleFormulaButtonText = () => {
        if (toggleFormulaModeText) {
          toggleFormulaModeText.textContent = showingBaseFormula
            ? 'Show templated formula'
            : 'Show base formula';
        }
      };

      const showInitialFormulaTemplate = () => {
        renderMultilineFormula(formulaContent, INITIAL_FORMULAS[templateCode] || '');
      };

      const computeUpdatedFormula = () => {
        const formulaStr = buildRuleFormulaString(templateCode, primaryQuestionCode, collectParameters());
        renderMultilineFormula(formulaContent, formulaStr);
      };

      const refreshFormula = () => {
        showingBaseFormula = false;
        updateToggleFormulaButtonText();
        computeUpdatedFormula();
        const parameters = collectParameters();

        setCurrentValidationRule({
          templateCode,
          severity: getSelectedSeverity(),
          errorMessage: getValue('rule-error-message'),
          parameters
        });

        const status = document.getElementById('configure-status');
        if (status) {
          status.textContent = 'Formula refreshed.';
          status.classList.remove('ons-u-vh');
        }
      };

      const refreshFormulaButton = document.getElementById('refresh-formula-button');
      if (refreshFormulaButton) {
        refreshFormulaButton.addEventListener('click', refreshFormula);
      }

      if (toggleFormulaModeButton) {
        toggleFormulaModeButton.addEventListener('click', () => {
          showingBaseFormula = !showingBaseFormula;
          updateToggleFormulaButtonText();
          if (showingBaseFormula) {
            showInitialFormulaTemplate();
          } else {
            computeUpdatedFormula();
          }
        });
      }

      computeUpdatedFormula();
      window.setTimeout(() => {
        if (!showingBaseFormula) {
          computeUpdatedFormula();
        }
      }, 0);

      const proceedToRuleSummary = () => {
        window.DONT_SUBMIT = true;
        persistDraftRuleState();
        window.location.href = `${rootPath}/views/configuration/rules/summary.html`;
      };

      const saveRuleButton = document.getElementById('save-rule-button');
      if (saveRuleButton) {
        saveRuleButton.addEventListener('click', (event) => {
          event.preventDefault();
          proceedToRuleSummary();
        });
      }

      if (form) {
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          proceedToRuleSummary();
        });
      }
    }
  }

  // summary.html — display rule summary and persist rule(s) on Save and continue
  if (window.location.pathname.includes('summary')) {
    const currentRule = getCurrentValidationRule();
    const templateCode = (currentRule.templateCode || 'VDLPGTX').toUpperCase();
    const primaryQuestionCode = currentRule.questionCode || 'Q100';
    const severity = currentRule.severity || 'error';
    const errorMessage = currentRule.errorMessage || 'Error message';
    const parameters = currentRule.parameters || {};

    const setSummaryRowText = (rowId, text) => {
      const el = document.querySelector(`#${rowId} .ons-summary__text`);
      if (el) {
        el.textContent = text;
      }
    };

    setSummaryRowText('summary-question-row', formatQuestionSummary(currentRule, primaryQuestionCode));
    setSummaryRowText('summary-form-row', formatFormSummary(currentRule, 'Form 1 (009)'));
    setSummaryRowText('summary-template-row', templateCode);
    setSummaryRowText('summary-severity-row', severity.charAt(0).toUpperCase() + severity.slice(1));
    setSummaryRowText('summary-message-row', errorMessage);

    const summaryFormulaEl = document.querySelector('#summary-formula-row .ons-summary__text');
    if (summaryFormulaEl) {
      summaryFormulaEl.classList.add('spp-formula-content');
      const formulaStr =
        Object.keys(parameters).length > 0
          ? buildRuleFormulaString(templateCode, primaryQuestionCode, parameters)
          : INITIAL_FORMULAS[templateCode] || '';
      renderMultilineFormula(summaryFormulaEl, formulaStr);
    }

    document.querySelectorAll('[data-summary-edit-question]').forEach((link) => {
      link.addEventListener('click', () => {
        setCurrentValidationRule({
          editingQuestions: true
        });
      });
    });

    const summarySaveButton = document.getElementById('summary-save-rule-button');
    if (summarySaveButton) {
      summarySaveButton.addEventListener('click', (event) => {
        event.preventDefault();
        const rules = getStoredRules();
        const defaultFormId = formatFormId(currentRule.sourceFormId);

        if (currentRule.ruleId) {
          const targets = getSelectedTargets(currentRule);
          const primaryTarget = targets[0] || currentRule;
          const existingIndex = rules.findIndex((r) => r.ruleId === currentRule.ruleId);
          if (existingIndex !== -1) {
            rules[existingIndex] = {
              ...rules[existingIndex],
              formId: primaryTarget.formId || rules[existingIndex].formId || 'form-1',
              formTitle: primaryTarget.formTitle || rules[existingIndex].formTitle || 'Form 1',
              sourceFormId: formatFormId(primaryTarget.sourceFormId || rules[existingIndex].sourceFormId || defaultFormId),
              templateCode,
              questionCode: primaryTarget.questionCode || primaryQuestionCode,
              questionLabel: primaryTarget.questionLabel || rules[existingIndex].questionLabel || '',
              selectedQuestions: targets,
              severity,
              errorMessage,
              parameters
            };
          } else {
            rules.push({
              ruleId: currentRule.ruleId,
              formId: primaryTarget.formId || 'form-1',
              formTitle: primaryTarget.formTitle || 'Form 1',
              sourceFormId: formatFormId(primaryTarget.sourceFormId || defaultFormId),
              questionCode: primaryTarget.questionCode || primaryQuestionCode,
              questionLabel: primaryTarget.questionLabel || '',
              selectedQuestions: targets,
              templateCode,
              severity,
              errorMessage,
              parameters
            });
          }
        } else {
          const targets = getSelectedTargets(currentRule);
          const effectiveTargets = targets.length > 0
            ? targets
            : [{
                formId: currentRule.formId || 'form-1',
                formTitle: currentRule.formTitle || 'Form 1',
                sourceFormId: defaultFormId,
                questionCode: primaryQuestionCode,
                questionLabel: currentRule.questionLabel || ''
              }];

          effectiveTargets.forEach((target) => {
            const nextId = getNextRuleId(rules);
            const normalizedTarget = {
              formId: target.formId || 'form-1',
              formTitle: target.formTitle || 'Form 1',
              sourceFormId: formatFormId(target.sourceFormId || defaultFormId),
              questionCode: target.questionCode || primaryQuestionCode,
              questionLabel: target.questionLabel || ''
            };
            rules.push({
              ruleId: nextId,
              ...normalizedTarget,
              selectedQuestions: [normalizedTarget],
              templateCode,
              severity,
              errorMessage,
              parameters
            });
          });
        }

        saveStoredRules(rules);
        sessionStorage.removeItem('current-validation-rule');
        window.location.href = `${rootPath}/views/configuration/rules/rules.html`;
      });
    }
  }
});
