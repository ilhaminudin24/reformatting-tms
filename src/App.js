import React, { useState } from "react";

// Format pickDateTime from ISO 8601 to readable format
const formatPickDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateTimeString; // Return original if parsing fails
  }
};

// Format timeslot from 12-hour AM/PM to 24-hour format
const formatTimeslot = (timeslotString) => {
  if (!timeslotString) return "";
  try {
    // Remove extra spaces and split by ".."
    const cleaned = timeslotString.trim().replace(/\s+/g, ' ');
    const parts = cleaned.split('..');
    
    if (parts.length !== 2) return timeslotString; // Return original if format is unexpected
    
    const formatTime = (timeStr) => {
      const trimmed = timeStr.trim();
      // Extract time and AM/PM
      const match = trimmed.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return trimmed;
      
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const seconds = match[3];
      const period = match[4].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
    };
    
    const startTime = formatTime(parts[0]);
    const endTime = formatTime(parts[1]);
    
    return `${startTime}..${endTime}`;
  } catch (error) {
    return timeslotString; // Return original if parsing fails
  }
};

// Format codTask from boolean to integer
const formatCodTask = (codTaskValue) => {
  if (codTaskValue === true) return 1;
  if (codTaskValue === false) return 0;
  return codTaskValue; // Return original if not boolean
};

// Enhanced CSV generation with proper escaping and UTF-8 encoding
const generateCSV = (data) => {
  if (!data || data.length === 0) return "";

  // CSV Headers
  const headers = [
    'soNo', 'storeNo', 'eCommOrderNo', 'salesChannel', 'orderDate', 
    'productAmount', 'productAmountVat', 'serviceAmount', 'serviceAmountVat', 
    'itemCnt', 'pkgs', 'pickDateTime', 'payStatus', 'shipCust', 'shipAddr', 
    'locationCode', 'shipPostal', 'shipCity', 'shipPhone', 'shipEmail', 
    'codTask', 'codAmount', 'orderCmt', 'services'
  ];

  // Enhanced CSV field escaping with proper quote handling
  const escapeCSVField = (field) => {
    if (field === null || field === undefined || field === "") return "";
    
    const stringField = String(field);
    
    // Clean the string: remove hidden characters and normalize newlines
    const cleanedField = stringField
      .replace(/\r\n/g, ' ') // Replace Windows line breaks
      .replace(/\r/g, ' ')   // Replace Mac line breaks
      .replace(/\n/g, ' ')   // Replace Unix line breaks
      .replace(/\t/g, ' ')   // Replace tabs
      .replace(/\s+/g, ' ')  // Normalize multiple spaces
      .trim();
    
    // Always wrap in quotes for consistency and to handle special characters
    // This ensures proper UTF-8 handling and prevents parsing issues
    return `"${cleanedField.replace(/"/g, '""')}"`;
  };

  // Convert services array to single-line JSON string for CSV
  const servicesToCSV = (services) => {
    if (!services || services.length === 0) return "";
    
    try {
      // Convert to JSON and ensure it's a single line
      const jsonString = JSON.stringify(services);
      
      // Clean the JSON string to ensure it's safe for CSV
      const cleanedJson = jsonString
        .replace(/\r\n/g, ' ') // Replace Windows line breaks
        .replace(/\r/g, ' ')   // Replace Mac line breaks
        .replace(/\n/g, ' ')   // Replace Unix line breaks
        .replace(/\t/g, ' ')   // Replace tabs
        .replace(/\s+/g, ' ')  // Normalize multiple spaces
        .trim();
      
      // The JSON is already properly escaped, just wrap in quotes
      return `"${cleanedJson.replace(/"/g, '""')}"`;
    } catch (error) {
      console.error('Error converting services to CSV:', error);
      return '""'; // Return empty quoted string on error
    }
  };

  // Generate CSV content with proper line endings
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(order => [
      escapeCSVField(order.soNo),
      escapeCSVField(order.storeNo),
      escapeCSVField(order.eCommOrderNo),
      escapeCSVField(order.salesChannel),
      escapeCSVField(order.orderDate),
      escapeCSVField(order.productAmount),
      escapeCSVField(order.productAmountVat),
      escapeCSVField(order.serviceAmount),
      escapeCSVField(order.serviceAmountVat),
      escapeCSVField(order.itemCnt),
      escapeCSVField(order.pkgs),
      escapeCSVField(order.pickDateTime),
      escapeCSVField(order.payStatus),
      escapeCSVField(order.shipCust),
      escapeCSVField(order.shipAddr),
      escapeCSVField(order.locationCode),
      escapeCSVField(order.shipPostal),
      escapeCSVField(order.shipCity),
      escapeCSVField(order.shipPhone),
      escapeCSVField(order.shipEmail),
      escapeCSVField(order.codTask),
      escapeCSVField(order.codAmount),
      escapeCSVField(order.orderCmt),
      servicesToCSV(order.services)
    ].join(','))
  ];

  // Join with Unix line endings for consistency
  return csvRows.join('\n');
};

