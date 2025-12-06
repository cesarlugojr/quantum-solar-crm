# Hybrid Processor Pattern Tuning

This document tracks the pattern tuning progress for the Docling + Claude Vision hybrid document processor.

## Overview

The hybrid processor uses RapidOCR (via Docling) to extract text from CAD PDFs, then applies regex patterns to extract structured solar design data. This approach reduces Claude API token usage by 70-85%.

## PDFs Analyzed

| PDF | Customer | System | Key Features |
|-----|----------|--------|--------------|
| GPIN-3184 | Glenn Wilson | 11.745 kW | 29 modules, Enphase IQ8+ |
| GPIN-2634 | Mary Dabrowski | 6.08 kW | 15 modules, MPU, steep pitch |
| GPIN-3418 | Nicole Powell | 15.80 kW | 39 modules, Tesla inverters, Powerwall 3, trench |
| GPIN-3650 | David Heinz | 20.09 kW | **GROUND MOUNT**, 49 Q-Cells modules, Tesla, 2× Powerwall 3, 160ft trench |

## Extraction Results

### Customer Name Patterns
```regex
# GoodPWR format: "GLENN RESIDENCE 300 HARPER CT"
/([A-Z][A-Z]+)\s+RESIDENCE\s+\d+/i

# PROJECT NAME block (may be concatenated)
/PROJECT\s*NAME\s*\n?\s*([A-Z][A-Z\s]+?)(?:\s*\d|\s*APN|\s*AHJ|\n)/im
```

**Handling concatenated names:**
- `MARYLOUISEDABROWSKI` → `Mary Louise Dabrowski`
- Uses dictionary of common first/middle names to insert spaces

### Address Patterns
```regex
# Standard format
/(\d+\s+[A-Za-z0-9\s]+(?:St|Ave|Rd|Dr|Ln|Ct)[,.\s]+[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5})/i

# GoodPWR title block
/(\d+\s*S?\s+[A-Z\s]+(?:AVE|ST|RD|DR|LN|CT)),?\s*([A-Z]+)\s+(?:IL|FL)\s+(\d{5})/i
```

### System Size Patterns
```regex
# DC system size (prioritized)
/(\d+\.?\d*)\s*kW\s*DC/i
/SYSTEMSIZE[\s:]*(\d+\.?\d*)\s*KW\s*DC/i
```

### Module Patterns
```regex
# Count: "29 MODULES ROOF MOUNTED" or "49 MODULES-GROUND MOUNTED"
/(\d+)\s*MODULES[-\s]*(?:ROOF|GROUND)/i
/\(N?\)?\s*(\d+)[-\s]*(?:LONGI|Q[\-\s]?CELLS|HANWHA)/i

# Model - LONGI: "MODULE: 29 (N) LONGILR5-54HPB-405M"
/MODULE[\s:]+\d+\s*\(N\)\s*(LONGI[\w-]+)/i
/\(N?\)?\s*\d+[-\s]*(LONGI\s*(?:SOLAR\s*)?[\w-]+)/i

# Model - Q-Cells: "(N) 49 - HANWHA Q-CELLS Q.PEAK DUO BLK ML-G10+ (410W)"
/\(N\)\s*\d+\s*[-–]\s*(HANWHA\s*Q[\-\s]?CELLS[\s\w\.\+\-\(\)]+)/i
/(\d+)\s*[-–]?\s*(Q[\-\s]?CELLS[\s\w\.\+\-\(\)]+(?:MODULES)?)/i
```

### Inverter Patterns
```regex
# Enphase: "INVERTER:29(N)ENPHASEIQ8PLUS-72-M-US"
/INVERTER[\s:]*\d+\s*\(N\)\s*(ENPHASE[\w-]+)/i

# Tesla: "(N) 15 - TESLA MCI-2/RSD"
/\(N\)\s*\d+\s*[-–]\s*(TESLA\s*[\w-\/]+)/i
```

