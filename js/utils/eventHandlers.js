import { showLoading, hideLoading, updatePreview, showError } from './uiHelpers.js';
import { readFileAsArrayBuffer } from '../services/pdfService.js';
import { splitPdf } from '../pdfSplitter.js';
import { performOCR } from '../ocrProcessor.js';
import { generateNotes } from '../notesGenerator.js';

let uploadedPdfBytes = null;
let ocrText = "";

export function setupEventListeners(elements) {
  setupFileUploadHandler(elements);
  setupSplitButtonHandler(elements);
  setupNotesButtonHandler(elements);
}

function setupFileUploadHandler(elements) {
  elements.pdfUpload.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        showLoading(elements.loadingIndicator);
        uploadedPdfBytes = await readFileAsArrayBuffer(file);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        showError(elements.ocrTextPreview, "Failed to load the PDF. Please try again.");
      } finally {
        hideLoading(elements.loadingIndicator);
      }
    }
  });
}

function setupSplitButtonHandler(elements) {
  elements.splitButton.addEventListener("click", async () => {
    const start = parseInt(elements.startPage.value, 10);
    const end = parseInt(elements.endPage.value, 10);
    
    if (!validateSplitInput(uploadedPdfBytes, start, end)) {
      showError(elements.ocrTextPreview, "Invalid input. Upload a PDF and specify a valid range.");
      return;
    }
    
    try {
      showLoading(elements.loadingIndicator);
      updatePreview(elements.ocrTextPreview, "Processing", "Splitting PDF and performing OCR...");
      
      const splitPdfBytes = await splitPdf(uploadedPdfBytes, start, end);
      ocrText = await performOCR(splitPdfBytes);
      
      updatePreview(elements.ocrTextPreview, "OCR Text Preview", ocrText);
      elements.notesControls.style.display = "block";
    } catch (error) {
      console.error("Error processing PDF:", error);
      showError(elements.ocrTextPreview, "Failed to process the PDF. Please try again.");
    } finally {
      hideLoading(elements.loadingIndicator);
    }
  });
}

function setupNotesButtonHandler(elements) {
  elements.notesButton.addEventListener("click", async () => {
    if (!ocrText) {
      showError(elements.ocrTextPreview, "No OCR text available. Process a PDF first.");
      return;
    }
    
    try {
      showLoading(elements.loadingIndicator);
      updatePreview(elements.ocrTextPreview, "Notes Progress", "Generating notes...");
      const notes = await generateNotes(ocrText);
      updatePreview(elements.ocrTextPreview, "Generated Notes", notes);
    } catch (error) {
      console.error("Error generating notes:", error);
      showError(elements.ocrTextPreview, `Failed to generate notes. Error: ${error.message}`);
    } finally {
      hideLoading(elements.loadingIndicator);
    }
  });
}

function validateSplitInput(pdfBytes, start, end) {
  return pdfBytes && !isNaN(start) && !isNaN(end) && start > 0 && end >= start;
}