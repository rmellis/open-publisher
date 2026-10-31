/**
 * OpenPublisher Chart & Graph Engine (v5.14.3)
 * 
 * Provides interactive, vector-sharp SVG Pie Charts, Donut Charts, Vertical Column Graphs,
 * Horizontal Bar Graphs, and Line/Area Charts. Supports live data editing, dynamic theme colors,
 * CSV/TSV fast-paste import, on-canvas double-click re-editing, and print-safe vector export.
 */

(function(window) {
    'use strict';

    // Default vibrant palette inspired by OpenPublisher themes
    const DEFAULT_PALETTE = [
        '#0d9e8f', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
        '#10b981', '#f97316', '#06b6d4', '#6366f1', '#14b8a6',
        '#ef4444', '#84cc16'
    ];

    const DEFAULT_CHART_DATA = [
        { label: 'Product A', value: 40, color: '#0d9e8f' },
        { label: 'Product B', value: 28, color: '#3b82f6' },
        { label: 'Product C', value: 18, color: '#f59e0b' },
        { label: 'Product D', value: 14, color: '#ec4899' }
    ];

    /**
     * Escape HTML string helper
     */
    function escapeXml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    /**
     * Pure SVG Chart Generator
     * Returns an SVG string representing the chart with scalable viewBox
     */
    function generateChartSVG(config, width = 380, height = 280) {
        const type = config.type || 'pie';
        const title = config.title || '';
        const showLegend = config.showLegend !== false;
        const showValues = config.showValues !== false;
        const rawData = (config.data && config.data.length > 0) ? config.data : DEFAULT_CHART_DATA;

        // Clean data: ensure positive numbers
        const data = rawData.map((d, i) => ({
            label: d.label || `Item ${i + 1}`,
            value: Math.max(0, parseFloat(d.value) || 0),
            color: d.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]
        }));

        const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

        // Title SVG element
        let titleSvg = '';
        const titleHeight = title ? 32 : 12;
        if (title) {
            titleSvg = `<text x="${width / 2}" y="22" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#1e293b">${escapeXml(title)}</text>`;
        }

        // Legend SVG elements
        let legendSvg = '';
        let legendHeight = 0;
        if (showLegend && data.length > 0) {
            legendHeight = 30;
            const itemSpacing = Math.min(110, width / data.length);
            const legendStartX = (width - (data.length * itemSpacing)) / 2 + 10;
            const legendY = height - 10;

            const legendItems = data.map((d, i) => {
                const itemX = Math.max(10, legendStartX + i * itemSpacing);
                const displayLabel = d.label.length > 10 ? d.label.substring(0, 9) + '…' : d.label;
                return `
                    <g transform="translate(${itemX}, ${legendY})">
                        <circle cx="5" cy="-4" r="4.5" fill="${d.color}" />
                        <text x="14" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" fill="#475569">${escapeXml(displayLabel)}</text>
                    </g>
                `;
            }).join('');
            legendSvg = `<g class="chart-legend">${legendItems}</g>`;
        }

        // Usable plotting area
        const plotTop = titleHeight;
        const plotBottom = height - legendHeight - 8;
        const plotHeight = plotBottom - plotTop;
        const plotWidth = width;

        let contentSvg = '';

        // --- 1. PIE & DONUT CHARTS ---
        if (type === 'pie' || type === 'donut') {
            const isDonut = type === 'donut';
            const cx = width / 2;
            const cy = plotTop + (plotHeight / 2);
            const outerR = Math.min(plotWidth / 2 - 25, plotHeight / 2 - 15);
            const innerR = isDonut ? outerR * 0.54 : 0;

            let currentAngle = -Math.PI / 2; // start at top 12 o'clock

            const slices = data.map((d) => {
                const fraction = d.value / total;
                const sliceAngle = fraction * 2 * Math.PI;
                const endAngle = currentAngle + sliceAngle;

                // Handle single 100% slice edge case
                if (fraction >= 0.9999) {
                    if (isDonut) {
                        currentAngle = endAngle;
                        return `
                            <g class="chart-slice">
                                <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="${d.color}" />
                                <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#ffffff" />
                            </g>
                        `;
                    } else {
                        currentAngle = endAngle;
                        return `<g class="chart-slice"><circle cx="${cx}" cy="${cy}" r="${outerR}" fill="${d.color}" /></g>`;
                    }
                }

                // Arc coordinates
                const x1 = cx + outerR * Math.cos(currentAngle);
                const y1 = cy + outerR * Math.sin(currentAngle);
                const x2 = cx + outerR * Math.cos(endAngle);
                const y2 = cy + outerR * Math.sin(endAngle);
                const largeArc = sliceAngle > Math.PI ? 1 : 0;

                let pathD = '';
                if (isDonut) {
                    const ix1 = cx + innerR * Math.cos(currentAngle);
                    const iy1 = cy + innerR * Math.sin(currentAngle);
                    const ix2 = cx + innerR * Math.cos(endAngle);
                    const iy2 = cy + innerR * Math.sin(endAngle);
                    pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
                } else {
                    pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                }

                // Value / Percentage Label
                let labelSvg = '';
                if (showValues && fraction >= 0.05) {
                    const midAngle = currentAngle + (sliceAngle / 2);
                    const labelR = isDonut ? (outerR + innerR) / 2 : outerR * 0.68;
                    const lx = cx + labelR * Math.cos(midAngle);
                    const ly = cy + labelR * Math.sin(midAngle) + 4;
                    const percentText = Math.round(fraction * 100) + '%';
                    labelSvg = `<text x="${lx}" y="${ly}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#ffffff" style="text-shadow:0 1px 2px rgba(0,0,0,0.45); pointer-events:none;">${percentText}</text>`;
                }

                currentAngle = endAngle;

                return `
                    <g class="chart-slice">
                        <path d="${pathD}" fill="${d.color}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
                        ${labelSvg}
                    </g>
                `;
            }).join('');

            // Donut center summary
            let donutCenter = '';
            if (isDonut) {
                donutCenter = `
                    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#ffffff" />
                    <text x="${cx}" y="${cy - 3}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" fill="#64748b" font-weight="600">TOTAL</text>
                    <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" fill="#0f172a" font-weight="800">${Math.round(total)}</text>
                `;
            }

            contentSvg = `<g class="chart-pie-group">${slices}${donutCenter}</g>`;
        }

        // --- 2. VERTICAL COLUMN CHART ---
        else if (type === 'column') {
            const padLeft = 45;
            const padRight = 20;
            const padBottom = 26;
            const plotX = padLeft;
            const plotY = plotTop + 10;
            const plotW = width - padLeft - padRight;
            const plotH = plotHeight - padBottom - 10;

            const maxVal = Math.max(...data.map(d => d.value), 1);
            // Nice scale rounding
            const niceMax = Math.ceil(maxVal * 1.15) || 10;

            // Background gridlines (4 horizontal lines)
            let gridlinesSvg = '';
            for (let step = 0; step <= 4; step++) {
                const stepVal = Math.round((niceMax / 4) * step);
                const lineY = plotY + plotH - (plotH * (step / 4));
                gridlinesSvg += `
                    <line x1="${plotX}" y1="${lineY}" x2="${plotX + plotW}" y2="${lineY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="${step > 0 ? '3,3' : 'none'}" />
                    <text x="${plotX - 8}" y="${lineY + 3.5}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#94a3b8">${stepVal}</text>
                `;
            }

            // Columns
            const colSlotW = plotW / data.length;
            const colW = Math.min(42, Math.max(14, colSlotW * 0.62));

            const columnsSvg = data.map((d, i) => {
                const colH = (d.value / niceMax) * plotH;
                const colX = plotX + (i * colSlotW) + (colSlotW - colW) / 2;
                const colY = plotY + plotH - colH;
                const labelX = colX + colW / 2;

                let valLabel = '';
                if (showValues && colH > 10) {
                    valLabel = `<text x="${labelX}" y="${colY - 5}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="700" fill="#334155">${d.value}</text>`;
                }

                const catLabel = `<text x="${labelX}" y="${plotY + plotH + 16}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="10" fill="#475569">${escapeXml(d.label.length > 8 ? d.label.substring(0, 7) + '…' : d.label)}</text>`;

                return `
                    <g class="chart-column">
                        <rect x="${colX}" y="${colY}" width="${colW}" height="${colH}" fill="${d.color}" rx="3" ry="3" />
                        ${valLabel}
                        ${catLabel}
                    </g>
                `;
            }).join('');

            contentSvg = `
                <g class="chart-column-group">
                    ${gridlinesSvg}
                    ${columnsSvg}
                </g>
            `;
        }

        // --- 3. HORIZONTAL BAR CHART ---
        else if (type === 'bar') {
            const padLeft = 70;
            const padRight = 35;
            const plotX = padLeft;
            const plotY = plotTop + 10;
            const plotW = width - padLeft - padRight;
            const plotH = plotHeight - 15;

            const maxVal = Math.max(...data.map(d => d.value), 1);
            const niceMax = Math.ceil(maxVal * 1.15) || 10;

            const barSlotH = plotH / data.length;
            const barH = Math.min(26, Math.max(12, barSlotH * 0.6));

            const barsSvg = data.map((d, i) => {
                const barW = (d.value / niceMax) * plotW;
                const barY = plotY + (i * barSlotH) + (barSlotH - barH) / 2;

                const catLabel = `<text x="${plotX - 8}" y="${barY + (barH / 2) + 3.5}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="10" fill="#475569">${escapeXml(d.label.length > 9 ? d.label.substring(0, 8) + '…' : d.label)}</text>`;

                let valLabel = '';
                if (showValues) {
                    valLabel = `<text x="${plotX + barW + 6}" y="${barY + (barH / 2) + 3.5}" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="700" fill="#334155">${d.value}</text>`;
                }

                return `
                    <g class="chart-bar">
                        ${catLabel}
                        <rect x="${plotX}" y="${barY}" width="${Math.max(2, barW)}" height="${barH}" fill="${d.color}" rx="3" ry="3" />
                        ${valLabel}
                    </g>
                `;
            }).join('');

            // Baseline axis
            const axisSvg = `<line x1="${plotX}" y1="${plotY}" x2="${plotX}" y2="${plotY + plotH}" stroke="#cbd5e1" stroke-width="1.5" />`;

            contentSvg = `
                <g class="chart-bar-group">
                    ${axisSvg}
                    ${barsSvg}
                </g>
            `;
        }

        // --- 4. LINE / AREA CHART ---
        else if (type === 'line') {
            const padLeft = 45;
            const padRight = 25;
            const padBottom = 26;
            const plotX = padLeft;
            const plotY = plotTop + 10;
            const plotW = width - padLeft - padRight;
            const plotH = plotHeight - padBottom - 10;

            const maxVal = Math.max(...data.map(d => d.value), 1);
            const niceMax = Math.ceil(maxVal * 1.15) || 10;

            // Gridlines
            let gridlinesSvg = '';
            for (let step = 0; step <= 4; step++) {
                const stepVal = Math.round((niceMax / 4) * step);
                const lineY = plotY + plotH - (plotH * (step / 4));
                gridlinesSvg += `
                    <line x1="${plotX}" y1="${lineY}" x2="${plotX + plotW}" y2="${lineY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="${step > 0 ? '3,3' : 'none'}" />
                    <text x="${plotX - 8}" y="${lineY + 3.5}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#94a3b8">${stepVal}</text>
                `;
            }

            const points = data.map((d, i) => {
                const x = plotX + (i / Math.max(1, data.length - 1)) * plotW;
                const y = plotY + plotH - (d.value / niceMax) * plotH;
                return { x, y, value: d.value, label: d.label, color: d.color };
            });

            const pathCoords = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const areaCoords = `${pathCoords} L ${points[points.length - 1].x} ${plotY + plotH} L ${points[0].x} ${plotY + plotH} Z`;

            const lineColor = data[0] ? data[0].color : '#0d9e8f';

            const pointsSvg = points.map(p => {
                let valLabel = '';
                if (showValues) {
                    valLabel = `<text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="700" fill="#334155">${p.value}</text>`;
                }
                const catLabel = `<text x="${p.x}" y="${plotY + plotH + 16}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="10" fill="#475569">${escapeXml(p.label.length > 7 ? p.label.substring(0, 6) + '…' : p.label)}</text>`;

                return `
                    <g class="chart-point">
                        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ffffff" stroke="${lineColor}" stroke-width="2.5" />
                        ${valLabel}
                        ${catLabel}
                    </g>
                `;
            }).join('');

            contentSvg = `
                <g class="chart-line-group">
                    <defs>
                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.25" />
                            <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.0" />
                        </linearGradient>
                    </defs>
                    ${gridlinesSvg}
                    <path d="${areaCoords}" fill="url(#chart-area-grad)" />
                    <path d="${pathCoords}" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    ${pointsSvg}
                </g>
            `;
        }

        // --- 5. AREA CHART ---
        else if (type === 'area') {
            const padLeft = 45;
            const padRight = 25;
            const padBottom = 26;
            const plotX = padLeft;
            const plotY = plotTop + 10;
            const plotW = width - padLeft - padRight;
            const plotH = plotHeight - padBottom - 10;

            const maxVal = Math.max(...data.map(d => d.value), 1);
            const niceMax = Math.ceil(maxVal * 1.15) || 10;

            let gridlinesSvg = '';
            for (let step = 0; step <= 4; step++) {
                const stepVal = Math.round((niceMax / 4) * step);
                const lineY = plotY + plotH - (plotH * (step / 4));
                gridlinesSvg += `
                    <line x1="${plotX}" y1="${lineY}" x2="${plotX + plotW}" y2="${lineY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="${step > 0 ? '3,3' : 'none'}" />
                    <text x="${plotX - 8}" y="${lineY + 3.5}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#94a3b8">${stepVal}</text>
                `;
            }

            const points = data.map((d, i) => {
                const x = plotX + (i / Math.max(1, data.length - 1)) * plotW;
                const y = plotY + plotH - (d.value / niceMax) * plotH;
                return { x, y, value: d.value, label: d.label, color: d.color };
            });

            const pathCoords = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const areaCoords = `${pathCoords} L ${points[points.length - 1].x.toFixed(1)} ${plotY + plotH} L ${points[0].x.toFixed(1)} ${plotY + plotH} Z`;

            const primaryColor = data[0] ? data[0].color : '#0d9e8f';

            const pointsSvg = points.map(p => {
                let valLabel = '';
                if (showValues) {
                    valLabel = `<text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="700" fill="#334155">${p.value}</text>`;
                }
                const catLabel = `<text x="${p.x.toFixed(1)}" y="${plotY + plotH + 16}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="10" fill="#475569">${escapeXml(p.label.length > 7 ? p.label.substring(0, 6) + '…' : p.label)}</text>`;

                return `
                    <g class="chart-point">
                        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#ffffff" stroke="${p.color}" stroke-width="2.5" />
                        ${valLabel}
                        ${catLabel}
                    </g>
                `;
            }).join('');

            contentSvg = `
                <g class="chart-area-group">
                    <defs>
                        <linearGradient id="chart-area-rich-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.65" />
                            <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.25" />
                            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.02" />
                        </linearGradient>
                    </defs>
                    ${gridlinesSvg}
                    <path d="${areaCoords}" fill="url(#chart-area-rich-grad)" />
                    <path d="${pathCoords}" fill="none" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    ${pointsSvg}
                </g>
            `;
        }

        // --- 6. SEMI-CIRCLE GAUGE / HALF-DONUT ---
        else if (type === 'half-donut') {
            const cx = width / 2;
            const cy = plotTop + (plotHeight * 0.76);
            const outerR = Math.min(plotWidth / 2 - 30, (plotHeight * 0.76) - 10);
            const innerR = outerR * 0.58;

            let currentAngle = -Math.PI; // start at 9 o'clock (-180 deg)

            const slices = data.map((d) => {
                const fraction = d.value / total;
                const sliceAngle = fraction * Math.PI; // covers 180 deg total
                const endAngle = currentAngle + sliceAngle;

                const x1 = cx + outerR * Math.cos(currentAngle);
                const y1 = cy + outerR * Math.sin(currentAngle);
                const x2 = cx + outerR * Math.cos(endAngle);
                const y2 = cy + outerR * Math.sin(endAngle);

                const ix1 = cx + innerR * Math.cos(currentAngle);
                const iy1 = cy + innerR * Math.sin(currentAngle);
                const ix2 = cx + innerR * Math.cos(endAngle);
                const iy2 = cy + innerR * Math.sin(endAngle);

                const pathD = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${outerR} ${outerR} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR} ${innerR} 0 0 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`;

                let labelSvg = '';
                if (showValues && fraction >= 0.06) {
                    const midAngle = currentAngle + (sliceAngle / 2);
                    const labelR = (outerR + innerR) / 2;
                    const lx = cx + labelR * Math.cos(midAngle);
                    const ly = cy + labelR * Math.sin(midAngle) + 4;
                    const percentText = Math.round(fraction * 100) + '%';
                    labelSvg = `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" fill="#ffffff" style="text-shadow:0 1px 2px rgba(0,0,0,0.45);">${percentText}</text>`;
                }

                currentAngle = endAngle;

                return `
                    <g class="chart-slice">
                        <path d="${pathD}" fill="${d.color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />
                        ${labelSvg}
                    </g>
                `;
            }).join('');

            // Baseline and center summary text
            const baselineSvg = `
                <line x1="${(cx - outerR).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx - innerR).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#cbd5e1" stroke-width="1.5" />
                <line x1="${(cx + innerR).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + outerR).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#cbd5e1" stroke-width="1.5" />
                <text x="${cx}" y="${cy - 12}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" fill="#0f172a" font-weight="800">${Math.round(total)}</text>
                <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" fill="#64748b" font-weight="600">TOTAL</text>
            `;

            contentSvg = `<g class="chart-half-donut-group">${baselineSvg}${slices}</g>`;
        }

        // --- 7. STACKED COLUMN CHART ---
        else if (type === 'stacked-column') {
            const padLeft = 45;
            const padRight = 30;
            const padBottom = 26;
            const plotX = padLeft;
            const plotY = plotTop + 10;
            const plotW = width - padLeft - padRight;
            const plotH = plotHeight - padBottom - 10;

            // Gridlines across 0%, 25%, 50%, 75%, 100%
            let gridlinesSvg = '';
            for (let step = 0; step <= 4; step++) {
                const pct = step * 25;
                const lineY = plotY + plotH - (plotH * (step / 4));
                gridlinesSvg += `
                    <line x1="${plotX}" y1="${lineY}" x2="${plotX + plotW}" y2="${lineY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="${step > 0 ? '3,3' : 'none'}" />
                    <text x="${plotX - 8}" y="${lineY + 3.5}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#94a3b8">${pct}%</text>
                `;
            }

            const colW = Math.min(95, Math.max(50, plotW * 0.28));
            const colX = plotX + 25;

            let currentY = plotY + plotH;
            const segmentsSvg = data.map((d) => {
                const fraction = d.value / total;
                const segH = fraction * plotH;
                currentY -= segH;
                const segY = currentY;
                const segMidY = segY + (segH / 2);

                let insideLabel = '';
                if (showValues && segH >= 16) {
                    insideLabel = `<text x="${colX + colW / 2}" y="${segMidY + 4}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="10.5" font-weight="700" fill="#ffffff" style="text-shadow:0 1px 2px rgba(0,0,0,0.5);">${Math.round(fraction * 100)}%</text>`;
                }

                // Callout on right side
                const calloutX = colX + colW + 18;
                const calloutText = `${d.label}: ${d.value} (${Math.round(fraction * 100)}%)`;
                const calloutSvg = `
                    <g class="chart-stacked-callout">
                        <line x1="${colX + colW}" y1="${segMidY}" x2="${calloutX - 4}" y2="${segMidY}" stroke="${d.color}" stroke-width="1.5" stroke-dasharray="2,2" />
                        <circle cx="${calloutX}" cy="${segMidY}" r="3.5" fill="${d.color}" />
                        <text x="${calloutX + 8}" y="${segMidY + 3.5}" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="600" fill="#334155">${escapeXml(calloutText)}</text>
                    </g>
                `;

                return `
                    <g class="chart-stacked-segment">
                        <rect x="${colX}" y="${segY}" width="${colW}" height="${Math.max(1, segH)}" fill="${d.color}" stroke="#ffffff" stroke-width="1.5" />
                        ${insideLabel}
                        ${calloutSvg}
                    </g>
                `;
            }).join('');

            const totalHeader = `<text x="${colX + colW / 2}" y="${plotY - 6}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="700" fill="#1e293b">Total: ${Math.round(total)}</text>`;

            contentSvg = `
                <g class="chart-stacked-group">
                    ${gridlinesSvg}
                    ${segmentsSvg}
                    ${totalHeader}
                </g>
            `;
        }

        // --- 8. RADAR / SPIDER WEB CHART ---
        else if (type === 'radar') {
            const cx = width / 2;
            const cy = plotTop + (plotHeight / 2) + 2;
            const R = Math.min(plotWidth / 2 - 58, plotHeight / 2 - 20);
            const N = Math.max(3, data.length);
            const maxVal = Math.max(...data.map(d => d.value), 1);

            // 1. Concentric Web Rings (3 rings)
            let webRingsSvg = '';
            [0.33, 0.66, 1.0].forEach((ratio, ringIdx) => {
                const ringPoints = [];
                for (let i = 0; i < N; i++) {
                    const angle = -Math.PI / 2 + (i * (2 * Math.PI / N));
                    const rx = cx + ratio * R * Math.cos(angle);
                    const ry = cy + ratio * R * Math.sin(angle);
                    ringPoints.push(`${rx.toFixed(1)},${ry.toFixed(1)}`);
                }
                const isOuter = ringIdx === 2;
                webRingsSvg += `<polygon points="${ringPoints.join(' ')}" fill="none" stroke="${isOuter ? '#cbd5e1' : '#e2e8f0'}" stroke-width="${isOuter ? '1.5' : '1'}" stroke-dasharray="${isOuter ? 'none' : '3,3'}" />`;
            });

            // 2. Radial Spokes & Outer Category Labels
            let spokesSvg = '';
            let labelsSvg = '';
            for (let i = 0; i < N; i++) {
                const angle = -Math.PI / 2 + (i * (2 * Math.PI / N));
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const sx = cx + R * cosA;
                const sy = cy + R * sinA;

                spokesSvg += `<line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" />`;

                // Outer label position
                const labelDist = R + 14;
                const lx = cx + labelDist * cosA;
                const ly = cy + labelDist * sinA + 3.5;
                let textAnchor = 'middle';
                if (cosA > 0.3) textAnchor = 'start';
                else if (cosA < -0.3) textAnchor = 'end';

                const d = data[i] || { label: `Item ${i+1}` };
                const displayLabel = d.label.length > 9 ? d.label.substring(0, 8) + '…' : d.label;
                labelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${textAnchor}" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="600" fill="#475569">${escapeXml(displayLabel)}</text>`;
            }

            // 3. Data Polygon & Dots
            const polyPoints = [];
            const dotsSvg = data.map((d, i) => {
                const angle = -Math.PI / 2 + (i * (2 * Math.PI / N));
                const ratio = Math.max(0.08, d.value / maxVal);
                const px = cx + ratio * R * Math.cos(angle);
                const py = cy + ratio * R * Math.sin(angle);
                polyPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);

                let valLabel = '';
                if (showValues) {
                    valLabel = `<text x="${px.toFixed(1)}" y="${(py - 7).toFixed(1)}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="700" fill="#1e293b">${d.value}</text>`;
                }

                return `
                    <g class="chart-radar-dot">
                        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="${d.color}" stroke="#ffffff" stroke-width="1.5" />
                        ${valLabel}
                    </g>
                `;
            }).join('');

            const primaryColor = data[0] ? data[0].color : '#0d9e8f';
            const dataPolySvg = `<polygon points="${polyPoints.join(' ')}" fill="${primaryColor}" fill-opacity="0.25" stroke="${primaryColor}" stroke-width="2.5" stroke-linejoin="round" />`;

            contentSvg = `
                <g class="chart-radar-group">
                    ${webRingsSvg}
                    ${spokesSvg}
                    ${labelsSvg}
                    ${dataPolySvg}
                    ${dotsSvg}
                </g>
            `;
        }

        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="display:block; overflow:visible; user-select:none; pointer-events:none;">
                <rect width="${width}" height="${height}" fill="#ffffff" rx="6" ry="6" />
                ${titleSvg}
                ${contentSvg}
                ${legendSvg}
            </svg>
        `;
    }

    /**
     * Parse raw CSV or TSV string into structured chart rows
     */
    function parseTabularData(text) {
        if (!text || !text.trim()) return null;
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length === 0) return null;

        const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(',') ? ',' : null);
        const parsed = [];

        lines.forEach((line, idx) => {
            let parts = delimiter ? line.split(delimiter) : line.split(/\s+/);
            parts = parts.map(p => p.trim().replace(/^["']|["']$/g, ''));
            if (parts.length >= 2) {
                const label = parts[0];
                const val = parseFloat(parts[1]);
                if (!isNaN(val)) {
                    parsed.push({
                        label: label,
                        value: val,
                        color: DEFAULT_PALETTE[parsed.length % DEFAULT_PALETTE.length]
                    });
                }
            } else if (parts.length === 1 && !isNaN(parseFloat(parts[0]))) {
                parsed.push({
                    label: `Item ${parsed.length + 1}`,
                    value: parseFloat(parts[0]),
                    color: DEFAULT_PALETTE[parsed.length % DEFAULT_PALETTE.length]
                });
            }
        });

        return parsed.length > 0 ? parsed : null;
    }

    /**
     * Interactive Chart Studio Modal
     * Supports inserting new charts or updating existing chart elements
     */
    window.showChartModal = function(editElement = null) {
        // Close any active menus
        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');

        // Existing config or fresh defaults
        let initialConfig = {
            type: 'pie',
            title: 'Sample Data Overview',
            showLegend: true,
            showValues: true,
            data: JSON.parse(JSON.stringify(DEFAULT_CHART_DATA))
        };

        if (editElement && editElement.dataset && editElement.dataset.chartConfig) {
            try {
                initialConfig = JSON.parse(editElement.dataset.chartConfig);
            } catch (e) {
                console.error("Failed to parse chart config for editing:", e);
            }
        } else if (editElement && typeof window.inferChartConfigFromElement === 'function') {
            const inferred = window.inferChartConfigFromElement(editElement);
            if (inferred) {
                initialConfig = inferred;
                editElement.dataset.chartConfig = JSON.stringify(inferred);
            }
        }

        // Active working state
        let currentConfig = JSON.parse(JSON.stringify(initialConfig));

        const chartTypes = [
            { id: 'pie', name: 'Pie Chart', icon: 'fa-chart-pie' },
            { id: 'donut', name: 'Donut Chart', icon: 'fa-circle-notch' },
            { id: 'column', name: 'Vertical Column', icon: 'fa-chart-bar' },
            { id: 'bar', name: 'Horizontal Bar', icon: 'fa-stream' },
            { id: 'line', name: 'Line Graph', icon: 'fa-chart-line' },
            { id: 'area', name: 'Area Chart', icon: 'fa-chart-area' },
            { id: 'half-donut', name: 'Semi-Circle Gauge', icon: 'fa-tachometer-alt' },
            { id: 'stacked-column', name: 'Stacked Column', icon: 'fa-layer-group' },
            { id: 'radar', name: 'Radar / Spider', icon: 'fa-spider' }
        ];

        const modalHTML = `
            <div id="chart-studio-container" style="display:flex; gap:16px; width:980px; max-width:95vw; min-height:480px; font-family:'Segoe UI',system-ui,sans-serif; color:#1e293b; box-sizing:border-box;">
                <!-- 1. LEFT PANEL: CHART TYPES -->
                <div style="width:175px; flex-shrink:0; border-right:1px solid #e2e8f0; padding-right:14px; display:flex; flex-direction:column; gap:6px;">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:4px; letter-spacing:0.5px;">Chart Type</div>
                    <div style="display:flex; flex-direction:column; gap:5px; max-height:380px; overflow-y:auto; padding-right:2px;">
                        ${chartTypes.map(t => `
                            <button type="button" class="chart-type-btn ${t.id === currentConfig.type ? 'active' : ''}" data-type="${t.id}" style="
                                display:flex; align-items:center; gap:9px; width:100%; padding:7.5px 10px; border-radius:6px;
                                border:1px solid ${t.id === currentConfig.type ? 'var(--ui-theme-color, #0d9e8f)' : '#e2e8f0'};
                                background:${t.id === currentConfig.type ? 'color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 12%, transparent)' : '#ffffff'};
                                color:${t.id === currentConfig.type ? 'var(--ui-theme-dark, #0d9e8f)' : '#334155'};
                                font-weight:600; font-size:11.5px; cursor:pointer; text-align:left; transition:all 0.15s ease;
                            ">
                                <i class="fas ${t.icon}" style="font-size:14px; width:16px; text-align:center;"></i>
                                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top:auto; padding-top:10px; border-top:1px solid #e2e8f0;">
                        <button type="button" id="chart-btn-csv-import" style="
                            width:100%; padding:8px 10px; font-size:11.5px; font-weight:600;
                            border:1px dashed #cbd5e1; border-radius:6px; background:#f8fafc;
                            color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;
                            transition:all 0.15s ease;
                        ">
                            <i class="fas fa-file-csv"></i> Paste CSV / TSV
                        </button>
                    </div>
                </div>

                <!-- 2. CENTER PANEL: DATA GRID & OPTIONS -->
                <div style="flex:1.25; display:flex; flex-direction:column; gap:12px; min-width:420px; box-sizing:border-box;">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div style="flex:1;">
                            <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:4px; text-transform:uppercase;">Chart Title</label>
                            <input type="text" id="chart-title-input" value="${escapeXml(currentConfig.title)}" placeholder="e.g. Sales by Department" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:4px; font-size:12.5px; box-sizing:border-box;">
                        </div>
                    </div>

                    <div style="display:flex; gap:16px; font-size:12px; align-items:center;">
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none;">
                            <input type="checkbox" id="chart-chk-legend" ${currentConfig.showLegend ? 'checked' : ''}> Show Legend
                        </label>
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none;">
                            <input type="checkbox" id="chart-chk-values" ${currentConfig.showValues ? 'checked' : ''}> Show Data Labels
                        </label>
                    </div>

                    <!-- Data Rows Container -->
                    <div style="flex:1; border:1px solid #e2e8f0; border-radius:6px; background:#ffffff; overflow:hidden; display:flex; flex-direction:column; box-sizing:border-box;">
                        <div style="background:#f1f5f9; padding:7px 10px; font-size:11px; font-weight:700; color:#475569; display:grid; grid-template-columns:34px minmax(0, 1fr) 86px 28px; gap:8px; border-bottom:1px solid #e2e8f0; box-sizing:border-box;">
                            <span>Color</span>
                            <span>Label</span>
                            <span style="text-align:center;">Value</span>
                            <span></span>
                        </div>
                        <div id="chart-rows-list" style="overflow-y:auto; overflow-x:hidden !important; max-height:235px; padding:6px 10px; display:flex; flex-direction:column; gap:6px; box-sizing:border-box;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <button type="button" id="chart-btn-add-row" style="
                        align-self:flex-start; padding:6px 12px; font-size:11.5px; font-weight:600;
                        border:1px solid var(--ui-theme-color, #0d9e8f); border-radius:4px;
                        background:color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 10%, transparent);
                        color:var(--ui-theme-dark, #0d9e8f); cursor:pointer; display:inline-flex; align-items:center; gap:6px;
                        transition:all 0.15s ease;
                    ">
                        <i class="fas fa-plus"></i> Add Row
                    </button>
                </div>

                <!-- 3. RIGHT PANEL: LIVE PREVIEW -->
                <div style="width:325px; flex-shrink:0; display:flex; flex-direction:column; gap:8px;">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; letter-spacing:0.5px;">Live Preview</div>
                    <div id="chart-live-preview-box" style="
                        flex:1; border:1px solid #e2e8f0; border-radius:6px; background:#ffffff;
                        display:flex; align-items:center; justify-content:center; padding:10px;
                        box-shadow:inset 0 1px 3px rgba(0,0,0,0.03); min-height:280px; box-sizing:border-box;
                    ">
                        <!-- SVG injected here -->
                    </div>
                </div>
            </div>
        `;

        const modalTitle = editElement ? "Edit Chart & Graph" : "Insert Pie Chart or Graph";

        DialogSystem.show(modalTitle, modalHTML, function() {
            // Callback when "OK / Insert" is clicked
            applyChartToCanvas(currentConfig, editElement);
        });

        // --- BIND EVENT HANDLERS IN MODAL ---
        const container = document.getElementById('chart-studio-container');
        if (!container) return;

        const updatePreview = () => {
            const previewBox = document.getElementById('chart-live-preview-box');
            if (previewBox) {
                previewBox.innerHTML = generateChartSVG(currentConfig, 330, 250);
            }
        };

        let rowSpinTimer = null;
        let rowSpinTimeout = null;

        const stopRowSpin = () => {
            clearTimeout(rowSpinTimeout);
            clearInterval(rowSpinTimer);
            rowSpinTimeout = null;
            rowSpinTimer = null;
        };

        const doRowSpin = (idx, delta) => {
            if (!currentConfig.data[idx]) return;
            const currentVal = parseFloat(currentConfig.data[idx].value) || 0;
            const nextVal = Math.max(0, Math.round((currentVal + delta) * 10) / 10);
            currentConfig.data[idx].value = nextVal;
            const input = container.querySelector(`.chart-row-val[data-index="${idx}"]`);
            if (input) {
                input.value = nextVal;
            }
            updatePreview();
        };

        const renderRows = () => {
            const rowsList = document.getElementById('chart-rows-list');
            if (!rowsList) return;

            rowsList.innerHTML = '';
            currentConfig.data.forEach((row, idx) => {
                const rowDiv = document.createElement('div');
                rowDiv.style.cssText = 'display:grid; grid-template-columns:34px minmax(0, 1fr) 86px 28px; gap:8px; align-items:center; box-sizing:border-box;';
                rowDiv.innerHTML = `
                    <input type="color" class="chart-row-color" data-index="${idx}" value="${row.color}" style="width:32px; height:26px; border:none; border-radius:4px; cursor:pointer; padding:0; background:none;">
                    <input type="text" class="chart-row-label" data-index="${idx}" value="${escapeXml(row.label)}" placeholder="Label" style="width:100%; min-width:0; padding:5px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; box-sizing:border-box;">
                    <div class="chart-modern-spinner" title="Adjust Value">
                        <input type="text" class="chart-row-val" data-index="${idx}" value="${row.value}">
                        <div class="spin-btns">
                            <div class="chart-spin-btn chart-spin-up" data-index="${idx}" title="Increase"><i class="fas fa-chevron-up"></i></div>
                            <div class="chart-spin-btn chart-spin-down" data-index="${idx}" title="Decrease"><i class="fas fa-chevron-down"></i></div>
                        </div>
                    </div>
                    <button type="button" class="chart-row-del" data-index="${idx}" title="Delete Row" style="padding:0 !important; margin:0; background:none; border:none; color:#ef4444; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; box-sizing:border-box; border-radius:4px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                rowsList.appendChild(rowDiv);
            });

            // Wire input listeners on rows
            rowsList.querySelectorAll('.chart-row-color').forEach(input => {
                input.oninput = (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    currentConfig.data[idx].color = e.target.value;
                    updatePreview();
                };
            });

            rowsList.querySelectorAll('.chart-row-label').forEach(input => {
                input.oninput = (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    currentConfig.data[idx].label = e.target.value;
                    updatePreview();
                };
            });

            rowsList.querySelectorAll('.chart-row-val').forEach(input => {
                const handleVal = () => {
                    const idx = parseInt(input.dataset.index);
                    currentConfig.data[idx].value = Math.max(0, parseFloat(input.value) || 0);
                    updatePreview();
                };
                input.oninput = handleVal;
                input.onchange = handleVal;
                input.onkeydown = (e) => {
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        doRowSpin(parseInt(input.dataset.index), e.shiftKey ? 5 : 1);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        doRowSpin(parseInt(input.dataset.index), e.shiftKey ? -5 : -1);
                    }
                };
            });

            // Spin buttons click and hold
            rowsList.querySelectorAll('.chart-spin-up').forEach(btn => {
                const idx = parseInt(btn.dataset.index);
                btn.onmousedown = (e) => {
                    e.preventDefault();
                    const delta = e.shiftKey ? 5 : 1;
                    doRowSpin(idx, delta);
                    rowSpinTimeout = setTimeout(() => {
                        rowSpinTimer = setInterval(() => doRowSpin(idx, delta), 75);
                    }, 350);
                };
                btn.onmouseup = stopRowSpin;
                btn.onmouseleave = stopRowSpin;
            });

            rowsList.querySelectorAll('.chart-spin-down').forEach(btn => {
                const idx = parseInt(btn.dataset.index);
                btn.onmousedown = (e) => {
                    e.preventDefault();
                    const delta = e.shiftKey ? -5 : -1;
                    doRowSpin(idx, delta);
                    rowSpinTimeout = setTimeout(() => {
                        rowSpinTimer = setInterval(() => doRowSpin(idx, delta), 75);
                    }, 350);
                };
                btn.onmouseup = stopRowSpin;
                btn.onmouseleave = stopRowSpin;
            });

            rowsList.querySelectorAll('.chart-row-del').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    if (currentConfig.data.length > 1) {
                        currentConfig.data.splice(idx, 1);
                        renderRows();
                        updatePreview();
                    }
                };
            });
        };

        // Chart type selection
        container.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.onclick = () => {
                container.querySelectorAll('.chart-type-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.borderColor = '#e2e8f0';
                    b.style.background = '#ffffff';
                    b.style.color = '#334155';
                });
                btn.classList.add('active');
                btn.style.borderColor = 'var(--ui-theme-color, #0d9e8f)';
                btn.style.background = 'color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 12%, transparent)';
                btn.style.color = 'var(--ui-theme-dark, #0d9e8f)';

                currentConfig.type = btn.dataset.type;
                updatePreview();
            };
        });

        // Title input
        const titleInput = document.getElementById('chart-title-input');
        if (titleInput) {
            titleInput.oninput = () => {
                currentConfig.title = titleInput.value;
                updatePreview();
            };
        }

        // Toggles
        const chkLegend = document.getElementById('chart-chk-legend');
        if (chkLegend) {
            chkLegend.onchange = () => {
                currentConfig.showLegend = chkLegend.checked;
                updatePreview();
            };
        }

        const chkValues = document.getElementById('chart-chk-values');
        if (chkValues) {
            chkValues.onchange = () => {
                currentConfig.showValues = chkValues.checked;
                updatePreview();
            };
        }

        // Add Row button
        const btnAdd = document.getElementById('chart-btn-add-row');
        if (btnAdd) {
            btnAdd.onclick = () => {
                const nextIdx = currentConfig.data.length;
                currentConfig.data.push({
                    label: `Item ${nextIdx + 1}`,
                    value: 20,
                    color: DEFAULT_PALETTE[nextIdx % DEFAULT_PALETTE.length]
                });
                renderRows();
                updatePreview();
            };
        }

        // CSV / TSV Import prompt
        const btnCsv = document.getElementById('chart-btn-csv-import');
        if (btnCsv) {
            btnCsv.onclick = () => {
                const rawText = prompt("Paste your tabular data (columns of Label and Value separated by tabs or commas):", "Product A\t40\nProduct B\t28\nProduct C\t18\nProduct D\t14");
                if (rawText) {
                    const parsed = parseTabularData(rawText);
                    if (parsed) {
                        currentConfig.data = parsed;
                        renderRows();
                        updatePreview();
                    } else {
                        alert("Could not parse data rows. Please ensure lines have format: Label, Value");
                    }
                }
            };
        }

        // Initial render
        renderRows();
        updatePreview();
    };

    /**
     * Inserts or updates the chart element on the active canvas
     */
    function applyChartToCanvas(config, existingElement = null) {
        if (existingElement) {
            // Update existing element using its actual canvas dimensions
            const w = parseFloat(existingElement.style.width) || 380;
            const h = parseFloat(existingElement.style.height) || 280;
            const svgMarkup = generateChartSVG(config, w, h);
            existingElement.setAttribute('data-type', 'chart');
            existingElement.dataset.chartConfig = JSON.stringify(config);
            const content = existingElement.querySelector('.element-content');
            if (content) {
                content.innerHTML = svgMarkup;
            }
            if (window.TemplateCSSColorEngine && typeof window.TemplateCSSColorEngine.refreshRibbonPanel === 'function') {
                window.TemplateCSSColorEngine.refreshRibbonPanel(existingElement);
            }
            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof pushHistory === 'function') pushHistory();
            if (typeof window.showToastNotification === 'function') {
                window.showToastNotification('Chart updated successfully');
            }
            return existingElement;
        }

        const svgMarkup = generateChartSVG(config, 380, 280);

        // Create new canvas element
        if (typeof createWrapper !== 'function') {
            console.error("createWrapper function not available on canvas");
            return null;
        }

        const el = createWrapper(svgMarkup);
        el.setAttribute('data-type', 'chart');
        el.dataset.chartConfig = JSON.stringify(config);
        el.style.width = '380px';
        el.style.height = '280px';

        // Position centrally on canvas
        const paper = document.getElementById('paper');
        if (paper) {
            const paperW = parseFloat(paper.style.width) || 794;
            const paperH = parseFloat(paper.style.height) || 1123;
            el.style.left = Math.max(40, Math.round((paperW - 380) / 2)) + 'px';
            el.style.top = Math.max(40, Math.round((paperH - 280) / 3)) + 'px';
        }

        // Double-click to re-edit
        el.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            window.showChartModal(el);
        });

        if (window.TemplateCSSColorEngine && typeof window.TemplateCSSColorEngine.refreshRibbonPanel === 'function') {
            window.TemplateCSSColorEngine.refreshRibbonPanel(el);
        }

        if (typeof updateThumbnails === 'function') updateThumbnails();
        if (typeof pushHistory === 'function') pushHistory();

        if (typeof window.showToastNotification === 'function') {
            const typeLabel = config.type.charAt(0).toUpperCase() + config.type.slice(1);
            window.showToastNotification(`${existingElement ? 'Updated' : 'Inserted'} ${typeLabel} Chart`, 'fa-chart-pie');
        }

        return el;
    }

    /**
     * Universal detector for chart elements (both explicit data-type="chart" and SVG/template charts)
     */
    window.isChartElement = function(el) {
        if (!el || !el.querySelector) return false;
        if (el.getAttribute && el.getAttribute('data-type') === 'chart') return true;
        if (el.dataset && el.dataset.chartConfig) return true;
        if (el.querySelector('.chart-pie-group, .chart-column-group, .chart-bar-group, .chart-line-group, .chart-area-group, .chart-half-donut-group, .chart-stacked-group, .chart-radar-group, .chart-slice')) {
            return true;
        }
        return false;
    };

    /**
     * Infers a valid chartConfig from an existing chart element's SVG or DOM if data-chart-config was missing
     */
    window.inferChartConfigFromElement = function(el) {
        if (!el) return null;
        if (el.dataset && el.dataset.chartConfig) {
            try { return JSON.parse(el.dataset.chartConfig); } catch (e) {}
        }
        const svg = el.querySelector('svg');
        if (!svg) return null;

        let type = 'pie';
        if (svg.querySelector('.chart-pie-group')) {
            const firstPath = svg.querySelector('.chart-slice path');
            const dAttr = firstPath ? (firstPath.getAttribute('d') || '') : '';
            type = (dAttr.match(/A\s/g) || []).length >= 2 ? 'donut' : 'pie';
        } else if (svg.querySelector('.chart-column-group')) type = 'column';
        else if (svg.querySelector('.chart-bar-group')) type = 'bar';
        else if (svg.querySelector('.chart-line-group')) type = 'line';
        else if (svg.querySelector('.chart-area-group')) type = 'area';
        else if (svg.querySelector('.chart-half-donut-group')) type = 'half-donut';
        else if (svg.querySelector('.chart-stacked-group')) type = 'stacked-column';
        else if (svg.querySelector('.chart-radar-group')) type = 'radar';

        const texts = Array.from(svg.querySelectorAll('text'));
        let title = '';
        if (texts.length > 0 && parseFloat(texts[0].getAttribute('y') || '999') <= 32) {
            title = (texts[0].textContent || '').trim();
        }

        const data = [];
        const slices = svg.querySelectorAll('.chart-slice');
        if (slices.length > 0) {
            slices.forEach((slice, idx) => {
                const path = slice.querySelector('path');
                const color = (path && path.getAttribute('fill')) || CHART_PALETTE[idx % CHART_PALETTE.length];
                const sliceText = slice.querySelector('text');
                const rawVal = sliceText ? parseFloat((sliceText.textContent || '').replace(/[^0-9.-]/g, '')) : (idx + 1) * 20;
                data.push({
                    label: `Slice ${idx + 1}`,
                    value: !isNaN(rawVal) && rawVal > 0 ? rawVal : 25,
                    color: color
                });
            });
            const legendGroup = svg.querySelector('g[transform*="translate"]');
            if (legendGroup) {
                const legendTexts = Array.from(legendGroup.querySelectorAll('text'));
                legendTexts.forEach((lt, idx) => {
                    if (data[idx] && lt.textContent) {
                        data[idx].label = lt.textContent.trim();
                    }
                });
            }
        }

        if (data.length === 0) {
            return {
                type: type,
                title: title || 'Chart Overview',
                showLegend: true,
                showValues: true,
                data: JSON.parse(JSON.stringify(DEFAULT_CHART_DATA))
            };
        }

        return {
            type: type,
            title: title,
            showLegend: true,
            showValues: true,
            data: data
        };
    };

    // Attach dblclick listeners to pre-existing chart elements on document load / render
    window.initChartElements = function() {
        const allEls = document.querySelectorAll('.pub-element');
        allEls.forEach(el => {
            if (!window.isChartElement(el)) return;
            if (el.getAttribute('data-type') !== 'chart') {
                el.setAttribute('data-type', 'chart');
            }
            el.querySelectorAll('[contenteditable]').forEach(ce => ce.removeAttribute('contenteditable'));

            if (!el.dataset.chartConfig) {
                const inferred = window.inferChartConfigFromElement(el);
                if (inferred) {
                    el.dataset.chartConfig = JSON.stringify(inferred);
                }
            } else {
                const content = el.querySelector('.element-content');
                if (content && !content.querySelector('svg')) {
                    try {
                        const cfg = JSON.parse(el.dataset.chartConfig);
                        const w = parseFloat(el.style.width) || 380;
                        const h = parseFloat(el.style.height) || 280;
                        content.innerHTML = generateChartSVG(cfg, w, h);
                    } catch (err) {}
                }
            }
            if (!el.dataset.chartBound) {
                el.dataset.chartBound = "true";
                el.addEventListener('dblclick', function(e) {
                    e.stopPropagation();
                    window.showChartModal(el);
                });
            }
        });
    };

    // Global capture-phase dblclick guard so double-clicking any chart ALWAYS opens Chart Studio
    if (!window._chartGlobalDblClickBound) {
        window._chartGlobalDblClickBound = true;
        document.addEventListener('dblclick', function(e) {
            const el = e.target && e.target.closest ? e.target.closest('.pub-element') : null;
            if (el && window.isChartElement && window.isChartElement(el)) {
                e.stopPropagation();
                e.preventDefault();
                window.showChartModal(el);
            }
        }, true);
    }

    // Public export
    window.generateChartSVG = generateChartSVG;
    window.applyChartToCanvas = applyChartToCanvas;

    console.log("✅ OpenPublisher Chart & Graph Engine (v5.14.3) loaded successfully.");

})(window);
