# 🔄 TMS JSON Reformatting Tool

A powerful React-based tool for transforming and reformatting TMS (Transport Management System) JSON data. Features automatic date/time formatting, CSV export with UTF-8 support, advanced filtering, and REST API integration.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tms.ilhmndn.site-blue)](https://tms.ilhmndn.site)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### Core Transformation
- **JSON Transformation**: Convert raw TMS OData format to a clean, structured format
- **Automatic Date Formatting**: Converts ISO 8601 dates to `YYYY-MM-DD HH:mm:ss` format
- **Invalid Date Handling**: Automatically replaces `0001-01-01T00:00:00Z` with current date
- **Timeslot Conversion**: Converts 12-hour AM/PM format to 24-hour format

### Export Options
- **CSV Export**: Generate UTF-8 encoded CSV with BOM for Excel compatibility
- **Individual Order JSON**: Download single orders as JSON files (wrapped in array)
- **Batch Download**: Download multiple orders as separate JSON files

### Advanced Filtering
- **Multi-Field Filtering**: Filter by multiple fields simultaneously
- **Order-Level Fields**: SO Number, Store No, Customer, City, etc.
- **Service-Level Fields**: Filter by service status, provider name, service name, and date
- **Operators**: Contains, equals, starts with, greater than, less than

### REST API Integration
- **POST Requests**: Send transformed data to any REST endpoint
- **Bearer Token Support**: Configure Authorization headers
- **Custom Headers**: Add custom HTTP headers
- **Response Display**: View API responses directly in the tool

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ilhaminudin24/reformatting-tms.git

# Navigate to project directory
cd reformatting-tms

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 📖 Usage

### 1. Input JSON Data
Paste your TMS JSON data in the input textarea. The tool accepts:
- **OData Format**: Original TMS response with `@odata.context` and `value` array
- **Pre-transformed Format**: Already transformed data (array of orders)

### 2. Transform
Click the **Transform** button to process your data. The tool will:
- Reformat all date/time fields
- Calculate service amounts
- Structure nested service data
- Generate both JSON and CSV outputs

### 3. Apply Filters (Optional)
Use the **+ Add Filter** button to:
- Select field to filter by
- Choose operator (contains, equals, etc.)
- Enter search value

### 4. Export
- **Copy JSON/CSV**: Copy to clipboard
- **Download CSV**: Save as UTF-8 encoded CSV file
- **Download Individual/All Orders**: Save as JSON files

### 5. POST Request (Optional)
Configure the POST section to send data to your API:
- Enter target URL
- Add Bearer token (if required)
- Add custom headers (if required)
- Click **Send POST Request**

## 📁 Project Structure

```
reformatting-tms/
├── public/
│   ├── index.html          # HTML template
│   ├── manifest.json       # PWA manifest
│   ├── favicon.ico         # App icon
│   └── CNAME              # Custom domain config
├── src/
│   ├── App.js             # Main application component
│   ├── App.css            # Application styles
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Data Transformation

### Input Format (TMS OData)
```json
{
  "@odata.context": "...",
  "value": [{
    "shipRef": "60325068657",
    "storeNo": "603",
    "pickDateTime": "0001-01-01T00:00:00Z",
    "dfCreateDeliveryOrderServices": [...],
    "dfCreateDeliveryOrderServiceItems": [...]
  }]
}
```

### Output Format
```json
[{
  "soNo": "60325068657",
  "storeNo": "603",
  "pickDateTime": "2026-01-13 21:00:00",
  "services": [{
    "svcOrdNo": "60325149541",
    "svcName": "Home Delivery House Ecommerce",
    "status": "Service Provider Contacted",
    "items": [...]
  }]
}]
```

## 🌐 Deployment

The application is deployed at [https://tms.ilhmndn.site](https://tms.ilhmndn.site) using GitHub Pages with a custom domain.

## 🛠️ Built With

- [React 19](https://reactjs.org/) - UI Framework
- [Create React App](https://create-react-app.dev/) - Build tooling
- [GitHub Pages](https://pages.github.com/) - Hosting

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ilham Inudin**
- GitHub: [@ilhaminudin24](https://github.com/ilhaminudin24)
- Website: [ilhmndn.site](https://ilhmndn.site)