// Enhanced CSV download with UTF-8 BOM for Excel compatibility
const downloadCSV = (csvContent, filename = 'tms_data.csv') => {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  // Create blob with UTF-8 encoding
  const blob = new Blob([csvWithBOM], { 
    type: 'text/csv;charset=utf-8'
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

function transformData(input) {
  // Handle both original TMS format and already transformed format
  let orders = [];
  
  if (input.value && Array.isArray(input.value)) {
    // Original TMS format with @odata.context and value array
    orders = input.value;
  } else if (Array.isArray(input)) {
    // Already transformed format (direct array)
    orders = input;
  } else {
    return [];
  }

  return orders.map(order => {
    // Check if this is already in transformed format
    if (order.soNo && order.services) {
      // Already transformed - just apply formatting
      return {
        ...order,
        pickDateTime: formatPickDateTime(order.pickDateTime),
        codTask: formatCodTask(order.codTask),
        services: order.services.map(svc => ({
          ...svc,
          timeslot: formatTimeslot(svc.timeslot)
        }))
      };
    }

    // Original TMS format - need full transformation
    // Calculate serviceAmount and serviceAmountVat
    const serviceItems = order.dfCreateDeliveryOrderServiceItems || [];
    const serviceAmount = serviceItems.reduce((sum, item) => sum + (item.unitPrice || 0), 0);

    // Map services
    const services = (order.dfCreateDeliveryOrderServices || []).map((svc, idx) => {
      // Find items for this service
      const items = (order.dfCreateDeliveryOrderServiceItems || []).filter(
        item => item.svcOrdNo === svc.svcOrdNo
      ).map(item => ({
        lineNo: item.lineNoIMV,
        itemNo: item.itemNo,
        itemDesc: item.itemDesc,
        qty: item.quantity,
        weight: item.weight,
        volume: item.volume,
        unitPrice: item.unitPrice,
        pkgs: item.NoOfPkgs
      }));

      // Sum weights and volumes for this service
      const gw = items.reduce((sum, item) => sum + (item.weight || 0), 0);
      const cbm = items.reduce((sum, item) => sum + (item.volume || 0), 0);

      return {
        svcOrdNo: svc.svcOrdNo,
        svcItemNo: svc.svcItemNo,
        svcName: svc.svcName,
        svcProviderName: svc.serviceProviderName,
        svcDate: svc.date,
        timeslot: formatTimeslot(svc.timeslot),
        status: svc.status,
        gdval: 0,
        gw: gw.toFixed(4),
        cbm: cbm.toFixed(4),
        prxOrg: 0,
        prxVat: 0,
        docLineNo: idx + 1,
        svcCmt: svc.svcCmt,
        pkgs: svc.NoOfPkgs,
        items
      };
    });

    return {
      soNo: order.shipRef,
      storeNo: order.storeNo,
      eCommOrderNo: order.secondRef,
      salesChannel: order.salesChannel,
      orderDate: order.orderDate,
      productAmount: order.productAmount,
      productAmountVat: order.productAmountVat,
      serviceAmount: serviceAmount,
      serviceAmountVat: serviceAmount,
      itemCnt: order.itemCnt,
      pkgs: order.pkgs,
      pickDateTime: formatPickDateTime(order.pickDateTime),
      payStatus: "Paid",
      shipCust: order.shipCust,
      shipAddr: order.shipAddr,
      locationCode: order.locationCode,
      shipPostal: order.shipPostal,
      shipCity: order.shipCity,
      shipPhone: order.shipPhone,
      shipEmail: order.shipEmail,
      codTask: formatCodTask(order.codTask),
      codAmount: order.codAmount,
      orderCmt: order.orderCmt,
      services
    };
  });
}

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTransform = () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const parsed = JSON.parse(input);
      const result = transformData(parsed);
      setOutput(JSON.stringify(result, null, 2));
      
      // Generate CSV
      const csvContent = generateCSV(result);
      setCsvOutput(csvContent);
      
      setSuccess(`✅ Successfully transformed ${result.length} order(s) and generated CSV`);
    } catch (e) {
      setError(`❌ Invalid JSON input: ${e.message}`);
      setOutput("");
      setCsvOutput("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setCsvOutput("");
    setError("");
    setSuccess("");
  };

  const handleCopyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setSuccess("✅ JSON output copied to clipboard!");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleCopyCSV = () => {
    if (csvOutput) {
      navigator.clipboard.writeText(csvOutput);
      setSuccess("✅ CSV output copied to clipboard!");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (csvOutput) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadCSV(csvOutput, `tms_data_${timestamp}.csv`);
      setSuccess("✅ CSV file downloaded with UTF-8 encoding!");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleLoadSample = () => {
    const sampleData = {
      "@odata.context": "https://francvila.dfi-ikea.co.id:10148/UAT603PII/api/k3/logistics/v1.0/$metadata#companies(528777c4-3ddc-491c-adf4-dcae745e8f7a)/dfCreateDeliveryOrders",
      "value": [
        {
          "@odata.etag": "W/\"JzQ0O1JJMWZncGdDNnd5cGY0dnk4b2xON1Z4L2lNcUtUdlpYeCtibzZHOVIvQ0U9MTswMDsn\"",
          "id": "e4e61d90-086a-4696-bc8e-43f1adfe1a84",
          "shipRef": "60325068657",
          "storeNo": "603",
          "secondRef": "157303791",
          "salesChannel": "ECOM",
          "orderDate": "2025-06-27",
          "productAmount": 4503603.6036036036,
          "productAmountVat": 4999000,
          "itemCnt": 1,
          "pkgs": 3,
          "payStatus": "",
          "shipCust": "ilham",
          "shipAddr": "jalan jalan",
          "locationCode": "jalan",
          "shipPostal": "16519",
          "pickDateTime": "0001-01-01T00:00:00Z",
          "shipCity": "Depok(Bedahan)",
          "shipPhone": "85155222344",
          "shipEmail": "ilham@mail.com",
          "orderCmt": "",
          "codTask": false,
          "codAmount": 0,
          "dfCreateDeliveryOrderServices": [
            {
              "@odata.etag": "W/\"JzQ0O2x5WVZSMk02Z0djOEFseENBT0RWNndNUXhITFIzUkhIR2JucFlKSFo0QmM9MTswMDsn\"",
              "documentId": "e4e61d90-086a-4696-bc8e-43f1adfe1a84",
              "docLineNo": 1,
              "svcOrdNo": "60325149541",
              "svcItemNo": "HD HOUSE",
              "svcName": "Home Delivery House Ecommerce",
              "serviceProviderName": "DHL HOUSE JABO",
              "date": "2025-07-03",
              "timeslot": " 9:00:00 AM.. 8:00:00 PM",
              "status": "Service Provider Contacted",
              "gdval": 0,
              "prxOrg": 169000,
              "prxVat": 169000,
              "NoOfPkgs": 3,
              "svcCmt": ""
            }
          ],
          "dfCreateDeliveryOrderServiceItems": [
            {
              "@odata.etag": "W/\"JzQ0O05ndHZvcGxOVDVnK1hGQUgrckNVWVJVZlhRK3NqMWovdWFhUnNXR2FmUkE9MTswMDsn\"",
              "documentId": "e4e61d90-086a-4696-bc8e-43f1adfe1a84",
              "lineNoIMV": 1,
              "svcOrdNo": "60325149541",
              "sequence": 10000,
              "itemNo": "70378683",
              "itemDesc": "MUSKEN N WRD 2DR+3DRW 124X60X201 BROWN AP",
              "quantity": 1,
              "weight": 99.9500000000000028,
              "volume": 0.241799999999999987,
              "unitPrice": 4999000,
              "NoOfPkgs": 3
            }
          ]
        }
      ]
    };
    setInput(JSON.stringify(sampleData, null, 2));
    setError("");
    setSuccess(" Sample data loaded!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div style={{ 
      padding: 24, 
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: "1400px",
      margin: "0 auto",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px"
      }}>
        <h1 style={{ 
          margin: "0 0 8px 0", 
          color: "#2c3e50",
          fontSize: "28px",
          fontWeight: "600"
        }}>
          🔄 TMS JSON Reformatting Tool
        </h1>
        <p style={{ 
          margin: "0 0 24px 0", 
          color: "#6c757d",
          fontSize: "16px"
        }}>
          Transform your TMS JSON data with automatic formatting and export to CSV.
        </p>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "14px",
          fontWeight: "500",
          ...(error ? {
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb"
          } : {
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb"
          })
        }}>
          {error || success}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={handleLoadSample}
          style={{
            padding: "10px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#5a6268"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#6c757d"}
        >
          📋 Load Sample Data
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: "10px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#c82333"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
        >
         ️ Clear All
        </button>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "500px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}>
            <h4 style={{ margin: 0, color: "#2c3e50", fontSize: "18px" }}>
              📥 Input JSON
            </h4>
            <span style={{ 
              fontSize: "12px", 
              color: "#6c757d",
              backgroundColor: "#e9ecef",
              padding: "4px 8px",
              borderRadius: "4px"
            }}>
              {input.length} characters
            </span>
          </div>
          <textarea
            rows={25}
            style={{
              width: "100%",
              padding: "16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "13px",
              lineHeight: "1.4",
              resize: "vertical",
              transition: "border-color 0.2s"
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your TMS JSON data here..."
            onFocus={(e) => e.target.style.borderColor = "#007bff"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
        </div>
        
        <div style={{ flex: "1", minWidth: "500px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}>
            <h4 style={{ margin: 0, color: "#2c3e50", fontSize: "18px" }}>
              📤 Output JSON
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ 
                fontSize: "12px", 
                color: "#6c757d",
                backgroundColor: "#e9ecef",
                padding: "4px 8px",
                borderRadius: "4px"
              }}>
                {output.length} characters
              </span>
              {output && (
                <button
                  onClick={handleCopyOutput}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>
          <textarea
            rows={25}
            style={{
              width: "100%",
              padding: "16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "13px",
              lineHeight: "1.4",
              resize: "vertical",
              backgroundColor: "#f8f9fa"
            }}
            value={output}
            readOnly
            placeholder="Transformed JSON will appear here..."
          />
        </div>
      </div>

      {/* CSV Output Section */}
      {csvOutput && (
        <div style={{ marginTop: "24px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}>
            <h4 style={{ margin: 0, color: "#2c3e50", fontSize: "18px" }}>
              📊 CSV Output
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ 
                fontSize: "12px", 
                color: "#6c757d",
                backgroundColor: "#e9ecef",
                padding: "4px 8px",
                borderRadius: "4px"
              }}>
                {csvOutput.length} characters
              </span>
              <button
                onClick={handleCopyCSV}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500"
                }}
              >
                📋 Copy CSV
              </button>
              <button
                onClick={handleDownloadCSV}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#fd7e14",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500"
                }}
              >
                💾 Download CSV
              </button>
            </div>
          </div>
          <textarea
            rows={15}
            style={{
              width: "100%",
              padding: "16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "1.3",
              resize: "vertical",
              backgroundColor: "#f8f9fa"
            }}
            value={csvOutput}
            readOnly
            placeholder="CSV output will appear here..."
          />
        </div>
      )}
      
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginTop: "24px",
        gap: "12px"
      }}>
        <button
          onClick={handleTransform}
          disabled={isLoading || !input.trim()}
          style={{
            padding: "14px 32px",
            backgroundColor: isLoading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.2s",
            minWidth: "160px"
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.target.style.backgroundColor = "#0056b3";
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.target.style.backgroundColor = "#007bff";
          }}
        >
          {isLoading ? "⏳ Processing..." : "🔄 Transform & Generate CSV"}
        </button>
      </div>

      {/* Formatting Info */}
      <div style={{
        marginTop: "32px",
        padding: "20px",
        backgroundColor: "#e3f2fd",
        borderRadius: "8px",
        border: "1px solid #bbdefb"
      }}>
        <h5 style={{ margin: "0 0 12px 0", color: "#1565c0" }}>
          📋 Enhanced CSV Formatting Features:
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: "20px",
          color: "#1976d2",
          fontSize: "14px",
          lineHeight: "1.6"
        }}>
          <li><strong>UTF-8 BOM:</strong> Added for Excel compatibility</li>
          <li><strong>Proper Quote Escaping:</strong> All fields wrapped in quotes with "" escaping</li>
          <li><strong>Single-line JSON:</strong> Services JSON converted to single line</li>
          <li><strong>Hidden Character Cleanup:</strong> Removes newlines, tabs, and special characters</li>
          <li><strong>Empty Field Handling:</strong> Proper empty field representation</li>
          <li><strong>Postman Compatible:</strong> Optimized for Postman CSV parsing</li>
        </ul>
      </div>
    </div>
  );
}