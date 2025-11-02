/**
 * CSV Export service for generating eBird-compatible checklist files
 */

import type { BirdList, EBirdCSVRow } from '../types';

/**
 * Converts a BirdList to eBird CSV format and triggers download
 */
export function exportToEBirdCSV(list: BirdList): void {
  const rows = convertToEBirdCSVRows(list);
  const csv = generateCSV(rows);
  downloadCSV(csv, generateFilename(list.startDate));
}

/**
 * Converts a BirdList to an array of eBird CSV rows
 * Using the official eBird Record Format specification
 */
function convertToEBirdCSVRows(list: BirdList): EBirdCSVRow[] {
  const startDate = new Date(list.startDate);
  const endDate = list.endDate ? new Date(list.endDate) : startDate;

  // Calculate duration in minutes
  const durationMinutes = list.durationMinutes ||
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

  // Format date as MM/DD/YYYY
  const dateStr = formatDate(startDate);

  // Format time as HH:MM AM/PM
  const timeStr = formatTime(startDate);

  // Convert distance from km to miles (1 km = 0.621371 miles)
  const distanceMiles = list.distanceKm ? (list.distanceKm * 0.621371).toFixed(2) : '';

  // Convert area from any internal format to acres if needed
  const areaAcres = list.areaAcres?.toString() || '';

  // Get location details with defaults
  const latitude = list.location.latitude?.toString() || '';
  const longitude = list.location.longitude?.toString() || '';
  const stateProvince = list.stateProvince || 'VIC'; // Default to Victoria
  const county = list.county || 'Melbourne'; // Default to Melbourne
  const numberOfObservers = list.numberOfObservers?.toString() || '1';

  // Convert each sighting to a CSV row
  return list.sightings.map(sighting => {
    // Parse genus and species from scientificName if not provided
    let genus = sighting.genus || '';
    let species = sighting.species || '';

    if (!genus && !species && sighting.scientificName) {
      const parts = sighting.scientificName.split(' ');
      genus = parts[0] || '';
      species = parts[1] || '';
    }

    return {
      'Common Name': sighting.commonName,
      'Genus': genus,
      'Species': species,
      'Number': sighting.count.toString(),
      'Species Comments': sighting.comments || '',
      'Location Name': list.location.name,
      'Latitude': latitude,
      'Longitude': longitude,
      'Date': dateStr,
      'Time': timeStr,
      'State/Province': stateProvince,
      'County': county,
      'Protocol': list.protocol,
      'Number of Observers': numberOfObservers,
      'Duration': durationMinutes.toString(),
      'All Obs Reported': list.allObsReported ? 'Y' : 'N',
      'Effort Distance Miles': distanceMiles,
      'Effort Area Acres': areaAcres,
      'Submission Comments': list.notes || '',
    };
  });
}

/**
 * Formats a Date object as MM/DD/YYYY for eBird
 */
function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Formats a Date object as HH:MM AM/PM for eBird
 */
function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Converts array of CSV rows to CSV string
 * Properly handles escaping of quotes and commas in field values
 */
function generateCSV(rows: EBirdCSVRow[]): string {
  if (rows.length === 0) {
    return '';
  }

  // Get headers from the first row
  const headers = Object.keys(rows[0]) as (keyof EBirdCSVRow)[];

  // Create header row
  const headerLine = headers.map(escapeCSVField).join(',');

  // Create data rows
  const dataLines = rows.map(row =>
    headers.map(header => escapeCSVField(row[header])).join(',')
  );

  // Combine header and data
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Escapes a CSV field value
 * Wraps in quotes if contains comma, quote, or newline
 * Doubles any internal quotes
 */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Double any quotes and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates a filename for the CSV export
 */
function generateFilename(startDate: Date): string {
  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `ebird_checklist_${year}${month}${day}_${hours}${minutes}${seconds}.csv`;
}

/**
 * Triggers a browser download of the CSV content
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Create a Blob with UTF-8 BOM for Excel compatibility
  const BOM = '\ufeff';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  // Create a temporary download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Validates that a checklist has all required data for export
 * Returns an error message if invalid, or null if valid
 */
export function validateChecklistForExport(list: BirdList): string | null {
  if (!list.location.name || list.location.name.trim() === '') {
    return 'Location name is required';
  }

  if (list.sightings.length === 0) {
    return 'Checklist must have at least one sighting';
  }

  // Check if any sightings are missing genus/species or scientific name
  const missingSightings = list.sightings.filter(s => {
    const hasGenus = s.genus && s.species;
    const hasScientificName = s.scientificName && s.scientificName.includes(' ');
    return !hasGenus && !hasScientificName;
  });

  if (missingSightings.length > 0) {
    const birdNames = missingSightings.map(s => s.commonName).join(', ');
    return `Warning: Some birds are missing scientific names: ${birdNames}. eBird may not accept this checklist.`;
  }

  // Warn if coordinates are missing
  if (!list.location.latitude || !list.location.longitude) {
    return 'Warning: Location coordinates are missing. eBird requires latitude and longitude.';
  }

  return null;
}