### AHJ Patterns
```regex
# "AHJ: CITY OF URBANA" or "AHJ: TOWNSHIP OF OAKWOOD"
/AHJ[\s:]+(?:CITY|VILLAGE|TOWN(?:SHIP)?)\s+OF\s+([A-Z]+)/i

# "NORMAL TOWN" in governing codes
/([A-Z]+)\s+TOWN\b/
```

### Utility Patterns
```regex
# "AMEREN (IL)" or "UTILITY: AMEREN"
/(AMEREN|COMED)\s*\([A-Z]{2}\)/i
/UTILITY[\s:]+([A-Z]+)/i
```

## Adders Detection

| Adder | Pattern | Example Match |
|-------|---------|---------------|
| Ground Mount | `/GROUND\s*MOUNT(?:ED)?/i` | "49 MODULES-GROUND MOUNTED" |
| MPU | `/\(N\)\s*\d+A\s*LOAD\s*CENTER/i` or `/\(N\)\s*\d+A\s*METER\s*(?:WITH\|W\/?)\s*LEVER\s*BYPASS/i` | "(N) 125A LOAD CENTER" or "(N) 200A METER WITH LEVER BYPASS" |
| Battery | `/POWERWALL\|ENCHARGE/i` | "TESLA POWERWALL 3" |
| Battery Count | `/\(N\)\s*(\d+)\s*[-–]?\s*TESLA\s*POWERWALL/i` | "(N) 02- TESLA POWERWALL 3" |
| Backup Gateway | `/BACKUP\s*GATEWAY/i` | "TESLA BACKUP GATEWAY-3" |
| Backup Panel | `/BACKUP\s*(?:LOAD\s*)?PANEL/i` | "BACKUP LOAD PANEL" |
| Trench | `/TRENCH[\s~:]*(\d+)/i` | "TRENCH~90'" (sum all matches) |
| Steep Pitch | `/TILT\s*[-:]?\s*(?:3[5-9]\|4[0-9])°?/i` | "TILT - 45°" |
| Comp Shingle | `/(?:COMP\|ASPHALT)\s*SHINGLE/i` | "ASPHALT SHINGLE" |
| Two Story | `/TWO[-\s]*STORY/i` | "TWO-STORY HOUSE" |
| One Story | `/ONE[-\s]*STORY/i` | "STORY:-ONESTORY" |
| Attic Run | `/ATTIC\s*RUN/i` | "(N) ATTIC RUN WITH" |

## Fields Extracted

### Core Fields
- `customer_name` - Customer/homeowner name
- `address` - Street address
- `city` - City
- `state` - State (IL, FL, etc.)
- `zip_code` - ZIP code
- `system_size_kw` - DC system size in kW
- `module_count` - Number of panels
- `module_wattage` - Wattage per panel
- `module_model` - Panel model (e.g., LONGI LR5-54HPB-405M)
- `inverter_model` - Inverter model (Enphase, Tesla, SolarEdge)
- `ahj_jurisdiction` - Authority Having Jurisdiction
- `utility_company` - Utility provider
- `main_panel_brand` - Panel brand (Square D, etc.)
- `main_breaker_amps` - Main breaker size

### Adder Flags
- `has_mpu` - Main Panel Upgrade
- `has_ground_mount` - Ground mount system
- `has_trench` - Trenching required
- `trench_length_ft` - Trench length in feet
- `has_battery` - Battery storage
- `battery_count` - Number of batteries
- `battery_model` - Battery model (Powerwall 3, etc.)
- `has_backup_panel` - Backup/critical load panel
- `has_ev_charger` - EV charger
- `has_steep_pitch` - Steep roof (35°+)
- `has_flat_roof` - Flat roof
- `has_tile_roof` - Tile roof
- `has_metal_roof` - Metal roof
- `has_comp_shingle` - Composition shingle
- `has_three_story` - 3-story building
- `has_two_story` - 2-story building
- `has_one_story` - 1-story building
- `has_attic_run` - Conduit through attic
- `has_derate` - Panel derate

## Test Results

### Glenn Wilson (GPIN-3184)
```
Customer:    Glenn
Address:     300 Harper Ct, Normal, IL 61761
System:      11.745 kW
Modules:     29
Module:      LONGI LR5-54HPB-405M
Inverter:    ENPHASE IQ8PLUS-72-M-US
AHJ:         Normal Town
Utility:     Ameren
Adders:      mpu (200A meter w/ lever bypass), comp_shingle, attic_run
```

