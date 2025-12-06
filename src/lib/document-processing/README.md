# Hybrid Document Processing

Token-efficient document processing using Docling + Claude Vision hybrid approach.

## Overview

This module reduces Claude API token usage by **70-85%** by using a tiered extraction approach:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT INPUT                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    TIER 1: DOCLING EXTRACTION (Free)                    │
│  • PDF to Markdown conversion                                           │
│  • Table extraction                                                     │
│  • OCR for scanned documents                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  TIER 2: PATTERN EXTRACTION (Free)                      │
│  • Regex patterns for solar fields                                      │
│  • Address/name parsing                                                 │
│  • System specifications                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   │    CONFIDENCE >= 75%?         │
                   └───────────────┬───────────────┘
                          │                │
                   YES    │                │   NO
                          ▼                ▼
             ┌────────────────┐  ┌─────────────────────────────────────────┐
             │ RETURN RESULT  │  │       TIER 3: CLAUDE TEXT (80% savings) │
             │ (No API Cost)  │  │  Send extracted text, not full PDF      │
             └────────────────┘  └─────────────────────────────────────────┘
                                                   │
                                   ┌───────────────┴───────────────┐
                                   │    CONFIDENCE >= 75%?         │
                                   └───────────────┬───────────────┘
                                          │                │
                                   YES    │                │   NO
                                          ▼                ▼
                             ┌────────────────┐  ┌─────────────────────────┐
                             │ RETURN RESULT  │  │ TIER 4: CLAUDE VISION   │
                             └────────────────┘  │ (Full PDF, last resort) │
                                                 └─────────────────────────┘
```

## Token Savings Breakdown

| Processing Method | Expected Frequency | Token Savings |
|-------------------|-------------------|---------------|
| Docling + Patterns only | 60-70% of docs | 100% |
| Claude Text Fallback | 20-25% of docs | ~80% |
| Claude Vision Fallback | 5-15% of docs | 0% |
| **Overall Expected** | | **70-85%** |

## Installation

### Option 1: Local Python (Development)

```bash
# Install Docling
pip install docling

# Or with conda
conda install -c conda-forge docling
```

### Option 2: Docker (Production Recommended)

```bash
# Start Docling API server
docker-compose -f docker-compose.docling.yml up -d
```

### Option 3: API Server

If you have an existing Docling API server:

```bash
# Set environment variable
DOCLING_MODE=api
DOCLING_API_ENDPOINT=https://your-docling-server.com
```

## Configuration

Add these environment variables to your `.env.local`:

```bash
# Docling Configuration
DOCLING_MODE=local          # 'local', 'api', or 'docker'
DOCLING_API_ENDPOINT=       # Required if DOCLING_MODE=api

# For local mode, ensure Python is available
PYTHON_PATH=python3         # Path to Python with docling installed

# Claude API (for fallback)
ANTHROPIC_API_KEY=sk-...    # Your Anthropic API key
```

## Usage

### API Endpoint

```bash
# Analyze a PDF
curl -X POST http://localhost:3000/api/crm/design-analyzer-hybrid \
  -H "Authorization: Bearer <clerk-token>" \
  -F "file=@design.pdf" \
  -F "projectId=optional-project-id"

# Check capabilities
curl http://localhost:3000/api/crm/design-analyzer-hybrid \
  -H "Authorization: Bearer <clerk-token>"
```

### Response

```json
{
  "success": true,
  "data": {
    "customer_name": "John Smith",
    "address": "123 Solar Street",
    "city": "Chicago",
    "state": "IL",
    "system_size_kw": 8.1,
    "module_count": 18,
    "module_wattage": 450,
    "adders": {
      "has_mpu": false,
      "has_battery": true,
      "battery_count": 2
    }
  },
  "processing": {
    "method": "docling+patterns",
    "confidence": 85,
    "tokensUsed": 0,
    "tokensSaved": 45000,
    "savingsPercentage": 100,
    "processingTimeMs": 2340
  }
}
```

### Programmatic Usage

```typescript
import { createHybridProcessor } from '@/lib/document-processing';

const processor = createHybridProcessor({
  confidenceThreshold: 0.75,
  enableDocling: true,
  enablePatternMatching: true,
  enableClaudeTextFallback: true,
  enableClaudeVisionFallback: true,
  maxClaudeTokens: 2048,
});

const result = await processor.processDocument(
  fileBuffer,
  'design.pdf',
  'application/pdf'
);

console.log(`Method: ${result.processingMethod}`);
console.log(`Tokens used: ${result.tokensUsed}`);
console.log(`Confidence: ${result.confidence * 100}%`);
```

## Monitoring

The API returns processing statistics with every request:

```typescript
{
  processing: {
    method: 'docling+patterns' | 'claude-text' | 'claude-vision',
    confidence: number,      // 0-100
    tokensUsed: number,      // Claude tokens consumed
    tokensSaved: number,     // Estimated tokens saved
    savingsPercentage: number,
    processingTimeMs: number,
    fallbackReason?: string  // Why fallback was needed
  }
}
```

## Pattern Extraction

The pattern matcher extracts:

- Customer name (multiple formats)
- Address, city, state, ZIP
- System size (kW)
- Module count and wattage
- Module model (Q.PEAK, REC, LG, Jinko, etc.)
- Inverter model (Enphase, SolarEdge, etc.)
- AHJ jurisdiction
- Utility company (ComEd, Ameren, etc.)
- Adders:
  - MPU (Main Panel Upgrade)
  - Ground mount
  - Trenching (with length)
  - Battery storage (with count)
  - EV charger
  - Steep/flat/tile/metal roof
  - Three-story building

## Troubleshooting

### Docling not available

```bash
# Check Python installation
python3 -c "import docling; print('OK')"

# If missing, install:
pip install docling

# For OCR support:
pip install docling[ocr]
```

### Low confidence scores

If documents consistently get low confidence:

1. Check if Docling is extracting text properly
2. Review pattern matchers for your document format
3. Adjust `confidenceThreshold` (default: 0.75)
4. Consider adding custom patterns for your EPCs

### Claude fallback always triggered

This happens when:

1. Docling isn't installed/available
2. Documents are heavily image-based
3. Non-standard document formats

Check `/api/crm/design-analyzer-hybrid` GET endpoint for diagnostics.

## Cost Comparison

| Approach | Tokens/Doc | Cost/1000 docs* |
|----------|-----------|-----------------|
| Vision-only | ~45,000 | ~$135 |
| Hybrid (avg) | ~8,000 | ~$24 |
| **Savings** | | **~82%** |

*Estimated based on Claude Sonnet pricing

## Files

```
src/lib/document-processing/
├── index.ts              # Module exports
├── hybrid-processor.ts   # Main hybrid processing logic
├── docling-service.ts    # Docling integration
└── README.md             # This file

src/app/api/crm/
├── design-analyzer/      # Original vision-only endpoint
└── design-analyzer-hybrid/  # New hybrid endpoint
```
