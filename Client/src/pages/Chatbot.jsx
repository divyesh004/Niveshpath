import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Import Auth Context
import Onboarding from './Onboarding'; // Import Onboarding component
import DOMPurify from 'dompurify'; // For sanitizing HTML
import {  toast } from 'react-toastify';
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
        <table id="${tableId}" class="min-w-full border-collapse bg-white dark:bg-gray-800 table-fixed md:table-auto">`;
    
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
    
    // Add CSS for compact view toggle and investment cell styling
    tableHtml += `
      <style>
        #${tableId}.compact-table td { padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        #${tableId}.compact-table th { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
        
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
        <table id="${tableId}" class="min-w-full border-collapse bg-white dark:bg-gray-800 table-fixed md:table-auto">
    
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
            <table id="${tableId}" class="min-w-full border-collapse bg-white dark:bg-gray-800 table-fixed md:table-auto">`;
        
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
        
        tableHtml += '</div>';
        
        return tableHtml;
      });
    });
    
    // Return the processed table within the paragraph
    return `${openTag}${beforeTable}${processedTable}${afterTable}${closeTag}`;
  });
  
  // Process paragraphs (add spacing between paragraphs)
  formattedText = formattedText.replace(/\n\n/g, '</p><p class="my-3 text-gray-800 dark:text-gray-200">');
  
  // Wrap in paragraph tags if not already wrapped
  if (!formattedText.startsWith('<')) {
    formattedText = `<p class="text-gray-800 dark:text-gray-200">${formattedText}</p>`;
  }
  
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

const Chatbot = ({ darkMode, setDarkMode }) => {
  const [sessionId, setSessionId] = useState(null); // Ensure sessionId state is here
  const [showScrollTop, setShowScrollTop] = useState(false); // State to control scroll to top button visibility

  // Function to load a chat from history (now inside Chatbot component)
  const loadChatFromHistory = async (chat) => {
    // First fetch the latest chat history to ensure we have the most up-to-date data
    await fetchChatHistory();
    
    // Ensure chat object and chat.id are present before trying to load
    if (!chat || !chat.id) {
      toast.error('Invalid chat data. Cannot load.');
      setMessages([]);
      setShowWelcome(true);
      setSessionId(null);
      sessionStorage.removeItem('niveshpath_session_id'); // Clear session ID from sessionStorage
      return;
    }

    try {
      // Use chat.messages if available, otherwise default to an empty array.
      // This ensures messagesToLoad is always an array.
      const messagesToLoad = (chat.messages && Array.isArray(chat.messages)) ? chat.messages : [];

      // Format messages for display using messagesToLoad
      const formattedMessages = messagesToLoad.map((msg, index) => {
        // Basic validation for message structure
        if (!msg || typeof msg.sender === 'undefined' || typeof msg.content === 'undefined') {
          console.warn('Message missing sender or content in chat history:', msg);
          return null;
        }
        // More robust check for content
        if (typeof msg.content !== 'string' && typeof msg.text !== 'string') {
          console.warn('Message missing content in chat history:', msg);
          return null;
        }
        
        return {
          id: `${chat.id}-${msg.sender}-${index}`,
          text: msg.content || msg.text || '',
          sender: msg.sender || (msg.isBot ? 'bot' : 'user'),
          isBot: msg.sender === 'bot' || msg.isBot || false,
          userId: msg.userId || currentUser?.id || 'guest',
          timestamp: msg.timestamp || new Date().toISOString()
        };
      }).filter(msg => msg !== null); // Remove any null messages
      
      // Validate that formattedMessages is an array (it should be, due to map and filter)
      if (!Array.isArray(formattedMessages)) {
        // This is a safeguard, should not typically be hit.
        console.error('Formatted messages are not an array after processing.');
        toast.error('Error processing chat messages.');
        setMessages([]);
        setSessionId(chat.id); // Load the session even if messages fail to format
        setShowWelcome(false); // Show empty chat interface
        return;
      }

      // Inform user if the original chat had messages but none were valid for display
      if (messagesToLoad.length > 0 && formattedMessages.length === 0) {
        toast.warn('Some messages in this chat could not be displayed.');
      } else if (messagesToLoad.length === 0 && formattedMessages.length === 0) {
        // This means the chat history item had no messages to begin with.
        // toast.info('This chat session is empty.'); // Displaying an empty chat is often better than a toast here.
      }
            
      // Set messages (even if empty, to clear previous chat) and session details
      if (formattedMessages.length > 0) {
        const sortedMessages = formattedMessages.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        // First hide welcome message before setting messages
        setShowWelcome(false);
        // Then set messages
        setMessages(sortedMessages);
        console.log('Chat loaded with messages:', sortedMessages.length);
        toast.success(`Chat loaded: ${chat.title || 'Chat'}`);
      } else {
        // If there are no messages, show the welcome message
        setShowWelcome(true);
        // Then set messages
        setMessages([]); // Set to empty array if no valid formatted messages
        console.log('Chat loaded with empty messages array');
        toast.info('This chat session has no messages yet.');
      }
      
      // Set the session ID and save it to sessionStorage
      setSessionId(chat.id);
      sessionStorage.setItem('niveshpath_session_id', chat.id);
      
      // Clear input field and any errors
      setInput('');
      setError(null);
      
      // On mobile, close the sidebar after loading a chat
      if (isMobile) {
        setShowSidebar(false);
      }
      
      // Scroll to the bottom of the chat
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // Double check that welcome message is hidden after a delay
        setShowWelcome(false);
      }, 100);
    } catch (error) {
      console.error('Error loading or formatting chat messages:', error);
      // Check if the error is the one we specifically want to handle differently
      if (error.message === 'No messages found in selected chat') {
          toast.info('No messages found in the selected chat.');
      } else {
          toast.error('Problem loading chat history.');
      }
      
      // Set default welcome message as fallback
      setShowWelcome(true); // Show welcome message for new chat
      setMessages([]);
      setSessionId(null); // Reset session ID as well
      sessionStorage.removeItem('niveshpath_session_id'); // Clear session ID from sessionStorage
      }
  };
  
  const { currentUser, isAuthenticated, onboardingCompleted } = useAuth(); // Get user info and onboarding status
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [newChat, setNewChat] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // isMobile state is fine here

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch chat history when component mounts or user changes
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check onboarding status from the backend API
    const checkOnboardingStatus = async () => {
      try {
        const response = await apiService.user.checkOnboardingStatus();
        if (response && response.data) {
          const { isOnboardingCompleted } = response.data;
          
          // If onboarding is not completed, show the onboarding form
          if (!isOnboardingCompleted) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
            // Fetch chat history only if onboarding is completed
            fetchChatHistory();
          }
        }
      } catch (error) {
        // Fallback to context value if API call fails
        if (!onboardingCompleted) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
          // Fetch chat history only if onboarding is completed
          fetchChatHistory();
        }
      }
    };
    
    checkOnboardingStatus();
    
    // Restore session ID from sessionStorage if available
    const savedSessionId = sessionStorage.getItem('niveshpath_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      setShowWelcome(false); // Don't show welcome message if we have a session
    } else {
      // Show welcome message only for new sessions
      setShowWelcome(true);
    }
    
  }, [currentUser, isAuthenticated, navigate, onboardingCompleted]);
  
  // Save sessionId to sessionStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('niveshpath_session_id', sessionId);
    }
  }, [sessionId]);
  
  // This useEffect has been replaced with the one using sessionStorage above
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Function to fetch chat history from the backend for the current user
  const fetchChatHistory = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    let actualApiChatSessions = [];

    try {
      // Authentication is now handled via HTTP-only cookies
      // and apiService automatically includes withCredentials: true

      const userId = currentUser?.id?.toString().replace(/^:/, '');
      let response;

      if (userId) {
        response = await apiService.chatbot.getChatHistory(userId);
      } else {
        // According to user, history should only be fetched if userId is present.
        // If no userId, we should not attempt to fetch general history.
        setMessages([]);
        setChatHistory([]);
        setShowWelcome(true);
        sessionStorage.removeItem('niveshpath_session_id'); // Clear session ID if no user ID
        setLoading(false);
        return;
        // console.log("Fetching general history as userId is not available. This might be empty or not supported by backend for guests.");
        // response = await apiService.chatbot.getHistory(); // This line is now commented out based on new understanding
      }

      
      if (response && response.data) {
                // Backend's getChatHistory returns { chatHistory: [], totalPages: X, currentPage: Y }
        // Backend's getHistory (general) might return a flat array or similar structure.
        if (response.data.chatHistory && Array.isArray(response.data.chatHistory)) {
          actualApiChatSessions = response.data.chatHistory;
                  } else if (Array.isArray(response.data)) { // Fallback for flat array responses (e.g., from general getHistory if it were called)
          actualApiChatSessions = response.data;
                  } else {
          console.warn("API response data is not in a recognized array format. Received:", response.data);
          actualApiChatSessions = [];
        }
      } else {
        console.warn("No data in API response or response is undefined.");
        actualApiChatSessions = [];
      }

      
      if (actualApiChatSessions.length === 0) {
                setMessages([]); // Clear current messages if no history
        setChatHistory([]);
        setShowWelcome(true); // Show welcome message if no history and no current chat
        setLoading(false);
        return;
      }

      // Process API data: backend returns sessions, each containing messages
      const processedHistory = actualApiChatSessions.map(session => {
        // Make sure we're using the MongoDB _id as the sessionId for API calls
        const mongoId = session._id;
        if (!mongoId) {
          console.warn("Skipping session due to missing MongoDB _id:", session);
          return null; // Skip if no MongoDB _id
        }
        
        // Use a consistent ID for local reference
        const sessionId = session.sessionId || mongoId;
        
        let title = '';
        // Check if the session object itself has a 'query' field from the backend.
        if (session.query && typeof session.query === 'string' && session.query.trim() !== '') {
          const queryText = session.query.trim();
          title = queryText.substring(0, 60) + (queryText.length > 60 ? "..." : "");
        } else if (session.messages && session.messages.length > 0) {
          // If no session.query, try to get it from the first user message.
          const firstUserMessage = session.messages.find(m => m.role === 'user');
          if (firstUserMessage && firstUserMessage.content && typeof firstUserMessage.content === 'string' && firstUserMessage.content.trim() !== '') {
            const queryText = firstUserMessage.content.trim();
            title = queryText.substring(0, 60) + (queryText.length > 60 ? "..." : "");
          }
        }

        // If no title could be derived from session.query or the first user message, generate a default one.
        if (!title) {
          title = `Chat Session - ${new Date(session.updatedAt || session.createdAt || Date.now()).toLocaleDateString()}`;
        }
        
        const date = session.updatedAt || session.createdAt || new Date().toISOString();
        const sessionUserId = session.userId;

        let messagesInSession = [];
        if (session.messages && Array.isArray(session.messages)) {
          messagesInSession = session.messages.map(msg => ({
            id: msg._id || `msg-${Date.now()}-${Math.random()}`,
            text: msg.content || msg.text || "", // Ensure text is always a string
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: msg.timestamp || msg.createdAt || date, // Use session date if message timestamp missing
          })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort messages within session
        }
        
        return {
          id: sessionId, // Local reference ID
          sessionId: mongoId, // Store the original MongoDB _id for API calls
          title: title,
          date: date, // Store raw date for sorting, format for display later
          messages: messagesInSession,
          userId: sessionUserId
        };
      }).filter(Boolean) // Remove nulls from skipped sessions
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort history by date, newest first

      
      if (processedHistory.length > 0) {
        setChatHistory(processedHistory);
        
        // Check if we have a saved session ID in sessionStorage
        const savedSessionId = sessionStorage.getItem('niveshpath_session_id');
        
        if (savedSessionId) {
          // Find the chat with the matching ID
          const savedChat = processedHistory.find(chat => chat.id === savedSessionId);
          
          if (savedChat) {
            // Load the saved chat
            console.log('Restoring chat session from localStorage:', savedSessionId);
            
            if (savedChat.messages && savedChat.messages.length > 0) {
              setMessages(savedChat.messages);
              setShowWelcome(false);
            } else {
              setMessages([]);
              setShowWelcome(true);
            }
          } else {  
            // If the saved session ID doesn't match any chat, show welcome
            if (messages.length === 0) { // Only show welcome if no active chat is loaded
              setShowWelcome(true);
            }
          }
        } else {
          // If no saved session ID, show welcome if no messages
          if (messages.length === 0) { // Only show welcome if no active chat is loaded
            setShowWelcome(true);
          }
        }
      } else {
        setMessages([]);
        setChatHistory([]);
        setShowWelcome(true);
        sessionStorage.removeItem('niveshpath_session_id'); // Clear session ID if no history
      }

    } catch (err) {
      console.error("Error fetching/processing chat history from API:", err);
      setError(err.message || "Failed to load chat history from server.");
      toast.error(err.message || "Failed to load chat history from server. No cache fallback.");
      setMessages([]);
      setChatHistory([]);
      setShowWelcome(true);
    } finally {
      setLoading(false);
    }
  };
  

  
  // Function to delete a specific chat from history
  const deleteChat = async (chatId, event) => {
    event.stopPropagation(); // Prevent triggering the parent button click

    if (!isAuthenticated) {
      toast.info('Please login to manage chat history');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // Find the chat to be deleted BEFORE any modifications
      const chatToDelete = chatHistory.find(chat => chat.id === chatId);

      if (!chatToDelete) {
        toast.error("Could not find the chat to delete.");
        setLoading(false);
        return;
      }

      // If user is authenticated, delete from server too
      if (currentUser?.id) {
        try {
          // Check if chatId is a valid MongoDB ObjectId (24 character hex string)
          // If not, try to get the sessionId from the chat object
          const sessionId = chatToDelete.sessionId || chatId;
          
          if (!sessionId) {
            throw new Error('No valid sessionId found for deletion');
          }
          
          // Make sure we're using the correct sessionId for the API call
          console.log('Deleting chat session with ID:', sessionId);
          const response = await apiService.chatbot.deleteSession(sessionId);
          console.log('Delete session response:', response);
          
          if (response && response.message) {
            toast.success(response.message || 'Chat successfully deleted from server');
          } else {
            toast.success('Chat successfully deleted from server');
          }
        } catch (apiError) {
          console.error('Error deleting chat from server:', apiError);
          toast.error('Problem deleting chat from server. It will be removed locally.');
          // Continue with local deletion even if server deletion fails (current behavior)
        }
      }

      // Remove chat from local state
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedHistory);

      // If unauthenticated, show a success message for local deletion
      if (!currentUser?.id) {
        toast.success('Chat successfully deleted locally');
      }

      // Check if the deleted chat was the active one and reset messages
      // Use chatToDelete which was captured before history was modified
      if (messages.length > 0 && chatToDelete.messages && chatToDelete.messages.length > 0) {
        const currentFirstMsgContent = messages[0]?.text || messages[0]?.content;
        const deletedFirstMsgContent = chatToDelete.messages[0]?.text || chatToDelete.messages[0]?.content;

        // This comparison is based on current logic. If an activeChatId state exists,
        // comparing activeChatId === chatId would be more robust.
        if (currentFirstMsgContent === deletedFirstMsgContent) {
          // Resetting current chat to welcome message or clearing it
          if (typeof welcomeMessage !== 'undefined') {
            setMessages([welcomeMessage]); // Assumes welcomeMessage is a single message object
          } else {
            setMessages([]); // Fallback: clear messages
            console.warn("welcomeMessage is not defined in Chatbot.jsx. Clearing messages instead.");
          }
          // Clear session ID if the deleted chat was the active one
          setSessionId(null);
          sessionStorage.removeItem('niveshpath_session_id');
        }
      }
      
      // If the deleted chat ID matches the current session ID, clear it
      const savedSessionId = sessionStorage.getItem('niveshpath_session_id');
      if (savedSessionId === chatId) {
        setSessionId(null);
        sessionStorage.removeItem('niveshpath_session_id');
      }
      // No localStorage updates needed
    } catch (error) {
      console.error('Error in deleteChat function:', error);
      toast.error('Failed to delete chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to clear chat history
  const clearChat = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to manage chat history');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      // Clearing all chat history
      
      // If user is authenticated, clear from server too
      if (currentUser?.id) {
        try {
          await apiService.chatbot.clearAllChats(currentUser.id);
          toast.success('Chat history successfully cleared from server');
        } catch (apiError) {
          console.error('Error clearing chat history from server:', apiError);
          toast.error('Problem clearing chat history from server');
          // Continue with local deletion even if server deletion fails
        }
      }
      
      // Reset messages and show welcome message
      setMessages([]);
      setShowWelcome(true);
      
      // Clear session ID
      setSessionId(null);
      sessionStorage.removeItem('niveshpath_session_id');
      
      // Create a default chat entry after clearing
      const defaultChat = {
        id: 1,
        title: 'New Financial Chat',
        date: new Date().toLocaleDateString(),
        messages: [],
        userId: currentUser?.id || 'guest'
      };
      
      // Update state with the default chat
      setChatHistory([defaultChat]);
      
      // Show success message if not already shown
      if (!currentUser?.id) {
        toast.success('Chat history successfully cleared');
      }
      
      setInput('');
      setError(null);
      setNewChat(true);
      toast.success('Chat history successfully cleared');
    } catch (error) {
      console.error('Error in clearChat function:', error);
      toast.error('Failed to clear chat history. Please try again.');

      
      // Set default welcome message as fallback
      // setMessages([welcomeMessage]);
      // setShowWelcome(true); // Show welcome message for new chat
    } finally {
      setLoading(false);
    }
  };
  
  // Function to start a new chat
  const startNewChat = () => {
    if (!isAuthenticated) {
      toast.info('Please login to start a new chat');
      navigate('/login');
      return;
    }
    
    // Starting a new chat
    
    // Set flag to indicate this is a new page/conversation
    sessionStorage.setItem('isNewPageNavigation', 'true');
    // Clear any existing conversation ID
    sessionStorage.removeItem('currentConversationId');
    
    // Reset messages and show welcome message
    setMessages([]);
    setShowWelcome(true); // Show welcome message for new chat
    
    // Reset input and error state
    setInput('');
    setError(null);
    setNewChat(true);
    
    // Generate a unique ID for the new chat
    const newChatId = chatHistory.length > 0 ? 
      Math.max(...chatHistory.map(chat => chat.id)) + 1 : 1;
      
    // Set the new session ID
    setSessionId(newChatId.toString());
    sessionStorage.setItem('niveshpath_session_id', newChatId.toString());
    
    // Add new chat to history with user ID
    const newChatEntry = {
      id: newChatId,
      title: 'New Financial Chat',
      date: new Date().toLocaleDateString(),
      messages: [],
      userId: currentUser?.id || 'guest' // Add user ID to new chat
    };
    
    // Show success message
    toast.success('New chat successfully started');
    
    // Add new chat to the beginning of the history array
    const updatedHistory = [newChatEntry, ...chatHistory];
    
    // Update chat history with new chat
    setChatHistory(updatedHistory);
    
    // Close sidebar on mobile after starting new chat
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Hide welcome message when user starts typing
    if (showWelcome) {
      setShowWelcome(false);
    }
    
    // Check if user has completed onboarding - only check once per session
    const hasCheckedOnboarding = sessionStorage.getItem('onboardingChecked');
    
    if (!hasCheckedOnboarding && !onboardingCompleted) {
      setShowOnboarding(true);
      sessionStorage.setItem('onboardingChecked', 'true');
      return;
    }
    
    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prevMessages => {
      const updated = [...prevMessages, userMessage];
      return updated;
    });
    
    setInput(''); // Clear input after sending
    setIsTyping(true);
    
    try {
      // Send message to backend API
      // Use the input from the userMessage, as 'input' state is cleared
      const currentInput = userMessage.text;
      
      // Get current conversationId if it exists in the current chat session
      let currentConversationId = null;
      if (messages.length > 0 && sessionStorage.getItem('currentConversationId')) {
        currentConversationId = sessionStorage.getItem('currentConversationId');
      }
      
      // Check if this is a new page navigation (based on a flag we'll set when navigating)
      const isNewPage = sessionStorage.getItem('isNewPageNavigation') === 'true';
      
      // Send message with appropriate parameters
      const response = await apiService.chatbot.sendMessage(
        currentInput.trim(), 
        currentConversationId,
        isNewPage
      );
      
      // Store the conversationId for future messages on this page
      if (response.data && response.data.conversationId) {
        sessionStorage.setItem('currentConversationId', response.data.conversationId);
      }
      
      // Reset the new page navigation flag
      if (isNewPage) {
        sessionStorage.removeItem('isNewPageNavigation');
      }
      
      // Process the response from the API
      if (response.data && response.data.response) {
        const botMessage = { 
          id: Date.now() + 1, // Ensure unique ID
          text: response.data.response, 
          isBot: true 
        };
        
        setMessages(prevMessages => {
          const updated = [...prevMessages, botMessage];

          // Update chat history using the 'updated' messages array
          setChatHistory(prevChatHistory => {
            let newHistoryState = [...prevChatHistory];
            let wasNewChatProcessed = false;

            if (newHistoryState.length > 0) {
              const currentChat = { ...newHistoryState[0] }; // Work on a copy
              currentChat.messages = updated; // 'updated' is the full list [UserQuery, BotResponse]

              if (newChat) { // 'newChat' is from the outer scope of handleSubmit
                currentChat.title = userMessage.text.length > 20 ? userMessage.text.substring(0, 20) + '...' : userMessage.text;
                wasNewChatProcessed = true; // Mark that we handled the newChat logic
              }
              newHistoryState[0] = currentChat;
            }
            // If newHistoryState was empty, it remains empty. This assumes startNewChat correctly initializes history.
            
            if (wasNewChatProcessed) {
              setNewChat(false); // Update newChat state here, based on processing within this update
            }
            return newHistoryState;
          });
          return updated;
        });
        
        // Scroll to the user's question after response is received
        setTimeout(() => {
          scrollToLatestQuestion();
        }, 300);
      } else {
        // Fallback in case the API response format is unexpected
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      setError('Failed to get a response. Please try again.');
      toast.error('Failed to get a response. Please try again.');
      
      // Add a fallback bot message
      const errorMessage = { 
        id: Date.now() + 1, // Ensure unique ID
        text: 'Sorry, I encountered an error processing your request. Please try again later.', 
        isBot: true 
      };
      setMessages(prevMessages => {
        const updated = [...prevMessages, errorMessage];
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Function to scroll to the latest user question
  const scrollToLatestQuestion = () => {
    // Find the last user message
    const userMessages = messages.filter(msg => !msg.isBot);
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      const element = document.getElementById(`message-${lastUserMessage.id}`);
      if (element) {
        // Scroll to the user's question but keep it in view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Auto-scroll to bottom when new messages are added, but only if user hasn't scrolled up
  useEffect(() => {
    // Only auto-scroll if we're adding a new bot message or when typing indicator appears/disappears
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isBot || isTyping) {
      // Scroll to the user's question instead of the bottom to keep context visible
      scrollToLatestQuestion();
    }
  }, [messages, isTyping]);
  
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
        
        {/* Chat History - Enhanced modern style */}
        <div className={`flex-1 overflow-y-auto px-3 py-2 ${showHistory ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            <h3 className="text-xs uppercase text-gray-700 dark:text-gray-300 font-semibold px-1 tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chat History
            </h3>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50"
              title={showHistory ? 'Hide History' : 'Show History'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: showHistory ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {!isAuthenticated ? (
            <div className="text-center p-3 text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <p>Please login to view your chat history</p>
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 block">Login</Link>
            </div>
          ) : loading ? (
            <div className="text-center p-3 text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <p>Loading chat history...</p>
              <div className="loader mt-2 mx-auto"></div>
            </div>
          ) : chatHistory && chatHistory.length === 0 ? (
            <div className="text-center p-3 text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <p>No chat history found</p>
              <button 
                onClick={startNewChat}
                className="text-blue-600 dark:text-blue-400 hover:underline mt-2 block mx-auto"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Filter chats to only show current user's chats */}
              {chatHistory && Array.isArray(chatHistory) && chatHistory
                .filter(chat => !chat.userId || chat.userId === (currentUser?.id || 'guest'))
                .map(chat => (
                <div key={chat.id} className="relative group">
                  <button 
                    className="w-full text-left p-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-start gap-3 overflow-hidden text-sm border border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-secondary/30 shadow-sm hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-secondary/50"
                    onClick={() => loadChatFromHistory(chat)} // Call with only chat object
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center flex-shrink-0 text-primary dark:text-secondary shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden flex-grow">
                      <div className="truncate font-medium group-hover:text-primary dark:group-hover:text-secondary transition-colors">{chat.title}</div>
                     </div>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-opacity-50"
                      title="Delete Chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </button>
                </div>
              ))}
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
            {isMobile ? (
              <button 
                onClick={startNewChat}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-all duration-300 hover:shadow-sm hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
                aria-label="New chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={clearChat}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-all duration-300 hover:shadow-sm hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
                disabled={loading || isTyping}
                aria-label="Clear conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden md:inline text-sm font-medium">Clear</span>
              </button>
            )}
          </div>
        </header>
        
        {/* Messages Container - Enhanced modern style */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 pb-20 sm:pb-24 relative">
          
          {/* Down arrow button to scroll to latest answer - Enhanced with animation */}
          {messages.length > 1 && (
            <button 
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="fixed bottom-24 right-6 z-20 p-2.5 rounded-full bg-primary dark:bg-secondary text-white shadow-lg hover:bg-primary-dark dark:hover:bg-secondary-dark transition-all duration-300 border border-primary-light dark:border-secondary-light hover:scale-110 animate-bounce-slow focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:ring-opacity-50"
              aria-label="Scroll to answer"
              title="Scroll to see answer"
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
          
          {/* Empty state when no messages but showWelcome is false (chat history was loaded) */}
          {messages.length === 0 && !showWelcome && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-secondary/20 flex items-center justify-center mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Chat Session Loaded</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">This chat session has no messages yet. Start a conversation below.</p>
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
                      {/* Always show user's question above bot response */}
                      {index > 0 && messages[index-1] && !messages[index-1].isBot && (
                        <div className="text-gray-800 dark:text-white text-sm sm:text-base whitespace-pre-wrap bg-secondary/10 dark:bg-secondary/20 p-4 mb-4 rounded-lg border border-secondary/30 dark:border-secondary/40 font-medium shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold bg-secondary/20 dark:bg-secondary/30 text-secondary dark:text-secondary-light px-2 py-0.5 rounded-full">Your Question</span>
                          </div>
                          {messages[index-1].text}
                        </div>
                      )}
                      <div>
                        {formatBotMessage(message.text)}
                        {/* Copy and Share buttons below the message */}
                        <div className="mt-4 flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(message.text);
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
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-800 dark:text-white text-sm sm:text-base whitespace-pre-wrap bg-secondary/10 dark:bg-secondary/20 p-4 rounded-lg border border-secondary/30 dark:border-secondary/40 font-medium shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold bg-secondary/20 dark:bg-secondary/30 text-secondary dark:text-secondary-light px-2 py-0.5 rounded-full">Your Question</span>
                      </div>
                      {message.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Removed divider lines after questions */}
          {isTyping && (
            <div className="py-6 px-4 md:px-6 bg-white dark:bg-gray-800 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700">
              <div className="w-full max-w-2xl mx-auto">
                <div className="font-medium text-sm mb-2 flex items-center">
                  <span className="text-blue-600 dark:text-blue-400">NiveshPath AI</span>
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">AI</span>
                </div>
                <div className="flex space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm inline-flex">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? "Ask me about investments, financial planning, or any financial questions..." : "Please login to chat..."}
              className="w-full p-3 sm:p-4 pr-14 max-h-40 focus:outline-none bg-transparent text-gray-800 dark:text-white text-sm md:text-base resize-none transition-colors duration-200 overflow-hidden"
              disabled={isTyping || loading || !isAuthenticated}
              rows="1"
              style={{ minHeight: '56px' }}
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
            border: 1px solid #e1e1e1;
          }
          
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
};


export default Chatbot;