// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const uploadSection = document.getElementById('uploadSection');
const diagramSection = document.getElementById('diagramSection');
const typedBtn = document.getElementById('typedBtn');
const handwrittenBtn = document.getElementById('handwrittenBtn');
const form = document.getElementById('uploadForm');
const diagramForm = document.getElementById('diagramForm');
const output = document.getElementById('output');
const summaryOutput = document.getElementById('summaryOutput');
const questionsOutput = document.getElementById('questionsOutput');
const explanationText = document.getElementById('explanationText');
const processingIndicator = document.getElementById('processingIndicator');
const diagramProcessing = document.getElementById('diagramProcessing');
const summaryProcessing = document.getElementById('summaryProcessing');
const questionsProcessing = document.getElementById('questionsProcessing');
const successIndicator = document.getElementById('successIndicator');
const diagramSuccess = document.getElementById('diagramSuccess');
const errorIndicator = document.getElementById('errorIndicator');
const diagramError = document.getElementById('diagramError');
const dropzone = document.getElementById('dropzone');
const dropzoneFile = document.getElementById('dropzone-file');
const diagramDropzone = document.getElementById('diagramDropzone');
const diagramFileInput = document.getElementById('diagram-file');
const filePreview = document.getElementById('filePreview');
const diagramPreview = document.getElementById('diagramPreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const diagramFileName = document.getElementById('diagramFileName');
const diagramFileSize = document.getElementById('diagramFileSize');
const contentTabs = document.getElementById('contentTabs');
const explanationOutput = document.getElementById('explanationOutput');
const errorMessage = document.getElementById('errorMessage');
const diagramErrorMessage = document.getElementById('diagramErrorMessage');

// Current active tab
let currentTab = 'extractedText';

// Theme Toggle
function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

// Upload Section Functions
function showUploadOptions() {
  uploadSection.classList.remove('hidden');
  diagramSection.classList.add('hidden');
  uploadSection.scrollIntoView({ behavior: 'smooth' });
}

function hideUploadOptions() {
  uploadSection.classList.add('hidden');
}

// Diagram Section Functions
function showDiagramExplanation() {
  diagramSection.classList.remove('hidden');
  uploadSection.classList.add('hidden');
  diagramSection.scrollIntoView({ behavior: 'smooth' });
}

function hideDiagramExplanation() {
  diagramSection.classList.add('hidden');
}

function toggleForm(type) {
  if (type === 'typed') {
    typedBtn.classList.remove('bg-primary-100', 'dark:bg-primary-900/30', 'text-primary-700', 'dark:text-primary-300');
    typedBtn.classList.add('bg-primary-600', 'text-white');
    handwrittenBtn.classList.remove('bg-primary-600', 'text-white');
    handwrittenBtn.classList.add('bg-primary-100', 'dark:bg-primary-900/30', 'text-primary-700', 'dark:text-primary-300');
  } else {
    handwrittenBtn.classList.remove('bg-primary-100', 'dark:bg-primary-900/30', 'text-primary-700', 'dark:text-primary-300');
    handwrittenBtn.classList.add('bg-primary-600', 'text-white');
    typedBtn.classList.remove('bg-primary-600', 'text-white');
    typedBtn.classList.add('bg-primary-100', 'dark:bg-primary-900/30', 'text-primary-700', 'dark:text-primary-300');
  }
}

// File Handling
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleFileSelect(event) {
  if (!event.target.files || !event.target.files[0]) return;
  
  const file = event.target.files[0];
  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit', 'error');
    return;
  }
  
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  filePreview.classList.remove('hidden');
  dropzone.classList.add('hidden');
}

function handleDiagramFileSelect(event) {
  if (!event.target.files || !event.target.files[0]) return;
  
  const file = event.target.files[0];
  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit', 'error');
    return;
  }
  
  diagramFileName.textContent = file.name;
  diagramFileSize.textContent = formatFileSize(file.size);
  diagramPreview.classList.remove('hidden');
  diagramDropzone.classList.add('hidden');
  
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.classList.remove('hidden');
    }
    reader.readAsDataURL(file);
  } else {
    imagePreviewContainer.classList.add('hidden');
  }
}

function clearFile() {
  dropzoneFile.value = '';
  filePreview.classList.add('hidden');
  dropzone.classList.remove('hidden');
}

function clearDiagramFile() {
  diagramFileInput.value = '';
  diagramPreview.classList.add('hidden');
  diagramDropzone.classList.remove('hidden');
  imagePreviewContainer.classList.add('hidden');
}

