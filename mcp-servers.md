# MCP Server Setup for Decryptica

## Google Sheets MCP

### Option 1: mcp-google-sheets (Python)
```bash
pip install mcp-google-sheets
# Requires Google OAuth or Service Account credentials
```

### Option 2: @modelcontextprotocol/server-google-sheets (npm)
```bash
npm install -g @modelcontextprotocol/server-google-sheets
```

### Option 3: Create custom MCP server
Build a simple Node.js MCP server that wraps Google Sheets API

## Setup Steps
1. Create Google Cloud project
2. Enable Sheets API
3. Create Service Account + download JSON
4. Share sheet with service account email
5. Configure MCP server with JSON credentials
