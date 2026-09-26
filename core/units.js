// OpenPublisher - Centralized Math & Physical Unit Conversion Service
// Supports bidirectional conversions between Pixels, DPI, and physical units (Inches, Centimeters, Millimeters).

(function() {
    'use strict';

    const PRESETS = {
        'A4': { name: 'A4', widthMm: 210, heightMm: 297, widthIn: 8.2677, heightIn: 11.6929 },
        'Letter': { name: 'Letter', widthMm: 215.9, heightMm: 279.4, widthIn: 8.5, heightIn: 11.0 },
        'A3': { name: 'A3', widthMm: 297, heightMm: 420, widthIn: 11.6929, heightIn: 16.5354 },
        'A5': { name: 'A5', widthMm: 148, heightMm: 210, widthIn: 5.8268, heightIn: 8.2677 },
        'Legal': { name: 'Legal', widthMm: 215.9, heightMm: 355.6, widthIn: 8.5, heightIn: 14.0 },
        'Tabloid': { name: 'Tabloid', widthMm: 279.4, heightMm: 431.8, widthIn: 11.0, heightIn: 17.0 },
        'BusinessCard': { name: 'Business Card', widthMm: 88.9, heightMm: 50.8, widthIn: 3.5, heightIn: 2.0 },
        'Square': { name: 'Square', widthMm: 210, heightMm: 210, widthIn: 8.2677, heightIn: 8.2677 }
    };

    const DPI_PRESETS = [72, 96, 140, 150, 300];

    const UNIT_LABELS = {
        'in': 'Inches (in)',
        'cm': 'Centimeters (cm)',
        'mm': 'Millimeters (mm)',
        'px': 'Pixels (px)'
    };

    const UnitConversionService = {
        PRESETS: PRESETS,
        DPI_PRESETS: DPI_PRESETS,
        UNIT_LABELS: UNIT_LABELS,

        normalizeUnit: function(unit) {
            if (!unit) return 'in';
            const u = String(unit).toLowerCase().trim();
            if (u === 'inch' || u === 'inches' || u === 'in' || u === '"') return 'in';
            if (u === 'cm' || u === 'centimeter' || u === 'centimeters') return 'cm';
            if (u === 'mm' || u === 'millimeter' || u === 'millimeters') return 'mm';
            if (u === 'px' || u === 'pixel' || u === 'pixels') return 'px';
            return 'in';
        },

        toPixels: function(val, unit, dpi = 96) {
            const num = parseFloat(val) || 0;
            const d = parseFloat(dpi) || 96;
            const u = this.normalizeUnit(unit);
            switch (u) {
                case 'in':
                    return Math.round(num * d);
                case 'cm':
                    return Math.round((num / 2.54) * d);
                case 'mm':
                    return Math.round((num / 25.4) * d);
                case 'px':
                default:
                    return Math.round(num);
            }
        },

        fromPixels: function(px, unit, dpi = 96) {
            const num = parseFloat(px) || 0;
            const d = parseFloat(dpi) || 96;
            const u = this.normalizeUnit(unit);
            switch (u) {
                case 'in':
                    return num / d;
                case 'cm':
                    return (num / d) * 2.54;
                case 'mm':
                    return (num / d) * 25.4;
                case 'px':
                default:
                    return num;
            }
        },

        convert: function(val, fromUnit, toUnit, dpi = 96) {
            const from = this.normalizeUnit(fromUnit);
            const to = this.normalizeUnit(toUnit);
            const num = parseFloat(val) || 0;
            if (from === to) return num;

            if (from === 'px') {
                return this.fromPixels(num, to, dpi);
            }
            if (to === 'px') {
                return this.toPixels(num, from, dpi);
            }

            // Physical to physical conversion
            let inVal = num;
            if (from === 'cm') inVal = num / 2.54;
            else if (from === 'mm') inVal = num / 25.4;

            if (to === 'in') return inVal;
            if (to === 'cm') return inVal * 2.54;
            if (to === 'mm') return inVal * 25.4;

            return num;
        },

        formatValue: function(val, unit) {
            const num = parseFloat(val) || 0;
            const u = this.normalizeUnit(unit);
            if (u === 'in') {
                return parseFloat(num.toFixed(2));
            }
            if (u === 'cm') {
                return parseFloat(num.toFixed(2));
            }
            if (u === 'mm') {
                return parseFloat(num.toFixed(1));
            }
            return Math.round(num);
        },

        getPresetDimensions: function(formatKey, unit = 'in', dpi = 96) {
            const u = this.normalizeUnit(unit);
            const d = parseFloat(dpi) || 96;
            
            // Normalize key lookup
            const key = Object.keys(PRESETS).find(k => k.toLowerCase() === String(formatKey || '').toLowerCase()) || 'A4';
            const preset = PRESETS[key];

            let widthVal = 0;
            let heightVal = 0;

            if (u === 'in') {
                widthVal = preset.widthIn;
                heightVal = preset.heightIn;
            } else if (u === 'mm') {
                widthVal = preset.widthMm;
                heightVal = preset.heightMm;
            } else if (u === 'cm') {
                widthVal = preset.widthMm / 10;
                heightVal = preset.heightMm / 10;
            } else { // px
                widthVal = this.toPixels(preset.widthIn, 'in', d);
                heightVal = this.toPixels(preset.heightIn, 'in', d);
            }

            const widthPx = this.toPixels(widthVal, u, d);
            const heightPx = this.toPixels(heightVal, u, d);

            return {
                key: key,
                name: preset.name,
                unit: u,
                dpi: d,
                width: this.formatValue(widthVal, u),
                height: this.formatValue(heightVal, u),
                widthPx: widthPx,
                heightPx: heightPx
            };
        },

        detectFormat: function(w, h, dpi = 96) {
            const width = parseFloat(w) || 0;
            const height = parseFloat(h) || 0;
            if (!width || !height) return 'A4';

            if (Math.abs(width - height) <= 10) return 'Square';

            const shortEdge = Math.min(width, height);
            const longEdge = Math.max(width, height);

            const activeDpi = parseFloat(dpi) || 96;
            const dList = Array.from(new Set([activeDpi, 96, 140, 300, 150, 72]));
            for (const d of dList) {
                const tol = Math.max(16, d * 0.08);
                for (const key in PRESETS) {
                    const p = this.getPresetDimensions(key, 'px', d);
                    const pShort = Math.min(p.widthPx, p.heightPx);
                    const pLong = Math.max(p.widthPx, p.heightPx);
                    if (Math.abs(shortEdge - pShort) <= tol && Math.abs(longEdge - pLong) <= tol) {
                        return key;
                    }
                }
            }

            const shortIn = shortEdge / activeDpi;
            const longIn = longEdge / activeDpi;

            if (shortIn >= 11.2) return 'A3';
            if (shortIn >= 10.5 && longIn >= 16.0) return 'Tabloid';
            if (shortIn >= 8.2 && longIn >= 13.2) return 'Legal';
            if (Math.abs(shortIn - 8.5) <= 0.6 && Math.abs(longIn - 11.0) <= 0.6) return 'Letter';
            if (Math.abs(shortIn - 8.27) <= 0.6 && Math.abs(longIn - 11.69) <= 0.6) return 'A4';
            if (Math.abs(shortIn - 5.83) <= 0.5 && Math.abs(longIn - 8.27) <= 0.5) return 'A5';
            if (shortIn <= 2.8 && longIn <= 4.2) return 'BusinessCard';

            return 'Custom';
        }
    };

    window.UnitConversionService = UnitConversionService;
})();