function clearAll() {
  clearFile();
  output.value = '';
  summaryOutput.value = '';
  questionsOutput.value = '';
  contentTabs.classList.add('hidden');
  hideIndicators();
}

function clearDiagramAll() {
  clearDiagramFile();
  explanationText.value = '';
  explanationOutput.classList.add('hidden');
  hideDiagramIndicators();
}

// Drag and Drop Handling
function setupDropzone(element, dropzoneElement, fileInput, previewCallback) {
  if (!element || !dropzoneElement || !fileInput) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    element.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    element.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    element.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropzoneElement.classList.add('dropzone-active');
  }

  function unhighlight() {
    dropzoneElement.classList.remove('dropzone-active');
  }

  element.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    previewCallback({ target: { files } });
  }
}

// Tab Functions
function showTab(tabId) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  const tabElement = document.getElementById(tabId);
  if (tabElement) tabElement.classList.add('active');
  
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('tab-active');
  });
  
  if (event.currentTarget) event.currentTarget.classList.add('tab-active');
  currentTab = tabId;
}

// Text Processing Functions
function copyToClipboard(sourceId) {
  let textToCopy;
  if (sourceId === 'extractedText' && output) {
    textToCopy = output.value;
  } else if (sourceId === 'summary' && summaryOutput) {
    textToCopy = summaryOutput.value;
  } else if (sourceId === 'questions' && questionsOutput) {
    textToCopy = questionsOutput.value;
  } else if (sourceId === 'explanationText' && explanationText) {
    textToCopy = explanationText.value;
  } else {
    const element = document.getElementById(sourceId);
    textToCopy = element ? element.value : '';
  }
  
  if (!textToCopy) {
    showToast('No text to copy', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Text copied to clipboard!', 'success');
  }).catch(err => {
    showToast('Failed to copy text', 'error');
    console.error('Failed to copy text: ', err);
  });
}

