import React, { useState } from "react";

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
        timeslot: svc.timeslot,
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
      pickDateTime: order.pickDateTime,
      payStatus: "Paid",
      shipCust: order.shipCust,
      shipAddr: order.shipAddr,
      locationCode: order.locationCode,
      shipPostal: order.shipPostal,
      shipCity: order.shipCity,
      shipPhone: order.shipPhone,
      shipEmail: order.shipEmail,
      codTask: order.codTask,
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