### Mary Dabrowski (GPIN-2634)
```
Customer:    Mary Louise Dabrowski
Address:     108S Cottage Grove Ave, Urbana IL 61802
System:      6.08 kW
Modules:     15
Module:      LONGI LR5-54HPB-405M
Inverter:    ENPHASE IQ8PLUS-72-M-US
AHJ:         City of Urbana
Utility:     Ameren
Adders:      mpu, steep_pitch (44-45°), comp_shingle, one_story, attic_run
```

### Nicole Powell (GPIN-3418)
```
Customer:    Nicole J Powell
Address:     215 McCarty St, Muncie IL 61857
System:      15.80 kW
Modules:     39
Module:      LONGI LR5-54HPB-405M
Inverter:    TESLA MCI-2/RSD
AHJ:         Township of Oakwood
Utility:     Ameren
Adders:      battery (Powerwall 3), backup_panel, trench (25 ft), comp_shingle, one_story
```

### David Heinz (GPIN-3650) ⭐ GROUND MOUNT
```
Customer:    David Heinz
Address:     620 Wisconsin Ave, Windsor, IL 61957
System:      20.09 kW DC (23.00 kW AC)
Modules:     49
Module:      HANWHA Q-CELLS Q.PEAK DUO BLK ML-G10+ (410W)
Inverter:    TESLA MCI-2/RSD (18 units)
AHJ:         City of Windsor
Utility:     Ameren
Main Panel:  (E) 200A
Adders:      GROUND_MOUNT, battery (2× Powerwall 3), backup_gateway, trench (90'+70'=160 ft), two_story
```

**Special Notes for Ground Mount:**
- Uses "GROUND MOUNTED" instead of "ROOF MOUNTED" in header
- Has design criteria section (snow load, wind speed, exposure)
- Trench lengths may appear multiple times (sum all matches)
- Battery count extracted from "(N) 02- TESLA POWERWALL 3"

## Configuration

### Python Path
```
/Applications/Xcode.app/Contents/Developer/usr/bin/python3
```

### OCR Engine
RapidOCR (via Docling) with `force_full_page_ocr=True`

### Body Size Limit
Configured in `next.config.ts`:
```typescript
experimental: {
  serverActions: { bodySizeLimit: '50mb' },
  proxyClientMaxBodySize: '50mb',
}
```

## Files Modified

- `src/lib/document-processing/hybrid-processor.ts` - Main pattern matching
- `src/lib/document-processing/docling-service.ts` - RapidOCR configuration
- `src/app/api/crm/design-analyzer-hybrid/route.ts` - API endpoint
- `next.config.ts` - Body size limits

## Profitability Calculator Integration

The extracted data now feeds into the enhanced Profitability Calculator:

### Auto-Detected Fields
- System size (kW)
- Ground mount status
- Battery count and model (Powerwall vs Encharge)
- Trench length (sums multiple trenches)
- MPU detection
- Steep pitch from roof sections
- Roof type (metal, flat, tile, comp shingle)
- EV charger
- 3-story building
- Derate breaker
- Array count (>4 arrays adder)

### Smart Defaults
- Battery model determines whole-home vs backup classification
- `has_attic_run: false` suggests roof pipe (+1 day)
- `has_derate: true` enables derate breaker adder
- Trench type defaults to softscape (user can change to concrete)

## Next Steps

1. ~~Add patterns for Q-Cells modules~~ ✅ (GPIN-3650)
2. ~~Add ground mount detection~~ ✅ (GPIN-3650)
3. ~~Handle multiple trench lengths~~ ✅ (sum all matches)
4. ~~Integrate with Profitability Calculator~~ ✅
5. Add patterns for SolarEdge string inverters
6. Improve roof section extraction from tables
7. Add confidence scoring per field
8. Consider ML-based name splitting for edge cases
9. Test with Florida utility patterns (FPL, Duke, TECO)