function downloadText(sourceId) {
  let textToDownload, filename;
  
  if (sourceId === 'extractedText' && output) {
    textToDownload = output.value;
    filename = 'extracted-text.txt';
  } else if (sourceId === 'summary' && summaryOutput) {
    textToDownload = summaryOutput.value;
    filename = 'document-summary.txt';
  } else if (sourceId === 'questions' && questionsOutput) {
    textToDownload = questionsOutput.value;
    filename = 'important-questions.txt';
  } else if (sourceId === 'explanationText' && explanationText) {
    textToDownload = explanationText.value;
    filename = 'diagram-explanation.txt';
  } else {
    const element = document.getElementById(sourceId);
    textToDownload = element ? element.value : '';
    filename = 'download.txt';
  }
  
  if (!textToDownload) {
    showToast('No text to download', 'warning');
    return;
  }
  
  const blob = new Blob([textToDownload], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Text downloaded successfully!', 'success');
}

function hideIndicators() {
  if (processingIndicator) processingIndicator.classList.add('hidden');
  if (successIndicator) successIndicator.classList.add('hidden');
  if (errorIndicator) errorIndicator.classList.add('hidden');
  if (summaryProcessing) summaryProcessing.classList.add('hidden');
  if (questionsProcessing) questionsProcessing.classList.add('hidden');
}

function hideDiagramIndicators() {
  if (diagramProcessing) diagramProcessing.classList.add('hidden');
  if (diagramSuccess) diagramSuccess.classList.add('hidden');
  if (diagramError) diagramError.classList.add('hidden');
}

// Toast Notification
function showToast(message, type = 'info') {
  let background;
  switch(type) {
    case 'success':
      background = 'linear-gradient(to right, #10b981, #059669)';
      break;
    case 'error':
      background = 'linear-gradient(to right, #ef4444, #dc2626)';
      break;
    case 'warning':
      background = 'linear-gradient(to right, #f59e0b, #d97706)';
      break;
    default:
      background = 'linear-gradient(to right, #3b82f6, #2563eb)';
  }
  
  Toastify({
    text: message,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: background,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
  }).showToast();
}

// Generate Summary
async function generateSummary() {
  if (!output || !output.value) {
    showToast('Please extract text first', 'warning');
    return;
  }
  
  if (summaryProcessing) summaryProcessing.classList.remove('hidden');
  if (summaryOutput) summaryOutput.value = '';
  
  try {
    const response = await fetch('/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: output.value })
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (summaryOutput) summaryOutput.value = result.summary || "No summary generated.";
    showToast('Summary generated successfully!', 'success');
  } catch (error) {
    if (summaryOutput) summaryOutput.value = `Error: ${error.message}`;
    showToast('Error generating summary', 'error');
    console.error('Error:', error);
  } finally {
    if (summaryProcessing) summaryProcessing.classList.add('hidden');
  }
}

// Generate Questions
async function generateQuestions() {
  if (!output || !output.value) {
    showToast('Please extract text first', 'warning');
    return;
  }
  
  if (questionsProcessing) questionsProcessing.classList.remove('hidden');
  if (questionsOutput) questionsOutput.value = '';
  
  try {
    const response = await fetch('/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: output.value })
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (questionsOutput) questionsOutput.value = result.questions || "No questions generated.";
    showToast('Questions generated successfully!', 'success');
  } catch (error) {
    if (questionsOutput) questionsOutput.value = `Error: ${error.message}`;
    showToast('Error generating questions', 'error');
    console.error('Error:', error);
  } finally {
    if (questionsProcessing) questionsProcessing.classList.add('hidden');
  }
}

// Form Submission with Streaming Response
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!dropzoneFile || !dropzoneFile.files || !dropzoneFile.files.length) {
      showToast('Please select a file first', 'warning');
      return;
    }
    
    const formData = new FormData(form);
    
    if (output) output.value = "";
    if (summaryOutput) summaryOutput.value = "";
    if (questionsOutput) questionsOutput.value = "";
    hideIndicators();
    if (processingIndicator) processingIndicator.classList.remove('hidden');
    
    try {
      const response = await fetch('/extract', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const textChunk = decoder.decode(value);
        if (output) {
          output.value += textChunk;
          // Auto-scroll to bottom
          output.scrollTop = output.scrollHeight;
        }
      }
      
      if (contentTabs) contentTabs.classList.remove('hidden');
      if (successIndicator) successIndicator.classList.remove('hidden');
      showToast('Text extraction completed successfully!', 'success');
    } catch (error) {
      if (output) output.value = `Error: ${error.message}`;
      if (errorIndicator) errorIndicator.classList.remove('hidden');
      if (errorMessage) errorMessage.textContent = error.message;
      showToast('Error during text extraction', 'error');
      console.error('Error:', error);
    } finally {
      if (processingIndicator) processingIndicator.classList.add('hidden');
    }
  });
}

// Diagram Form Submission
if (diagramForm) {
  diagramForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!diagramFileInput || !diagramFileInput.files || !diagramFileInput.files.length) {
      showToast('Please select an image first', 'warning');
      return;
    }
    
    const formData = new FormData(diagramForm);
    
    if (explanationText) explanationText.value = "";
    hideDiagramIndicators();
    if (diagramProcessing) diagramProcessing.classList.remove('hidden');
    if (explanationOutput) explanationOutput.classList.add('hidden');
    
    try {
      const response = await fetch('/explain-diagram', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (explanationText) explanationText.value = result.explanation || "No explanation generated.";
      if (explanationOutput) explanationOutput.classList.remove('hidden');
      if (diagramSuccess) diagramSuccess.classList.remove('hidden');
      showToast('Diagram explained successfully!', 'success');
    } catch (error) {
      if (explanationText) explanationText.value = `Error: ${error.message}`;
      if (diagramError) diagramError.classList.remove('hidden');
      if (diagramErrorMessage) diagramErrorMessage.textContent = error.message;
      showToast('Error during diagram explanation', 'error');
      console.error('Error:', error);
    } finally {
      if (diagramProcessing) diagramProcessing.classList.add('hidden');
    }
  });
}

// Event Listeners
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (dropzoneFile) dropzoneFile.addEventListener('change', handleFileSelect);
if (diagramFileInput) diagramFileInput.addEventListener('change', handleDiagramFileSelect);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  toggleForm('typed');
  
  if (dropzone && dropzoneFile) {
    setupDropzone(dropzone, dropzone, dropzoneFile, handleFileSelect);
  }
  
  if (diagramDropzone && diagramFileInput) {
    setupDropzone(diagramDropzone, diagramDropzone, diagramFileInput, handleDiagramFileSelect);
  }
  
  // Check for diagram parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const diagramParam = urlParams.get('diagram');
  if (diagramParam) {
    showDiagramExplanation();
  }
});