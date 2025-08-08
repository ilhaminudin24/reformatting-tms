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

function transformData(input) {
  if (!input.value || !Array.isArray(input.value)) return [];

  return input.value.map(order => {
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

  const handleTransform = () => {
    try {
      const parsed = JSON.parse(input);
      const result = transformData(parsed);
      setOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setOutput("Invalid JSON input.");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Reformatting TMS JSON Tool</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h4>Input JSON</h4>
          <textarea
            rows={25}
            style={{ width: "100%" }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste source JSON here"
          />
        </div>
        <div style={{ flex: 1 }}>
          <h4>Output JSON</h4>
          <textarea
            rows={25}
            style={{ width: "100%" }}
            value={output}
            readOnly
            placeholder="Reformatted JSON will appear here"
          />
        </div>
      </div>
      <button style={{ marginTop: 16 }} onClick={handleTransform}>
        Transform
      </button>
    </div>
  );
}