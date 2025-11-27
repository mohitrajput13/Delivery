import fs from 'fs';
import Papa from 'papaparse';
import XLSX from 'xlsx';

export const parseCSV = (filePath) => {
  const csvFile = fs.readFileSync(filePath, 'utf8');
  const result = Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
};

export const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return json;
};
