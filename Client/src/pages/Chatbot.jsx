import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Import Auth Context
import Onboarding from './Onboarding'; // Import Onboarding component
import DOMPurify from 'dompurify'; // For sanitizing HTML
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import MobileNavigation from '../components/MobileNavigation';

const formatBotMessage = (text) => {
  if (!text) return '';
  
  // Process code blocks with language detection for syntax highlighting
  let formattedText = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, language, codeContent) => {
    const sanitizedCode = DOMPurify.sanitize(codeContent);
    const lang = language ? language.trim() : '';
    const langClass = lang ? ` language-${lang}` : '';
    
    // Check if this is a greeting message (typically very short)
    const isGreeting = text.length < 20;
    
    // Generate a unique ID for this code block
    const codeId = `code-${Math.random().toString(36).substring(2, 10)}`;
    
    return `<div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 my-3 overflow-x-auto font-mono text-sm border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs text-gray-800 dark:text-white font-medium">${lang ? lang.toUpperCase() : 'CODE'}</span>
        ${!isGreeting ? `<button class="text-xs text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors" title="Copy code" onclick="(function() {
          const codeElement = document.getElementById('${codeId}');
          if (codeElement) {
            navigator.clipboard.writeText(codeElement.textContent);
            // Show copy feedback
            const btn = this;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'currentColor\' viewBox=\'0 0 16 16\'><path d=\'M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z\'/></svg>';
            setTimeout(() => {
              btn.innerHTML = originalHTML;
            }, 2000);
          }
        }).call(this)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
          </svg>
        </button>` : ''}
      </div>
      <pre class="m-0 p-0 bg-transparent border-0${langClass}"><code id="${codeId}" class="text-gray-800 dark:text-white${langClass}">${sanitizedCode}</code></pre>
    </div>`;
  });
  
  // Process inline code with improved styling
  formattedText = formattedText.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md font-mono text-sm text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">${code}</code>`;
  });
  
  // Special handler for investment tables with enhanced styling
  const isInvestmentTable = (match) => {
    // Check if this looks like an investment table by examining the header row
    const headerRow = match.split('\n')[0] || '';
    const headerCells = headerRow.split('|').map(cell => cell.trim().toLowerCase());
    
    // Look for investment-related keywords in the header
    const investmentKeywords = ['investment', 'fund', 'risk', 'returns', 'minimum'];
    return investmentKeywords.some(keyword => 
      headerCells.some(cell => cell.includes(keyword))
    );
  };
  
  // Process investment tables with premium styling - improved regex to detect tables within paragraphs
  formattedText = formattedText.replace(/(?:^|\n)(\|(.+)\|\s*\n\|\s*[-:\s]+\|\s*\n((\|.+\|\s*\n)+))/g, (match, tableContent) => {
    // Extract table content
    const tableRows = match.split('\n').filter(row => row.trim() !== '');
    
    if (tableRows.length < 2) return match; // Not a valid table
    
    const headerRow = tableRows[0];
    const alignmentRow = tableRows[1];
    const dataRows = tableRows.slice(2);
    
    // Extract header cells
    const headerCells = headerRow.split('|').slice(1, -1).map(cell => cell.trim());
    
    // Extract alignment information
    const alignments = alignmentRow.split('|').slice(1, -1).map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'text-center';
      if (trimmed.endsWith(':')) return 'text-right';
      return 'text-left';
    });
    
    // Ensure alignments array has same length as headerCells
    while (alignments.length < headerCells.length) {
      alignments.push('text-left');
    }
    
    // Generate a unique ID for this table
    const tableId = `table-${Math.random().toString(36).substring(2, 10)}`;
    
    // Check if this is an investment table
    const isInvestmentData = isInvestmentTable(match);
    
    // Build table HTML with enhanced Notion-like styling
    let tableHtml = `<div class="relative overflow-hidden my-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <!-- Table Loading State -->
      <div class="table-loading-state absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 z-10" style="transition: opacity 0.5s ease-out;">
        <div class="typing-indicator mb-2">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-300">Preparing table data...</div>
      </div>
      
      <!-- Table Toolbar -->
      <div class="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-medium text-gray-800 dark:text-white">Table</span>
          <span class="text-xs text-gray-800 dark:text-white">${headerCells.length} columns</span>
        </div>
        <div class="flex items-center space-x-2">
          <button class="text-xs text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Toggle compact view" onclick="(function() { try { const table = document.getElementById('${tableId}'); if(table) { table.classList.toggle('compact-table'); } } catch(error) { console.error('Error toggling compact view:', error); } }).call(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
            </svg>
          </button>
          <button class="text-xs text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Copy table data" onclick="(function() {
            try {
              const table = document.getElementById('${tableId}');
              if (table) {
                const rows = table.querySelectorAll('tr');
                let text = '';
                rows.forEach(row => {
                  const cells = row.querySelectorAll('th, td');
                  const rowData = [];
                  cells.forEach(cell => rowData.push(cell.textContent.trim()));
                  text += rowData.join('\t') + '\n';
                });
                navigator.clipboard.writeText(text);
                // Show copy feedback
                const btn = this;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' fill=\'currentColor\' viewBox=\'0 0 16 16\'><path d=\'M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z\'/></svg>';
                setTimeout(() => {
                  btn.innerHTML = originalHTML;
                }, 2000);
              }
            } catch (error) {
              console.error('Error copying table data:', error);
            }
          }).call(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table id="${tableId}" class="min-w-full border-collapse bg-white dark:bg-gray-800 table-fixed md:table-auto" style="opacity: 0; transition: opacity 0.5s ease-in;">`;
    
    // Add header row with improved styling
    tableHtml += '<thead>';
    tableHtml += `<tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">`;
    headerCells.forEach((cell, index) => {
      const alignment = alignments[index] || 'text-left';
      tableHtml += `<th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold ${alignment} text-gray-800 dark:text-white text-sm uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 shadow-sm backdrop-blur-sm backdrop-filter">${cell}</th>`; // Enhanced Notion-like header
    });
    tableHtml += '</tr></thead>';
    
    // Add data rows with single background color and hover effects
    tableHtml += '<tbody class="divide-y divide-gray-200 dark:divide-gray-700">';
    dataRows.forEach((row, rowIndex) => {
      const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
      const rowClass = 'bg-white dark:bg-gray-800';
      tableHtml += `<tr class="${rowClass} hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors">`;
      
      cells.forEach((cell, index) => {
        const alignment = alignments[index] || 'text-left';
        
        // Simple cell formatting with consistent colors
        let formattedCell = cell;
        
        // Check if cell contains HTML content (like bullet points)
        const containsHTML = /<[a-z][\s\S]*>/i.test(cell);
        
        // If cell already has HTML, use it directly with minimal formatting
        if (containsHTML) {
          // Apply basic styling to the container but preserve the HTML content
          formattedCell = `<div class="table-cell-content">${cell}</div>`;
        } else {
          // Apply consistent styling for all cells
          formattedCell = `<span class="font-medium">${cell}</span>`;
        }
            
        // Process bullet points within cells (lines starting with - or *)
        if (cell.includes('\n')) {
          const lines = cell.split('\n');
          const hasBulletPoints = lines.some(line => /^\s*[-*]\s+/.test(line.trim()));
          
          if (hasBulletPoints) {
            // Create a proper unordered list for bullet points
            formattedCell = '<ul class="list-disc pl-5 py-1 space-y-1.5">';
            let inSubList = false;
            
            lines.forEach(line => {
              const trimmedLine = line.trim();
              if (/^\s*[-*]\s+/.test(trimmedLine)) {
                // This is a bullet point
                const bulletContent = trimmedLine.replace(/^\s*[-*]\s+/, '');
                
                // Check if bullet content has sub-bullets (indented bullets)
                if (bulletContent.includes('  - ') || bulletContent.includes('  * ')) {
                  // Handle sub-bullets by creating a nested structure
                  const mainContent = bulletContent.split('  - ')[0].split('  * ')[0].trim();
                  
                  // Close previous sublist if open
                  if (inSubList) {
                    formattedCell += '</ul></li>';
                    inSubList = false;
                  }
                  
                  // Start new main bullet with nested list
                  formattedCell += `<li class="mb-1.5 font-medium">${mainContent}`;
                  
                  // Add sub-bullets with proper indentation
                  const subBullets = bulletContent.match(/\s\s[-*]\s+([^\n]+)/g) || [];
                  if (subBullets.length > 0) {
                    formattedCell += `<ul class="list-circle pl-4 mt-1.5 space-y-1">`;
                    inSubList = true;
                    
                    subBullets.forEach(subBullet => {
                      const subContent = subBullet.replace(/^\s*[-*]\s+/, '').trim();
                      formattedCell += `<li class="text-gray-800 dark:text-white">${subContent}</li>`;
                    });
                  }
                } else {
                  // Close previous sublist if open
                  if (inSubList) {
                    formattedCell += '</ul></li>';
                    inSubList = false;
                  }
                  
                  // Regular bullet point
                  formattedCell += `<li class="font-medium text-gray-800 dark:text-white">${bulletContent}</li>`;
                }
              } else if (trimmedLine) {
                // Close previous sublist if open
                if (inSubList) {
                  formattedCell += '</ul></li>';
                  inSubList = false;
                }
                
                // Regular paragraph
                formattedCell += `<li class="!list-none font-medium text-gray-800 dark:text-white">${trimmedLine}</li>`;
              }
            });
            
            // Close any open sublists
            if (inSubList) {
              formattedCell += '</ul></li>';
            }
            
            formattedCell += '</ul>';
          } else {
            // For multi-line text without bullet points, format as paragraphs
            formattedCell = '<div class="space-y-2">';
                lines.forEach(line => {
                  if (line.trim()) {
                    formattedCell += `<p class="font-medium text-gray-800 dark:text-white">${line.trim()}</p>`;
                  }
                });
            formattedCell += '</div>';
          }
        }
        
        tableHtml += `<td class="px-4 py-3 whitespace-normal border-t-0 ${alignment} text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
          <div class="table-cell ${cell.includes('\n') ? 'space-y-1.5' : ''}">${formattedCell}</div>
        </td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    
    // Add script to handle table loading animation
    tableHtml += `
      <script>
        (function() {
          // Hide loading state and show table after a short delay
          setTimeout(() => {
            const tableElement = document.getElementById('${tableId}');
            const loadingState = tableElement.parentNode.parentNode.querySelector('.table-loading-state');
            
            if (tableElement && loadingState) {
              // Show table with fade-in effect
              tableElement.style.opacity = '1';
              
              // Hide loading state with fade-out effect
              loadingState.style.opacity = '0';
              setTimeout(() => {
                loadingState.style.display = 'none';
              }, 500);
              
              // Animate rows appearing one by one
              const rows = tableElement.querySelectorAll('tbody tr');
              rows.forEach((row, index) => {
                row.style.display = 'none';
              });
              
              let currentIndex = 0;
              function showNextRow() {
                if (currentIndex < rows.length) {
                  rows[currentIndex].style.display = '';
                  rows[currentIndex].style.animation = 'fadeIn 0.2s ease-in';
                  currentIndex++;
                  setTimeout(showNextRow, 50);
                }
              }
              
              // Start showing rows after table is visible
              setTimeout(showNextRow, 300);
            }
          }, 800); // Delay before starting animation
        })();
      </script>
    `;
    
    // Add CSS for compact view toggle and investment cell styling
    tableHtml += `
      <style>
        #${tableId}.compact-table td { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        #${tableId}.compact-table th { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Table cell styling */
        .table-cell { width: 100%; }
        .table-cell-content { width: 100%; }
        .table-cell ul { margin-top: 0.5rem; margin-bottom: 0.5rem; padding-left: 1.5rem; }
        .table-cell li { margin-bottom: 0.375rem; }
        .table-cell p { margin-bottom: 0.5rem; }
        
        /* Bullet list styling */
        .table-cell ul { list-style-position: outside; }
        .table-cell ul.list-disc { list-style-type: disc; }
        .table-cell ul.list-circle { list-style-type: circle; }
        .table-cell li.!list-none { list-style-type: none; }
        .table-cell .space-y-1 > * { margin-top: 0.25rem; margin-bottom: 0.25rem; }
          .table-cell .space-y-1\.5 > * { margin-top: 0.375rem; margin-bottom: 0.375rem; }
        .table-cell .space-y-2 > * { margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .table-cell .space-y-0\.5 > * { margin-top: 0.125rem; margin-bottom: 0.125rem; }
        .table-cell .pl-4 { padding-left: 1rem; }
        .table-cell .pl-5 { padding-left: 1.25rem; }
        .table-cell .mt-1 { margin-top: 0.25rem; }
          .table-cell .mt-1\.5 { margin-top: 0.375rem; }
        .table-cell .mb-1 { margin-bottom: 0.25rem; }
          .table-cell .mb-1\.5 { margin-bottom: 0.375rem; }
      </style>
    `;
    
    // Add footer for tables
    if (isInvestmentData) {
      tableHtml += `
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-white rounded-b-lg">
          <div class="flex items-center justify-between">
            <span>Data as of ${new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</span>
            <div class="flex space-x-2">
              <button class="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors font-medium text-xs flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
              <button class="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors font-medium text-xs flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      `;
    }
    
    tableHtml += `
      <script>
        (function() {
          // Hide loading state and show table after a short delay
          setTimeout(() => {
            const tableElement = document.getElementById('${tableId}');
            const loadingState = tableElement.parentNode.parentNode.querySelector('.table-loading-state');
            
            if (tableElement && loadingState) {
              // Show table with fade-in effect
              tableElement.style.opacity = '1';
              
              // Hide loading state with fade-out effect
              loadingState.style.opacity = '0';
              setTimeout(() => {
                loadingState.style.display = 'none';
              }, 500);
              
              // Animate rows appearing one by one
              const rows = tableElement.querySelectorAll('tbody tr');
              rows.forEach((row, index) => {
                row.style.display = 'none';
              });
              
              let currentIndex = 0;
              function showNextRow() {
                if (currentIndex < rows.length) {
                  rows[currentIndex].style.display = '';
                  rows[currentIndex].style.animation = 'fadeIn 0.2s ease-in';
                  currentIndex++;
                  setTimeout(showNextRow, 50);
                }
              }
              
              // Start showing rows after table is visible
              setTimeout(showNextRow, 300);
            }
          }, 800); // Delay before starting animation
        })();
      </script>
    `;
    
    tableHtml += '</div>';
    
    return tableHtml;
  });
  
  // Handle tables with no header row (simplified tables) - improved regex to detect tables within paragraphs
  formattedText = formattedText.replace(/(?:^|\n)(\|(.+)\|\s*\n(\|.+\|\s*\n)+)/gm, (match, tableContent) => {
    if (tableContent.includes('|-')) return match; // Skip if already processed by the previous regex
    
    // Extract table content
    const tableRows = match.split('\n').filter(row => row.trim() !== '');
    if (tableRows.length < 1) return match;
    
    // Generate a unique ID for this table
    const tableId = `table-${Math.random().toString(36).substring(2, 10)}`;
    
    // Calculate number of columns from first row
    const firstRow = tableRows[0];
    const columnCount = firstRow.split('|').filter(cell => cell.trim() !== '').length;
    
    // Check if this is an investment table
    const isInvestmentData = isInvestmentTable(match);
    
    // Build table HTML with enhanced Notion-like styling
    let tableHtml = `<div class="relative overflow-hidden my-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <!-- Table Loading State -->
      <div class="table-loading-state absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 z-10" style="transition: opacity 0.5s ease-out;">
        <div class="typing-indicator mb-2">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-300">Preparing table data...</div>
      </div>
      
      <!-- Table Toolbar -->
      <div class="flex items-center justify-between px-4 py-2 ${isInvestmentData ? 'bg-blue-50 dark:bg-indigo-950' : 'bg-gray-50 dark:bg-gray-900'} border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          ${isInvestmentData ? `
            <span class="flex items-center text-xs font-medium text-gray-800 dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Investment Options
            </span>
          ` : `
            <span class="text-xs font-medium text-gray-800 dark:text-white">Table</span>
          `}
          <span class="text-xs text-gray-800 dark:text-white">${columnCount} columns</span>
        </div>
        <div class="flex items-center space-x-2">
          <button class="text-xs text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Toggle compact view" onclick="(function() { try { const table = document.getElementById('${tableId}'); if(table) { table.classList.toggle('compact-table'); } } catch(error) { console.error('Error toggling compact view:', error); } }).call(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
            </svg>
          </button>
          <button class="text-xs text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Copy table data" onclick="(function() {
            try {
              const table = document.getElementById('${tableId}');
              if (table) {
                const rows = table.querySelectorAll('tr');
                let text = '';
                rows.forEach(row => {
                  const cells = row.querySelectorAll('th, td');
                  const rowData = [];
                  cells.forEach(cell => rowData.push(cell.textContent.trim()));
                  text += rowData.join('\t') + '\n';
                });
                navigator.clipboard.writeText(text);
                // Show copy feedback
                const btn = this;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' fill=\'currentColor\' viewBox=\'0 0 16 16\'><path d=\'M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z\'/></svg>';
                setTimeout(() => {
                  btn.innerHTML = originalHTML;
                }, 2000);
              }
            } catch (error) {
              console.error('Error copying table data:', error);
            }
          }).call(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table id="${tableId}" class="min-w-full border-collapse bg-white dark:bg-gray-800 table-fixed md:table-auto" style="opacity: 0; transition: opacity 0.5s ease-in;">
    
    <!-- Add all rows as data rows with improved styling -->
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">`;
    
    // First row gets special styling as a pseudo-header
    const firstRowCells = tableRows[0].split('|').slice(1, -1).map(cell => cell.trim());
    
    // Define alignments for each column (defaulting to left-aligned)
    const alignments = firstRowCells.map(() => 'text-left');
    
    tableHtml += `<tr class="${isInvestmentData ? 'bg-blue-50 dark:bg-indigo-950' : 'bg-gray-50 dark:bg-gray-900'} border-b border-gray-200 dark:border-gray-700">`;
    firstRowCells.forEach(cell => {
      tableHtml += `<th class="px-4 py-3 whitespace-normal font-semibold text-sm uppercase tracking-wider ${isInvestmentData ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white'} border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm backdrop-filter">${cell}</th>`; // Enhanced Notion-like header
    });
    tableHtml += '</tr>';

    
    // Add remaining rows with consistent background color and hover effects
    tableRows.slice(1).forEach((row, rowIndex) => {
      const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
      const rowClass = 'bg-white dark:bg-gray-800';
      tableHtml += `<tr class="${rowClass} ${isInvestmentData ? 'hover:bg-blue-50/70 dark:hover:bg-indigo-900/50' : 'hover:bg-blue-50 dark:hover:bg-gray-700'} group transition-colors">`;
      
      cells.forEach((cell, index) => {
        // Get alignment from first row if available
        const alignment = index < alignments.length ? alignments[index] : 'text-left';
        // Simple cell formatting with consistent colors
        let formattedCell = cell;
        
        // Check if cell contains HTML content (like bullet points)
        const containsHTML = /<[a-z][\s\S]*>/i.test(cell);
        
        // If cell already has HTML, use it directly with minimal formatting
        if (containsHTML) {
          // Apply basic styling to the container but preserve the HTML content
          formattedCell = `<div class="table-cell-content">${cell}</div>`;
        } else {
          // Apply consistent styling for all cells
          formattedCell = `<span class="font-medium">${cell}</span>`;
        }
            
        // Process bullet points within cells (lines starting with - or *)
        if (cell.includes('\n')) {
          const lines = cell.split('\n');
          const hasBulletPoints = lines.some(line => /^\s*[-*]\s+/.test(line.trim()));
          
          if (hasBulletPoints) {
            // Create a proper unordered list for bullet points
            formattedCell = '<ul class="list-disc pl-5 py-1 space-y-1.5">';
            let inSubList = false;
            
            lines.forEach(line => {
              const trimmedLine = line.trim();
              if (/^\s*[-*]\s+/.test(trimmedLine)) {
                // This is a bullet point
                const bulletContent = trimmedLine.replace(/^\s*[-*]\s+/, '');
                
                // Check if bullet content has sub-bullets (indented bullets)
                if (bulletContent.includes('  - ') || bulletContent.includes('  * ')) {
                  // Handle sub-bullets by creating a nested structure
                  const mainContent = bulletContent.split('  - ')[0].split('  * ')[0].trim();
                  
                  // Close previous sublist if open
                  if (inSubList) {
                    formattedCell += '</ul></li>';
                    inSubList = false;
                  }
                  
                  // Start new main bullet with nested list
                  formattedCell += `<li class="mb-1.5 font-medium">${mainContent}`;
                  
                  // Add sub-bullets with proper indentation
                  const subBullets = bulletContent.match(/\s\s[-*]\s+([^\n]+)/g) || [];
                  if (subBullets.length > 0) {
                    formattedCell += `<ul class="list-circle pl-4 mt-1.5 space-y-1">`;
                    inSubList = true;
                    
                    subBullets.forEach(subBullet => {
                      const subContent = subBullet.replace(/^\s*[-*]\s+/, '').trim();
                      formattedCell += `<li class="text-gray-800 dark:text-white">${subContent}</li>`;
                    });
                  }
                } else {
                  // Close previous sublist if open
                  if (inSubList) {
                    formattedCell += '</ul></li>';
                    inSubList = false;
                  }
                  
                  // Regular bullet point
                  formattedCell += `<li class="font-medium text-gray-800 dark:text-white">${bulletContent}</li>`;
                }
              } else if (trimmedLine) {
                // Close previous sublist if open
                if (inSubList) {
                  formattedCell += '</ul></li>';
                  inSubList = false;
                }
                
                // Regular paragraph
                formattedCell += `<li class="!list-none font-medium text-gray-800 dark:text-white">${trimmedLine}</li>`;
              }
            });
            
            // Close any open sublists
            if (inSubList) {
              formattedCell += '</ul></li>';
            }
            
            formattedCell += '</ul>';
          } else {
            // For multi-line text without bullet points, format as paragraphs
            formattedCell = '<div class="space-y-2">';
                lines.forEach(line => {
                  if (line.trim()) {
                    formattedCell += `<p class="font-medium text-gray-800 dark:text-white">${line.trim()}</p>`;
                  }
                });
            formattedCell += '</div>';
          }
        }
        
        tableHtml += `<td class="px-4 py-3 whitespace-normal border-t-0 ${alignment} text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
          <div class="table-cell ${cell.includes('\n') ? 'space-y-1.5' : ''}">${formattedCell}</div>
        </td>`;
      });
      tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table></div>';
    
    // Add CSS for compact view toggle and investment cell styling
    tableHtml += `
      <style>
        #${tableId}.compact-table td { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        
        /* Investment cell styling */
        .investment-cell { width: 100%; }
        .investment-cell-content { width: 100%; }
        .investment-cell ul { margin-top: 0.5rem; margin-bottom: 0.5rem; padding-left: 1.5rem; }
        .investment-cell li { margin-bottom: 0.375rem; }
        .investment-cell p { margin-bottom: 0.5rem; }
        
        /* Bullet list styling */
        .investment-cell ul { list-style-position: outside; }
        .investment-cell ul.list-disc { list-style-type: disc; }
        .investment-cell ul.list-circle { list-style-type: circle; }
        .investment-cell li.!list-none { list-style-type: none; }
        .investment-cell .space-y-1 > * { margin-top: 0.25rem; margin-bottom: 0.25rem; }
          .investment-cell .space-y-1\.5 > * { margin-top: 0.375rem; margin-bottom: 0.375rem; }
        .investment-cell .space-y-2 > * { margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .investment-cell .space-y-0\.5 > * { margin-top: 0.125rem; margin-bottom: 0.125rem; }
        .investment-cell .pl-4 { padding-left: 1rem; }
        .investment-cell .pl-5 { padding-left: 1.25rem; }
        .investment-cell .mt-1 { margin-top: 0.25rem; }
          .investment-cell .mt-1\.5 { margin-top: 0.375rem; }
        .investment-cell .mb-1 { margin-bottom: 0.25rem; }
          .investment-cell .mb-1\.5 { margin-bottom: 0.375rem; }
      </style>
    `;
    
    // Add footer for tables
    if (isInvestmentData) {
      tableHtml += `
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-white rounded-b-lg">
          <div class="flex items-center justify-between">
            <span>Data as of ${new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</span>
            <div class="flex space-x-2">
              <button class="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors font-medium text-xs flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
              <button class="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors font-medium text-xs flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      `;
    }
    
    tableHtml += '</div>';
    
    return tableHtml;
  });
  
  // Process headings (h1 to h6) with improved styling
  formattedText = formattedText.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    const fontSize = {
      1: 'text-2xl md:text-3xl',
      2: 'text-xl md:text-2xl',
      3: 'text-lg md:text-xl',
      4: 'text-base md:text-lg',
      5: 'text-sm md:text-base',
      6: 'text-xs md:text-sm'
    }[level];
    
    return `<h${level} class="font-bold ${fontSize} my-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-white">${content}</h${level}>`;
  });
  
  // Process bullet points with improved Notion-like styling and indentation
  formattedText = formattedText.replace(/^(\s*)[-*]\s+(.+)$/gm, (match, indent, content) => {
    const indentLevel = indent.length;
    const indentClass = indentLevel ? `ml-${indentLevel * 6}` : '';
    
    return `<div class="flex items-start my-2 ${indentClass} group">
      <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-primary dark:bg-secondary group-hover:scale-110 transition-transform"></span>
      </div>
      <span class="text-gray-800 dark:text-white flex-1">${content}</span>
    </div>`;
  });
  
  // Process numbered lists with improved Notion-like styling and indentation
  formattedText = formattedText.replace(/^(\s*)(\d+)\.\s+(.+)$/gm, (match, indent, number, content) => {
    const indentLevel = indent.length;
    const indentClass = indentLevel ? `ml-${indentLevel * 6}` : '';
    
    return `<div class="flex items-start my-2 ${indentClass} group">
      <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        <span class="w-5 h-5 flex items-center justify-center text-xs font-medium text-primary dark:text-secondary group-hover:scale-110 transition-transform">${number}.</span>
      </div>
      <span class="text-gray-800 dark:text-white flex-1">${content}</span>
    </div>`;
  });
  
  // Process bold text with improved styling
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-primary dark:text-secondary">$1</strong>');
  
  // Process italic text with improved styling
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-800 dark:text-white">$1</em>');
  
  // Process strikethrough text with improved styling
  formattedText = formattedText.replace(/~~([^~]+)~~/g, '<span class="line-through text-gray-800 dark:text-white">$1</span>');
  
  // Process blockquotes with improved styling
  formattedText = formattedText.replace(/^>\s+(.+)$/gm, (match, content) => {
    return `<blockquote class="border-l-4 border-primary dark:border-secondary pl-4 py-2 my-3 italic text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-r-md">${content}</blockquote>`;
  });
  
  // Process horizontal rules with improved styling
  formattedText = formattedText.replace(/^---+$/gm, '<hr class="my-6 border-t-2 border-gray-300 dark:border-gray-600 rounded-full" />');
  
  // Process links with improved styling and hover effects
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-gray-800 dark:text-white hover:underline hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 font-medium">$1</a>');
  
  // Process callouts/notes with special styling
  formattedText = formattedText.replace(/^\[!NOTE\]\s*\n(.+)$/gm, (match, content) => {
    return `<div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-gray-800 dark:text-white p-4 my-4 rounded-r-md">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <p>${content}</p>
      </div>
    </div>`;
  });
  
  // Process warning callouts with special styling
  formattedText = formattedText.replace(/^\[!WARNING\]\s*\n(.+)$/gm, (match, content) => {
    return `<div class="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-gray-800 dark:text-white p-4 my-4 rounded-r-md">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        <p>${content}</p>
      </div>
    </div>`;
  });
  
  // Process tables within paragraphs with enhanced Notion-like styling
  // First handle tables with header rows
  formattedText = formattedText.replace(/(<p[^>]*>)([\s\S]*?)(\|(.+)\|\s*\n\|\s*[-:\s]+\|\s*\n((\|.+\|\s*\n)+))([\s\S]*?)(<\/p>)/g, (match, openTag, beforeTable, tableMatch, headerRow, dataRows, afterTable, closeTag) => {
    // Extract the table content
    const tableContent = tableMatch;
    
    // Process the table using the existing table formatting logic
    const processedTable = formattedText.replace(new RegExp(tableContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), (match) => {
      // Use the existing table regex replacement logic
      return match.replace(/\|(.+)\|\s*\n\|\s*[-:\s]+\|\s*\n((\|.+\|\s*\n)+)/g, (tableMatch) => {
        // Extract table content
        const tableRows = tableMatch.split('\n').filter(row => row.trim() !== '');
        
        if (tableRows.length < 2) return tableMatch; // Not a valid table
        
        const headerRow = tableRows[0];
        const alignmentRow = tableRows[1];
        const dataRows = tableRows.slice(2);
        
        // Extract header cells
        const headerCells = headerRow.split('|').slice(1, -1).map(cell => cell.trim());
        
        // Extract alignment information
        const alignments = alignmentRow.split('|').slice(1, -1).map(cell => {
          const trimmed = cell.trim();
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'text-center';
          if (trimmed.endsWith(':')) return 'text-right';
          return 'text-left';
        });
        
        // Generate a unique ID for this table
        const tableId = `table-${Math.random().toString(36).substring(2, 10)}`;
        
        // Check if this is an investment table
        const isInvestmentData = isInvestmentTable(tableMatch);
        
        // Build table HTML with enhanced Notion-like styling
    let tableHtml = `<div class="relative overflow-hidden my-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <!-- Table Toolbar -->
          <div class="flex items-center justify-between px-4 py-2 ${isInvestmentData ? 'bg-blue-50 dark:bg-indigo-950' : 'bg-gray-50 dark:bg-gray-900'} border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2">
              ${isInvestmentData ? `
                <span class="flex items-center text-xs font-medium text-gray-800 dark:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Investment Options
                </span>
              ` : `
                <span class="text-xs font-medium text-gray-800 dark:text-white">Table</span>
              `}
              <span class="text-xs text-gray-800 dark:text-white">${headerCells.length} columns</span>
            </div>
            <div class="flex items-center space-x-2">
              <button class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-200 dark:hover:text-white transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Toggle compact view" onclick="document.getElementById('${tableId}').classList.toggle('compact-table')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
              </button>
              <button class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Copy table data" onclick="navigator.clipboard.writeText(document.getElementById('${tableId}').innerText)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
              ${isInvestmentData ? `
              <button class="text-xs text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Compare investments">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5 1a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H5zm0 1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                  <path d="M7 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                  <path d="M3 3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                </svg>
              </button>
              ` : ''}
            </div>
          </div>
          
          <!-- Table Content -->
          <div class="overflow-x-auto">
            <table id="${tableId}" class="min-w-full border-collapse bg-white dark:bg-gray-800 table-fixed md:table-auto" style="contain: content; transform: translateZ(0); backface-visibility: hidden;">`;
        
        // Add header row with improved styling
        tableHtml += '<thead>';
        tableHtml += `<tr class="${isInvestmentData ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'} border-b border-gray-200 dark:border-gray-600">`;
        headerCells.forEach((cell, index) => {
          const alignment = alignments[index] || 'text-left';
          tableHtml += `<th class="px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold ${alignment} ${isInvestmentData ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white'} text-sm uppercase tracking-wider sticky top-0 ${isInvestmentData ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'} z-10">${cell}</th>`;
        });
        tableHtml += '</tr></thead>';
        
        // Add data rows with alternating row colors and improved hover effects
        tableHtml += '<tbody class="divide-y divide-gray-200 dark:divide-gray-700">';
        dataRows.forEach((row, rowIndex) => {
          const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
          const rowClass = rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900';
          tableHtml += `<tr class="${rowClass} ${isInvestmentData ? 'hover:bg-blue-50/70 dark:hover:bg-blue-900/30' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'} group transition-colors">`;
          
          cells.forEach((cell, index) => {
            const alignment = alignments[index] || 'text-left';
            
            // Special formatting for investment data
            let formattedCell = cell;
            
            if (isInvestmentData) {
              // Check if cell contains HTML content (like bullet points)
              const containsHTML = /<[a-z][\s\S]*>/i.test(cell);
              
              // If cell already has HTML, use it directly with minimal formatting
              if (containsHTML) {
                // Apply basic styling to the container but preserve the HTML content
                formattedCell = `<div class="investment-cell-content">${cell}</div>`;
              } else {
                // Format risk level with color indicators
                if (cell.toLowerCase().includes('high')) {
                  formattedCell = `<span class="inline-flex items-center font-medium"><span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>${cell}</span>`;
                } else if (cell.toLowerCase().includes('medium')) {
                  formattedCell = `<span class="inline-flex items-center font-medium"><span class="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>${cell}</span>`;
                } else if (cell.toLowerCase().includes('low')) {
                  formattedCell = `<span class="inline-flex items-center font-medium"><span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>${cell}</span>`;
                }
                
                // Format percentage returns
                if (cell.includes('%')) {
                  formattedCell = `<span class="font-medium text-gray-800 dark:text-white">${cell}</span>`;
                }
                
                // Format currency values
                if (cell.includes('₹')) {
                  formattedCell = `<span class="font-medium">${cell}</span>`;
                }
                
                // Process bullet points within cells (lines starting with - or *)
                if (cell.includes('\n')) {
                  const lines = cell.split('\n');
                  const hasBulletPoints = lines.some(line => /^\s*[-*]\s+/.test(line.trim()));
                  
                  if (hasBulletPoints) {
                    // Create a proper unordered list for bullet points
                    formattedCell = '<ul class="list-disc pl-5 py-1 space-y-1.5">';
                    let inSubList = false;
                    
                    lines.forEach(line => {
                      const trimmedLine = line.trim();
                      if (/^\s*[-*]\s+/.test(trimmedLine)) {
                        // This is a bullet point
                        const bulletContent = trimmedLine.replace(/^\s*[-*]\s+/, '');
                        
                        // Check if bullet content has sub-bullets (indented bullets)
                        if (bulletContent.includes('  - ') || bulletContent.includes('  * ')) {
                          // Handle sub-bullets by creating a nested structure
                          const mainContent = bulletContent.split('  - ')[0].split('  * ')[0].trim();
                          
                          // Close previous sublist if open
                          if (inSubList) {
                            formattedCell += '</ul></li>';
                            inSubList = false;
                          }
                          
                          // Start new main bullet with nested list
                          formattedCell += `<li class="mb-1.5 font-medium">${mainContent}`;
                          
                          // Add sub-bullets with proper indentation
                          const subBullets = bulletContent.match(/\s\s[-*]\s+([^\n]+)/g) || [];
                          if (subBullets.length > 0) {
                            formattedCell += `<ul class="list-circle pl-4 mt-1.5 space-y-1">`;
                            inSubList = true;
                            
                            subBullets.forEach(subBullet => {
                              const subContent = subBullet.replace(/^\s*[-*]\s+/, '').trim();
                              formattedCell += `<li class="text-gray-800 dark:text-white">${subContent}</li>`;
                            });
                          }
                        } else {
                          // Close previous sublist if open
                          if (inSubList) {
                            formattedCell += '</ul></li>';
                            inSubList = false;
                          }
                          
                          // Regular bullet point
                          formattedCell += `<li class="font-medium">${bulletContent}</li>`;
                        }
                      } else if (trimmedLine) {
                        // Close previous sublist if open
                        if (inSubList) {
                          formattedCell += '</ul></li>';
                          inSubList = false;
                        }
                        
                        // Regular paragraph
                        formattedCell += `<li class="!list-none font-medium">${trimmedLine}</li>`;
                      }
                    });
                    
                    // Close any open sublists
                    if (inSubList) {
                      formattedCell += '</ul></li>';
                    }
                    
                    formattedCell += '</ul>';
                  } else {
                    // For multi-line text without bullet points, format as paragraphs
                    formattedCell = '<div class="space-y-2">';
                    lines.forEach(line => {
                      if (line.trim()) {
                        formattedCell += `<p class="font-medium text-gray-800 dark:text-white">${line.trim()}</p>`;
                      }
                    });
                    formattedCell += '</div>';
                  }
                }
              }
            }
            
            tableHtml += `<td class="px-4 py-3 whitespace-normal border-t-0 ${alignment} text-gray-800 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
              <div class="investment-cell ${cell.includes('\n') ? 'space-y-1.5' : ''}">${formattedCell}</div>
            </td>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        
        // Add CSS for compact view toggle and investment cell styling
        tableHtml += `
          <style>
            #${tableId}.compact-table td { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
            #${tableId}.compact-table th { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
            
            /* Investment cell styling */
            .investment-cell { width: 100%; will-change: transform; }
            .investment-cell-content { width: 100%; }
            .investment-cell ul { margin-top: 0.5rem; margin-bottom: 0.5rem; padding-left: 1.5rem; }
            .investment-cell li { margin-bottom: 0.375rem; }
            .investment-cell p { margin-bottom: 0.5rem; }
            
            /* Bullet list styling */
            .investment-cell ul { list-style-position: outside; }
            .investment-cell ul.list-disc { list-style-type: disc; }
            .investment-cell ul.list-circle { list-style-type: circle; }
            .investment-cell li.!list-none { list-style-type: none; }
            .investment-cell .space-y-1 > * { margin-top: 0.25rem; margin-bottom: 0.25rem; }
          .investment-cell .space-y-1\.5 > * { margin-top: 0.375rem; margin-bottom: 0.375rem; }
            .investment-cell .space-y-2 > * { margin-top: 0.5rem; margin-bottom: 0.5rem; }
            .investment-cell .space-y-0\.5 > * { margin-top: 0.125rem; margin-bottom: 0.125rem; }
            .investment-cell .pl-4 { padding-left: 1rem; }
            .investment-cell .pl-5 { padding-left: 1.25rem; }
            .investment-cell .mt-1 { margin-top: 0.25rem; }
          .investment-cell .mt-1\.5 { margin-top: 0.375rem; }
            .investment-cell .mb-1 { margin-bottom: 0.25rem; }
          .investment-cell .mb-1\.5 { margin-bottom: 0.375rem; }
            
            /* Optimize table rendering */
            #${tableId} { contain: content; transform: translateZ(0); }
            #${tableId} thead { contain: layout; }
            #${tableId} tbody { contain: layout; }
          </style>
        `;
        
        // Add footer for investment tables
        if (isInvestmentData) {
          tableHtml += `
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-300">
              <div class="flex items-center justify-between">
                <span>Data as of ${new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</span>
                <div class="flex space-x-2">
                  <button class="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors font-medium text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download CSV
                  </button>
                  <button class="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 transition-colors font-medium text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          `;
        }
        
        // Add script for progressive table rendering
        tableHtml += `
          <script>
            (function() {
              // Progressive rendering for smooth table display
              const table = document.getElementById('${tableId}');
              if (table) {
                // Initial setup - hide table
                table.style.opacity = '0';
                table.style.transition = 'opacity 0.3s ease-in';
                
                // Get all rows
                const rows = table.querySelectorAll('tbody tr');
                const batchSize = 5; // Number of rows to render at once
                
                // Hide all rows initially except header
                rows.forEach(row => {
                  row.style.display = 'none';
                });
                
                // Show table immediately but with rows hidden
                setTimeout(() => {
                  table.style.opacity = '1';
                  
                  // Progressive rendering of rows
                  let currentIndex = 0;
                  
                  function renderNextBatch() {
                    // Show next batch of rows
                    for (let i = 0; i < batchSize && currentIndex < rows.length; i++) {
                      if (rows[currentIndex]) {
                        rows[currentIndex].style.display = '';
                        rows[currentIndex].style.animation = 'fadeIn 0.2s ease-in';
                      }
                      currentIndex++;
                    }
                    
                    // Continue if there are more rows
                    if (currentIndex < rows.length) {
                      setTimeout(renderNextBatch, 10);
                    }
                  }
                  
                  // Start rendering rows
                  renderNextBatch();
                }, 50);
              }
            })();
          </script>
          
          <style>
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          </style>
        `;
        
        tableHtml += '</div>';
        
        return tableHtml;
      });
    });
    
    // Return the processed table within the paragraph with lazy loading
  return `${openTag}${beforeTable}<div class="table-container" style="min-height:100px;position:relative;">
    <div class="table-placeholder" style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.8);dark:background:rgba(30,41,59,0.8);z-index:1;opacity:1;transition:opacity 0.3s ease-out;">
      <div class="animate-pulse flex space-x-4 w-full max-w-md">
        <div class="flex-1 space-y-4 py-1">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
    ${processedTable}
    <script>
      (function() {
        // Hide placeholder after table is loaded
        setTimeout(() => {
          const placeholder = document.currentScript.parentNode.querySelector('.table-placeholder');
          if (placeholder) {
            placeholder.style.opacity = '0';
            setTimeout(() => placeholder.style.display = 'none', 300);
          }
        }, 300);
      })();
    </script>
  </div>${afterTable}${closeTag}`;
  });
  
  // Process paragraphs (add spacing between paragraphs)
  formattedText = formattedText.replace(/\n\n/g, '</p><p class="my-3 text-gray-800 dark:text-gray-200">');
  
  // Wrap in paragraph tags if not already wrapped
  if (!formattedText.startsWith('<')) {
    formattedText = `<p class="text-gray-800 dark:text-gray-200">${formattedText}</p>`;
  }
  
  // Add global styles for optimized table rendering
  formattedText += `
    <style>
      /* Global table optimization styles */
      .table-container { contain: content; }
      table { contain: content; transform: translateZ(0); }
      table thead { contain: layout; }
      table tbody { contain: layout; }
      table td, table th { contain: content; }
      
      /* Smooth animation for table cells */
      @media (prefers-reduced-motion: no-preference) {
        table td { transition: background-color 0.2s ease-in-out; }
      }
      
      /* Optimize table rendering */
      .table-container { will-change: transform; }
      
      /* Table loading state styling */
      .table-loading-state {
        background-color: rgba(255, 255, 255, 0.9);
      }
      
      .dark .table-loading-state {
        background-color: rgba(30, 41, 59, 0.9);
      }
      
      /* Typing indicator for table loading */
      .table-loading-state .typing-indicator {
        display: flex;
        align-items: center;
      }
      
      .table-loading-state .typing-indicator span {
        height: 8px;
        width: 8px;
        margin: 0 2px;
        background-color: #6b7280;
        border-radius: 50%;
        display: inline-block;
        animation: bounce-slow 1.4s infinite ease-in-out both;
      }
      
      .dark .table-loading-state .typing-indicator span {
        background-color: #9ca3af;
      }
      
      .table-loading-state .typing-indicator span:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .table-loading-state .typing-indicator span:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      @keyframes bounce-slow {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    </style>
  `;
  
  // Sanitize the formatted text and return it wrapped in a div with proper styling
  const sanitizedHtml = DOMPurify.sanitize(formattedText);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className="whitespace-pre-wrap prose dark:prose-invert max-w-none overflow-x-auto"
    />
  );
};// End of formatBotMessage function

// Chatbot component



// Welcome component that shows at the start of a new chat
// const WelcomeMessage = ({ onDismiss }) => {
//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-medium text-gray-800 dark:text-white">Welcome to NiveshPath AI</h3>
//         <button 
//           onClick={onDismiss}
//           className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//           </svg>
//         </button>
//       </div>
//       <p className="text-gray-800 dark:text-white mb-4">Your financial assistant is ready to serve you. I can help you with the following topics:</p>
//       <ul className="space-y-2 mb-4">
//         <li className="flex items-start">
//           <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//           </svg>
//           <span className="text-gray-800 dark:text-white">Investment advice and strategies</span>
//         </li>
//         <li className="flex items-start">
//           <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//           </svg>
//           <span className="text-gray-800 dark:text-white">Budget and financial planning</span>
//         </li>
//         <li className="flex items-start">
//           <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//           </svg>
//           <span className="text-gray-800 dark:text-white">Information about financial products</span>
//         </li>
//       </ul>
//       <div className="text-right">
//         <button 
//           onClick={onDismiss}
//           className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
//         >
//           Get Started
//         </button>
//       </div>
//     </div>
//   );
// };

// Function to simulate thinking dots animation
const ThinkingAnimation = ({ onComplete }) => {
  const [dots, setDots] = useState('');
  const [thinkingText, setThinkingText] = useState('');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const thinkingPhrases = [
    'Analyzing your question',
    'Searching for information',
    'Processing data',
    'Considering options',
    'Formulating detailed response',
    'Checking facts and figures',
    'Organizing thoughts',
    'Gathering investment insights',
    'Evaluating financial data',
    'Preparing personalized advice'
  ];
  
  useEffect(() => {
    // Start with a random thinking phrase
    const randomIndex = Math.floor(Math.random() * thinkingPhrases.length);
    setPhaseIndex(randomIndex);
    setThinkingText(thinkingPhrases[randomIndex]);
    
    // Animate the dots
    let count = 0;
    const dotsInterval = setInterval(() => {
      setDots('.'.repeat((count % 3) + 1));
      count++;
      
      // Change thinking phrase every 5 counts (1.5 seconds)
      if (count % 5 === 0) {
        setPhaseIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % thinkingPhrases.length;
          setThinkingText(thinkingPhrases[newIndex]);
          return newIndex;
        });
      }
      
      // Complete the thinking animation after a random time between 2-4 seconds
      if (count > 10 && Math.random() < 0.15) {
        clearInterval(dotsInterval);
        if (onComplete) onComplete();
      }
    }, 300);
    
    return () => clearInterval(dotsInterval);
  }, [onComplete]);
  
  return (
    <div className="flex flex-col items-start">
      <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-medium px-2 py-1 rounded-full mb-2">
        {thinkingText}
      </div>
      <div className="text-gray-800 dark:text-gray-300 font-medium flex items-center">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

const Chatbot = ({ darkMode, setDarkMode }) => {
  const [sessionId, setSessionId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const inputRef = useRef(null);
  
  const { currentUser, isAuthenticated, onboardingCompleted } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false); // New state for thinking animation
  
  // State for chat history from API
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Auto-focus the input field when the component mounts or refreshes
  useEffect(() => {
    if (inputRef.current && isAuthenticated && !isTyping && !loading) {
      inputRef.current.focus();
    }
  }, [isAuthenticated, isTyping, loading]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial setup and authentication check
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check onboarding status and fetch chat history
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Check onboarding status
        const onboardingResponse = await apiService.user.checkOnboardingStatus();
        if (onboardingResponse && onboardingResponse.data) {
          const { isOnboardingCompleted } = onboardingResponse.data;
          setShowOnboarding(!isOnboardingCompleted);
          
          // If onboarding is completed, fetch chat history
          if (isOnboardingCompleted) {
            await fetchChatHistory();
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        // Fallback to context value if API call fails
        setShowOnboarding(!onboardingCompleted);
        if (onboardingCompleted) {
          await fetchChatHistory();
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      initializeChat();
    }
    
    // Only show welcome message for brand new sessions
    // This prevents welcome screen from showing after deleting a session
    const isNewSession = !sessionId && (!messages || messages.length === 0);
    if (isNewSession) {
      setShowWelcome(true);
      
      // Reset messages for a fresh start
      setMessages([]);
      
      // Start with no session ID - we'll get one from the API after first message
      setSessionId(null);
    }
    
  }, [currentUser, isAuthenticated, navigate, onboardingCompleted]);
  
  // Hide welcome message when messages exist
  useEffect(() => {
    if (messages && messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchChatHistory(); // Fetch chat history after onboarding is complete
  };

  // Fetch chat history from API
  const fetchChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await apiService.chatbot.getHistory();
      
      if (response && response.data && response.data.chatHistory) {
        // Process the chat history to extract relevant information
        const processedHistory = response.data.chatHistory.map(session => ({
          _id: session._id,
          id: session._id,
          title: session.messages && session.messages.length > 0 
            ? session.messages[0].query.substring(0, 30) + (session.messages[0].query.length > 30 ? '...' : '')
            : 'Chat Session',
          timestamp: session.timestamp,
          createdAt: session.timestamp,
          conversationId: session.conversationId
        }));
        
        setChatHistory(processedHistory);
      } else {
        // Fallback to empty array if response format is unexpected
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
      setChatHistory([]); // Reset to empty array on error
    } finally {
      setHistoryLoading(false);
    }
  };
  

  
  // Delete a chat session
  const deleteSession = async (sessionIdToDelete, e) => {
    // Prevent event propagation to avoid loading the session when deleting
    e.stopPropagation();
    
    if (!sessionIdToDelete) return;
    
    try {
      setHistoryLoading(true);
      await apiService.chatbot.deleteSession(sessionIdToDelete);
      
      // Remove the deleted session from chat history
      setChatHistory(prevHistory => prevHistory.filter(session => 
        (session.id !== sessionIdToDelete && session._id !== sessionIdToDelete)
      ));
      
      // If the current active session is deleted, clear messages but don't show welcome screen
      if (sessionIdToDelete === sessionId) {
        setMessages([]);
        setSessionId(null);
        // Explicitly set showWelcome to false to prevent welcome page from showing
        setShowWelcome(false);
      }
      
      toast.success('Chat session deleted successfully');
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast.error('Failed to delete chat session');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Hide welcome message when user starts typing
    if (showWelcome) {
      setShowWelcome(false);
    }
    
    // Check if user has completed onboarding
    if (!onboardingCompleted) {
      setShowOnboarding(true);
      return;
    }
    
    // Clear any previous errors
    setError(null);

    // Create user message
    const userMessage = { id: Date.now(), text: input, isBot: false, sender: 'user' };
    const userInput = input.trim(); // Store input before clearing
    
    // Immediately update UI with user message
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput(''); // Clear input field immediately
    setIsTyping(true); // Show typing indicator immediately
    setLoading(true); // Set loading state
    
    // Scroll to bottom immediately after adding user message
    scrollToLatestQuestion();
    
    try {
      // Only use sessionId as conversationId if it exists and is a valid MongoDB ObjectId
      // MongoDB ObjectIds are 24 character hex strings
      let currentConversationId = sessionId && /^[0-9a-fA-F]{24}$/.test(sessionId) ? sessionId : null;
      let isNewPage = false; // We're not tracking page navigation without session storage
      
      // Try to send message to API with timeout to prevent long-hanging requests
      const controller = new AbortController(); 
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await apiService.chatbot.sendMessage(
          userInput, 
          currentConversationId,
          isNewPage
        );
        
        clearTimeout(timeoutId); // Clear the timeout if request succeeds
        
        // Store the conversationId in our state for future messages
        if (response.data && response.data.conversationId) {
          setSessionId(response.data.conversationId);
        }
        
        // Process the response
        if (response.data && response.data.response) {
          // First show thinking animation
          setThinking(true);
          
          // Create bot message with thinking state initially
          const botMessage = { 
            id: Date.now(), // Ensure unique ID
            text: '', // Start with empty text
            isBot: true,
            sender: 'bot',
            query: userInput, // Store original query
            fullText: response.data.response, // Store the full response
            thinking: true // Show thinking animation
          };
          
          // Add the bot message with thinking state to the messages array
          setMessages(prevMessages => {
            return [...prevMessages, botMessage];
          });
          
          // Simulate thinking for a random time between 1-3 seconds
          const thinkingTime = Math.random() * 2000 + 1000;
          await new Promise(resolve => setTimeout(resolve, thinkingTime));
          
          // Update message to show it's no longer thinking but now typing
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].id === botMessage.id) {
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                thinking: false,
                typing: true
              };
            }
            
            return updatedMessages;
          });
          
          setThinking(false);
          
          // Gradually reveal the text character by character
          const fullText = response.data.response;
          let currentText = '';
          
          for (let i = 0; i < fullText.length; i++) {
            // Add one character at a time
            currentText += fullText[i];
            
            // Update the message with the current text
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages];
              const lastMessageIndex = updatedMessages.length - 1;
              
              // Only update if the last message is the bot message we're working with
              if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].id === botMessage.id) {
                updatedMessages[lastMessageIndex] = {
                  ...updatedMessages[lastMessageIndex],
                  text: currentText,
                  typing: i < fullText.length - 1 // Still typing until the last character
                };
              }
              
              return updatedMessages;
            });
            
            // Add a small delay between characters (adjust for speed)
            // Use different delays for different characters to make it more natural
            const delay = fullText[i] === '.' || fullText[i] === '!' || fullText[i] === '?' ? 100 : 
                         fullText[i] === ',' || fullText[i] === ';' ? 50 : 
                         fullText[i] === '\n' ? 150 : Math.random() * 10 + 5;
            
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Update chat history after successful message exchange
          // Adding a small delay before fetching chat history to ensure server has processed the message
          setTimeout(() => {
            fetchChatHistory();
          }, 500); // 500ms delay
          
          // Don't scroll to the bot's response to keep user's current reading position
          // scrollToLatestQuestion(); - removed to prevent auto-scrolling after AI response
        } else {
          throw new Error('Unexpected response format from server');
        }
      } catch (apiError) {
        clearTimeout(timeoutId); // Clear the timeout if request fails
        
        console.error('Error sending message to chatbot:', apiError);
        
        // Check if it's a server error (500)
        const isServerError = apiError.response && apiError.response.status >= 500;
        
        // Generate a fallback response for server errors
        if (isServerError) {
          // Generate a fallback response based on user input
          let fallbackResponse = "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a few moments.";
          
          // Add some variety based on user input
          if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
            fallbackResponse = "Hello! I'd love to help you with your financial questions, but I'm having trouble connecting to my knowledge base right now. Please try again in a few moments.";
          } else if (userInput.toLowerCase().includes('invest')) {
            fallbackResponse = "I'd like to provide you with investment advice, but I'm having trouble accessing my financial data at the moment. Please try again shortly.";
          } else if (userInput.toLowerCase().includes('budget')) {
            fallbackResponse = "Budgeting is important for financial health. I'd like to help you with this, but I'm experiencing some technical difficulties. Please try again soon.";
          } else if (userInput.toLowerCase().includes('sip')) {
            fallbackResponse = "SIPs are a great investment strategy. I'd like to tell you more, but I'm having trouble connecting to my financial database. Please try again in a few moments.";
          } else if (userInput.toLowerCase().includes('tax')) {
            fallbackResponse = "Tax planning is an important aspect of financial management. I'd like to provide you with more information, but I'm experiencing some technical difficulties. Please try again shortly.";
          }
          
          // Create bot message with fallback response
          const fallbackMessage = { 
            id: Date.now(), 
            text: fallbackResponse, 
            isBot: true,
            sender: 'bot',
            query: userInput,
            isFallback: true // Mark as fallback response
          };
          
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages, fallbackMessage];
            return updatedMessages;
          });
          
          // Show a toast with a more specific error message
          toast.error('Server is currently unavailable. Using fallback responses.');
        } else {
          // For other errors, show the standard error message
          throw apiError; // Re-throw to be caught by the outer catch block
        }
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
      setError('Failed to get a response. Please try again.');
      toast.error('Failed to get a response. Please try again.');
      
      // Add error message
      const errorMessage = { 
        id: Date.now(), 
        text: 'Sorry, I encountered an error processing your request. Please try again later.', 
        isBot: true,
        sender: 'bot'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      // Don't scroll to error message to keep user's current reading position
      // scrollToLatestQuestion(); - removed to prevent auto-scrolling after error message
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };
  
  // Load a specific chat session
  const loadChatSession = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await apiService.chatbot.getChatSession(sessionId);
      
      if (response && response.data && response.data.chatSession) {
        const session = response.data.chatSession;
        
        // Check if session has messages
        if (session.messages && session.messages.length > 0) {
          // Format messages for display
          const formattedMessages = session.messages.map(msg => ({
            id: msg._id || Date.now(),
            text: msg.response, // Use response as the bot message text
            query: msg.query,   // Store the original query
            isBot: true,        // This is a bot message
            sender: 'bot',
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          
          // Add user messages based on queries
          const completeMessages = [];
          
          formattedMessages.forEach(botMsg => {
            // Add the user message first (based on query)
            completeMessages.push({
              id: `user-${botMsg.id}`,
              text: botMsg.query,
              isBot: false,
              sender: 'user',
              timestamp: botMsg.timestamp
            });
            
            // Then add the bot response
            completeMessages.push({
              ...botMsg,
              id: `bot-${botMsg.id}`
            });
          });
          
          // Update state
          setMessages(completeMessages);
          setSessionId(session.conversationId || sessionId);
          setShowWelcome(false);
          
          // Scroll to bottom after loading messages - this is intentional for session loading
          // We keep this scroll behavior when loading a past session
          setTimeout(() => {
            // Find the last message (bot or user)
            if (completeMessages.length > 0) {
              const lastMessage = completeMessages[completeMessages.length - 1];
              const element = document.getElementById(`message-${lastMessage.id}`);
              if (element) {
                // Use 'auto' instead of 'smooth' for immediate scrolling
                element.scrollIntoView({ behavior: 'auto', block: 'start' });
              } else if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
              }
            }
          }, 100);
        } else {
          toast.warning('This chat session has no messages');
          setMessages([]);
          setSessionId(session.conversationId || sessionId);
        }
      } else {
        toast.error('Invalid session data received');
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast.error('Failed to load chat session');
    } finally {
      setLoading(false);
    }
  };
  
  // Start a new chat session
  const startNewChat = () => {
    setMessages([]);
    setSessionId(null); // Don't set a sessionId until we get one from the API
    setShowWelcome(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Chat history functionality removed as requested

  // Function to scroll to the latest message (primarily for user messages)
  const scrollToLatestQuestion = () => {
    // Find the last message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only scroll if it's a user message or if explicitly requested
      // This prevents auto-scrolling when AI responds
      if (!lastMessage.isBot) {
        const element = document.getElementById(`message-${lastMessage.id}`);
        if (element) {
          // Scroll to the latest message and keep it in view
          element.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (messagesEndRef.current) {
          // Fallback to messagesEndRef if element not found
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (messagesEndRef.current) {
      // If no messages yet, still scroll to the end
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Auto-scroll only when user sends a message, not when AI responds
  useEffect(() => {
    // Only auto-scroll when typing indicator is active (user just sent a message)
    // or when there's only one message (first message in conversation)
    if (isTyping || messages.length === 1) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        // Try to scroll to the latest message first
        scrollToLatestQuestion();
        // Additional fallback to ensure scrolling works
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    // Don't auto-scroll when AI responds (when isTyping changes from true to false)
  }, [isTyping, messages.length]);
  
  // Handle pressing Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only submit if there's text and we're not already processing a message
      if (input.trim() !== '' && !isTyping && !loading) {
        handleSubmit(e);
      }
      return false;
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Add event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide sidebar on mobile when resizing to small screen
      if (mobile) {
        setShowSidebar(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Add event listener for window scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px from the top
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // If onboarding needs to be shown, render the Onboarding component
  if (showOnboarding) {
    return <Onboarding fromChatbot={true} onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Scroll to top button - only visible when scrolled down */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-full bg-gray-500 text-white shadow-lg hover:bg-gray-600 transition-all duration-300 border border-gray-400 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
      <div className={`${showSidebar ? (isMobile ? 'w-64' : 'w-72') : 'w-0'} ${showSidebar && isMobile ? 'absolute z-30 h-screen' : ''} bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all duration-300 overflow-hidden flex flex-col shadow-lg border-r border-gray-200 dark:border-gray-700`}>
        {/* New Chat Button - Enhanced modern style */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-dark text-white transition-colors text-sm font-medium shadow-md hover:shadow-lg group focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50"
            disabled={loading || isTyping}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>
        
        {/* Chat History - Dynamic from API */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            <h3 className="text-xs uppercase text-gray-700 dark:text-gray-300 font-semibold px-1 tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chat History
            </h3>
            <button 
              onClick={fetchChatHistory}  
              className="p-1 rounded-md text-gray-500 hover:text-primary dark:hover:text-secondary hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50"
              title="Refresh history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {historyLoading ? (
            <div className="text-center p-4">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary dark:border-secondary"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading history...</p>
            </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-2">
              {chatHistory.map((session) => (
                <div 
                  key={session.id || session._id}
                  className="w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 group focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50 relative"
                >
                  <button
                    onClick={() => loadChatSession(session.id || session._id)}
                    className="w-full text-left p-2.5 focus:outline-none"
                  >
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                          {session.title || 'Chat Session'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {new Date(session.date || session.createdAt || Date.now()).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteSession(session.id || session._id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    title="Delete chat session"
                    aria-label="Delete chat session"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-3 text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <p>No chat history available</p>
              <button 
                onClick={startNewChat}
                className="mt-2 px-3 py-1.5 text-xs bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-dark text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50"
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>
      
        
        {/* User & Settings - Enhanced */}
        <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <Link to="/dashboard" className="block p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2 hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50">
            <div className="flex items-center gap-3 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </div>
          </Link>
          <Link to="/profile" className="block p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2 hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50">
            <div className="flex items-center gap-3 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </div>
          </Link>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50"
          >
            {darkMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="font-medium">Dark Mode</span>
              </>
            )}
          </button>
          
          {isAuthenticated && (
            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Logged in as</div>
              <div className="font-medium text-sm text-gray-800 dark:text-white truncate">{currentUser?.name || currentUser?.email || 'User'}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay to close sidebar on mobile - improved */}
      {showSidebar && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-20" 
          onClick={toggleSidebar}
        />
      )}
      
      
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-4">
        {/* Header - Enhanced modern style */}
        <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 flex items-center justify-between p-3 md:p-4 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-3 transition-all duration-300 hover:shadow-sm group focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-primary dark:group-hover:text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate md:text-left text-center flex-grow md:flex-grow-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              NiveshPath AI
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-1 hidden md:inline font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                {currentUser?.name || currentUser?.email || 'User'}
              </span>
            )}
            <button 
              onClick={startNewChat}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-all duration-300 hover:shadow-sm hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
              disabled={loading || isTyping}
              aria-label="Clear conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden md:inline text-sm font-medium">New Chat</span>
            </button>
          </div>
        </header>
        
        {/* Messages Container - Enhanced modern style */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 pb-20 sm:pb-24 relative">
          
          {/* Down arrow button to scroll to latest answer - Enhanced with animation */}
          {messages.length > 1 && (
            <button 
              onClick={scrollToLatestQuestion}
              className="fixed bottom-24 right-6 z-20 p-2.5 rounded-full bg-primary dark:bg-secondary text-white shadow-lg hover:bg-primary-dark dark:hover:bg-secondary-dark transition-all duration-300 border border-primary-light dark:border-secondary-light hover:scale-110 animate-bounce-slow focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
              aria-label="Scroll to latest message"
              title="Scroll to latest message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
          
          {/* Empty state when no messages and showWelcome is true */}
          {messages.length === 0 && showWelcome && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Welcome to NiveshPath AI</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">NiveshPath AI is ready to help with your investment and financial planning needs.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                <button 
                  onClick={() => {
                    setInput("What are the best investment options for beginners?");
                    handleSubmit({ preventDefault: () => {} });
                  }}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hover:border-primary dark:hover:border-secondary cursor-pointer"
                >
                  <p className="font-medium text-gray-800 dark:text-white text-sm">"What are the best investment options for beginners?"</p>
                </button>
                <button 
                  onClick={() => {
                    setInput("How should I plan for retirement in my 30s?");
                    handleSubmit({ preventDefault: () => {} });
                  }}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hover:border-primary dark:hover:border-secondary cursor-pointer"
                >
                  <p className="font-medium text-gray-800 dark:text-white text-sm">"How should I plan for retirement in my 30s?"</p>
                </button>
              </div>
            </div>
          )}
          
          {/* Empty state when no messages and showWelcome is false */}
          {messages.length === 0 && !showWelcome && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Start a New Conversation</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">Ask NiveshPath AI about investments, financial planning, or any financial questions.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className="py-6 px-4 md:px-6 transition-colors duration-300"
              id={`message-${message.id}`}
            >
              <div className={`w-full max-w-3xl mx-auto flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`${message.isBot ? 'w-full' : 'w-full'}`}>
                  {/* User or AI label - Enhanced */}
                  <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-center mb-2`}>
                    <div className="font-medium text-sm flex items-center">
                      {message.isBot ? (
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center mr-2 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                          <span className="text-gray-800 dark:text-white">NiveshPath AI</span>
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full">AI</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-gray-800 dark:text-white">You</span>
                          <div className="h-7 w-7 rounded-full bg-secondary text-white flex items-center justify-center ml-2 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Message content */}
                  {message.isBot ? (
                    <div className="text-gray-800 dark:text-white text-sm sm:text-base prose prose-sm dark:prose-invert max-w-none notion-like-content">
                      <div>
                        {message.thinking ? (
                          <ThinkingAnimation 
                            onComplete={() => {
                              // This will be called when thinking animation completes
                              // but we're handling this in the main response processing
                            }} 
                          />
                        ) : (
                          <>
                            {formatBotMessage(message.text)}
                            {message.typing && (
                              <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 inline-flex items-center shadow-sm">
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium mr-3">Generating comprehensive financial advice</span>
                                <div className="typing-indicator">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Copy and Share buttons below the message - only show when not thinking and has text */}
                        {!message.thinking && message.text && (
                          <div className="mt-4 flex justify-end space-x-2">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(message.text);
                                toast.success("Message copied to clipboard!");
                              }}
                              className="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center group focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
                              title="Copy answer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-primary dark:group-hover:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span className="ml-1 hidden md:inline text-xs">Copy</span>
                            </button>
                            <button 
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'NiveshPath AI Answer',
                                    text: message.text
                                  }).catch(err => console.error('Share failed:', err));
                                } else {
                                  navigator.clipboard.writeText(message.text);
                                  toast.success("Message copied to clipboard!");
                                }
                              }}
                              className="text-gray-800 hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center group focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
                              title="Share answer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-primary dark:group-hover:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              <span className="ml-1 hidden md:inline text-xs">Share</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-800 dark:text-white text-sm sm:text-base whitespace-pre-wrap bg-secondary/10 dark:bg-secondary/20 p-4 rounded-lg border border-secondary/30 dark:border-secondary/40 font-medium shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold bg-secondary/20 dark:bg-secondary/30 text-secondary dark:text-secondary-light px-2 py-0.5 rounded-full">Your Question</span>
                      </div>
                      {message.query || message.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Show divider only when typing is active but not when response has started */}
          {isTyping && messages.length > 0 && !messages[messages.length - 1].typing && !messages[messages.length - 1].thinking && (
            <div className="max-w-3xl mx-auto px-4 py-2">
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"> thinking ...</div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        {/* Input Form - Enhanced modern style */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 relative md:sticky md:bottom-0 z-10 transition-all duration-300 shadow-lg">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-2 sm:py-3 md:py-4 w-full">
            {/* Removed conditional heading to keep input position consistent */}
            {error && <div className="text-red-500 text-sm mb-2 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800/30">{error}</div>}
            <div className={`relative rounded-xl shadow-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden hover:border-primary dark:hover:border-secondary transition-all duration-300 mx-auto max-w-3xl ml-auto mr-0 hover:shadow-lg focus-within:border-primary dark:focus-within:border-secondary focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-secondary/20`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? "Ask me about investments, financial planning, or any financial questions..." : "Please login to chat..."}
              className="w-full p-3 sm:p-4 pr-14 max-h-40 focus:outline-none bg-transparent text-gray-800 dark:text-white text-sm md:text-base resize-none transition-colors duration-200 overflow-hidden"
              disabled={isTyping || loading || !isAuthenticated}
              rows="1"
              style={{ minHeight: '56px' }}
              autoFocus
            />
            <button
              type="submit"
              disabled={isTyping || loading || input.trim() === ''}
              className="absolute right-3 bottom-2.5 p-2.5 rounded-full text-white bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
              aria-label="Send message"
            >
              {isTyping ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : input.trim() === '' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          </div>
            <div className="flex justify-between items-center mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="hidden md:flex items-center">
                <kbd className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 font-sans mr-1 shadow-sm">Enter</kbd> 
                <span>to send</span>
              </div>
              <div className="text-center w-full md:w-auto">
                <span className="font-medium text-primary dark:text-secondary">NiveshPath AI</span> is ready to help with your investment and financial planning needs.
              </div>
            </div>
          </form>
        </div>
        
        {/* Add Notion-like styling */}
        <style jsx={true}>{`
          /* Mobile input field styling */
          @media (max-width: 640px) {
            textarea {
              overflow: hidden !important;
              height: auto !important;
              max-height: 80px !important;
            }
          }
          
          /* Typing indicator animation */
          .typing-indicator {
            display: inline-flex;
            align-items: center;
            margin-left: 2px;
          }
          
          .typing-indicator span {
            height: 10px;
            width: 10px;
            margin: 0 3px;
            background-color: var(--color-primary, #4F46E5);
            border-radius: 50%;
            display: inline-block;
            opacity: 0.6;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
          }
          
          .dark .typing-indicator span {
            background-color: var(--color-secondary, #10B981);
            opacity: 0.7;
          }
          
          .typing-indicator span:nth-child(1) {
            animation: bounce 1.2s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
          }
          
          .typing-indicator span:nth-child(2) {
            animation: bounce 1.2s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.3s;
          }
          
          .typing-indicator span:nth-child(3) {
            animation: bounce 1.2s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.6s;
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }
          
          /* Notion-like content styling */
          .notion-like-content h1, .notion-like-content h2, .notion-like-content h3,
          .notion-like-content h4, .notion-like-content h5, .notion-like-content h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 700;
            font-size: 1.5em;
            color: inherit;
          }
          
          .notion-like-content p {
            margin-bottom: 0.8em;
            line-height: 1.6;
            color: inherit;
          }
          
          .notion-like-content ul, .notion-like-content ol {
            margin-bottom: 1em;
            padding-left: 1.5em;
            color: inherit;
          }
          
          .notion-like-content li {
            margin-bottom: 0.25em;
            color: inherit;
          }
          
          .notion-like-content li::marker {
            color: inherit;
          }
          
          .notion-like-content blockquote {
            border-left: 3px solid #e1e1e1;
            padding-left: 1em;
            color: inherit;
            font-style: italic;
            margin: 1em 0;
          }
          
          .dark .notion-like-content blockquote {
            border-left-color: #4a4a4a;
            color: inherit;
          }
          
          /* Improved code blocks */
          .notion-like-content pre {
            background-color: #f7f7f7;
            border-radius: 4px;
            padding: 1em;
            overflow-x: auto;
            margin: 1em 0;
          }
          
          .dark .notion-like-content pre {
            background-color: #2d2d2d;
          }
          
          /* Improved tables */
          .notion-like-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            overflow: hidden;
            border-radius: 4px;
          }
          
          .notion-like-content th {
            background-color: #f5f5f5;
            font-weight: 600;
            text-align: left;
          }
          
          .dark .notion-like-content th {
            background-color: #333;
          }
          
          .notion-like-content td, .notion-like-content th {
            padding: 0.5em 0.75em;
            border: 1px solid #e1e1e1;          }
          
          .dark .notion-like-content td, .dark .notion-like-content th {
            border-color: #4a4a4a;
          }
          
          .notion-like-content tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .dark .notion-like-content tr:nth-child(even) {
            background-color: #2a2a2a;
          }
          
          /* Custom animations */
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }
          
          /* Transition effects */
          .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Hover effects */
          .hover-card {
            transition: all 0.3s ease;
          }
          
          .hover-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        `}</style>
      </div>
    </div>
    );

  }

export default Chatbot;