import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


//  PDF Download
export const downloadPDF = (data,) => {
  const doc = new jsPDF();

  const tableColumn = ["Seva Name", "Amount", "Status"];
  const tableRows = data.map((item) => [
    item.seva_name,
    item.seva_amount,
    item.status,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("seva-bookings.pdf");
};

//  Excel Download
export const downloadExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, "seva-bookings.xlsx");
};
 // CSV Download
export const downloadCSV = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "seva-bookings.csv");
};