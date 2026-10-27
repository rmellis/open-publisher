/**
 * OpenPublisher Progress Bar Engine (v5.12.1)
 * 
 * Provides interactive, scrollable, and draggable progress bars for publications,
 * CVs, resumes, portfolios, and reports. Supports 71 distinct visual styles,
 * full color/radius/label customization, mousewheel adjustment, direct handle dragging,
 * a floating quick-customizer toolbar, and WYSIWYG print & export serialization.
 */

(function(window) {
    'use strict';

    // --- 1. PRESET STYLES CATALOG ---
    const PROGRESS_BAR_STYLES = [
        // --- CATEGORY 1: CV & SKILLS ---
        {
            id: 'capsule-green',
            name: 'CV Emerald Skill',
            category: 'CV & Skills',
            trackColor: '#1e293b',
            fillColor: '#22c55e',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Dark slate capsule with vivid emerald green fill, ideal for modern tech CVs and resumes.'
        },
        {
            id: 'capsule-teal',
            name: 'Publisher Teal',
            category: 'CV & Skills',
            trackColor: '#134e4a',
            fillColor: '#14b8a6',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Deep teal track with bright turquoise fill matching OpenPublisher teal theme.'
        },
        {
            id: 'inside-counter',
            name: 'Inset Value Counter',
            category: 'CV & Skills',
            trackColor: '#0f172a',
            fillColor: '#10b981',
            radius: 'rounded',
            height: 22,
            showLabel: 'inside',
            labelColor: '#ffffff',
            description: 'Thicker bar displaying bold percentage directly inside the fill head.'
        },
        {
            id: 'rose-coral',
            name: 'Rose Quartz',
            category: 'CV & Skills',
            trackColor: '#ffe4e6',
            fillColor: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
            radius: 'full',
            height: 14,
            showLabel: 'right',
            labelColor: '#be123c',
            description: 'Delicate blush track with warm rose coral gradient fill, great for creative CVs.'
        },
        {
            id: 'forest-sage',
            name: 'Forest Sage',
            category: 'CV & Skills',
            trackColor: '#f0fdf4',
            fillColor: '#15803d',
            radius: 'rounded',
            height: 14,
            showLabel: 'right',
            labelColor: '#166534',
            border: '1px solid #bbf7d0',
            description: 'Organic sage green on soft mint track, ideal for wellness and eco themes.'
        },
        {
            id: 'obsidian-gold',
            name: 'Obsidian & Gold',
            category: 'CV & Skills',
            trackColor: '#1c1917',
            fillColor: 'linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #fcd34d 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'right',
            labelColor: '#b45309',
            description: 'Deep matte obsidian track with luminous gold gradient fill, ideal for executive CVs.'
        },
        {
            id: 'royal-amethyst',
            name: 'Royal Amethyst',
            category: 'CV & Skills',
            trackColor: '#f5f3ff',
            fillColor: 'linear-gradient(90deg, #7c3aed 0%, #9333ea 100%)',
            radius: 'rounded',
            height: 18,
            showLabel: 'right',
            labelColor: '#6b21a8',
            border: '1px solid #ddd6fe',
            description: 'Light lavender track with royal purple amethyst gradient and neat right label.'
        },
        {
            id: 'slate-monogram',
            name: 'Slate Monogram',
            category: 'CV & Skills',
            trackColor: '#0f172a',
            fillColor: '#38bdf8',
            radius: 'subtle',
            height: 14,
            showLabel: 'right',
            labelColor: '#0284c7',
            description: 'Dark navy slate track with sky blue fill, great for engineering & coding resumes.'
        },
        {
            id: 'ruby-coral',
            name: 'Ruby Coral',
            category: 'CV & Skills',
            trackColor: '#fff1f2',
            fillColor: 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'right',
            labelColor: '#9f1239',
            description: 'Soft blush pink track with vivid ruby red gradient fill.'
        },
        {
            id: 'vintage-bronze',
            name: 'Vintage Bronze',
            category: 'CV & Skills',
            trackColor: '#27272a',
            fillColor: 'linear-gradient(90deg, #78350f 0%, #b45309 50%, #d97706 100%)',
            radius: 'subtle',
            height: 22,
            showLabel: 'inside',
            labelColor: '#ffffff',
            description: 'Dark bronze and amber styling with integrated percentage counter inside the fill.'
        },
        {
            id: 'mint-charcoal',
            name: 'Mint & Charcoal',
            category: 'CV & Skills',
            trackColor: '#111827',
            fillColor: '#34d399',
            radius: 'full',
            height: 14,
            showLabel: 'right',
            labelColor: '#059669',
            description: 'High-contrast charcoal track with crisp spring mint green fill.'
        },
        {
            id: 'chunky-skills-banner',
            name: 'Master Skill Banner',
            category: 'CV & Skills',
            trackColor: '#f1f5f9',
            fillColor: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
            radius: 'rounded',
            height: 32,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '2px solid #cbd5e1',
            description: 'Substantial 32px thick skill banner displaying bold white percentage inside.'
        },
        {
            id: 'grand-competency-slab',
            name: 'Grand Competency Slab',
            category: 'CV & Skills',
            trackColor: '#e2e8f0',
            fillColor: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
            radius: 'rounded',
            height: 40,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '2px solid #94a3b8',
            description: 'Heavy 40px executive competency slab with high-impact bold typography.'
        },

        // --- CATEGORY 2: CORPORATE & MINIMAL ---
        {
            id: 'modern-sapphire',
            name: 'Executive Sapphire',
            category: 'Corporate & Minimal',
            trackColor: '#e2e8f0',
            fillColor: '#2563eb',
            radius: 'rounded',
            height: 14,
            showLabel: 'right',
            labelColor: '#1e293b',
            description: 'Light slate track with royal sapphire fill and neat percentage text on right.'
        },
        {
            id: 'hairline-minimal',
            name: 'Minimalist Hairline',
            category: 'Corporate & Minimal',
            trackColor: '#e5e7eb',
            fillColor: '#111827',
            radius: 'subtle',
            height: 6,
            showLabel: 'right',
            labelColor: '#374151',
            description: 'Ultra-slim 6px modern editorial progress rule.'
        },
        {
            id: 'chunky-flat',
            name: 'Bold Flat Crimson',
            category: 'Corporate & Minimal',
            trackColor: '#334155',
            fillColor: '#f43f5e',
            radius: 'square',
            height: 24,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Crisp, square-cornered 24px industrial flat bar.'
        },
        {
            id: 'framed-blueprint',
            name: 'Framed Blueprint',
            category: 'Corporate & Minimal',
            trackColor: '#eff6ff',
            fillColor: '#2563eb',
            radius: 'subtle',
            height: 18,
            showLabel: 'none',
            labelColor: '#2563eb',
            border: '2px solid #2563eb',
            description: 'Crisp 2px outline frame with inset progress bar inside.'
        },
        {
            id: 'nordic-frost',
            name: 'Nordic Frost',
            category: 'Corporate & Minimal',
            trackColor: '#e0f2fe',
            fillColor: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
            radius: 'full',
            height: 14,
            showLabel: 'right',
            labelColor: '#0369a1',
            description: 'Subtle ice blue track with cool arctic sky gradient fill.'
        },
        {
            id: 'charcoal-amber',
            name: 'Charcoal & Amber',
            category: 'Corporate & Minimal',
            trackColor: '#18181b',
            fillColor: '#f59e0b',
            radius: 'subtle',
            height: 12,
            showLabel: 'right',
            labelColor: '#d97706',
            description: 'Deep matte zinc track with bright warm amber accent rule.'
        },
        {
            id: 'steel-monochrome',
            name: 'Monochrome Steel',
            category: 'Corporate & Minimal',
            trackColor: '#e2e8f0',
            fillColor: '#475569',
            radius: 'square',
            height: 12,
            showLabel: 'right',
            labelColor: '#334155',
            description: 'Neutral steel grey on light slate, clean and restrained for financial reports.'
        },
        {
            id: 'heavy-industrial',
            name: 'Heavy Industrial Block',
            category: 'Corporate & Minimal',
            trackColor: '#27272a',
            fillColor: '#facc15',
            radius: 'square',
            height: 36,
            showLabel: 'inside',
            labelColor: '#18181b',
            border: '2px solid #3f3f46',
            description: '36px heavy industrial block with bright yellow fill and bold black inside value.'
        },
        {
            id: 'titanium-slim',
            name: 'Titanium Slim',
            category: 'Corporate & Minimal',
            trackColor: '#f4f4f5',
            fillColor: '#52525b',
            radius: 'subtle',
            height: 8,
            showLabel: 'right',
            labelColor: '#27272a',
            description: '8px sleek titanium rule with clean precision label.'
        },
        {
            id: 'corporate-navy',
            name: 'Corporate Navy Pillar',
            category: 'Corporate & Minimal',
            trackColor: '#f0f9ff',
            fillColor: '#0369a1',
            radius: 'rounded',
            height: 24,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '1px solid #bae6fd',
            description: '24px solid deep navy corporate bar with inset percentage value.'
        },
        {
            id: 'framed-crimson',
            name: 'Framed Crimson',
            category: 'Corporate & Minimal',
            trackColor: '#fef2f2',
            fillColor: '#dc2626',
            radius: 'subtle',
            height: 18,
            showLabel: 'none',
            labelColor: '#b91c1c',
            border: '2px solid #dc2626',
            description: '2px outline frame in crimson red with matching inset progress bar.'
        },
        {
            id: 'metro-emerald',
            name: 'Metro Flat Emerald',
            category: 'Corporate & Minimal',
            trackColor: '#d1fae5',
            fillColor: '#059669',
            radius: 'square',
            height: 20,
            showLabel: 'right',
            labelColor: '#065f46',
            description: 'Crisp flat Metro design aesthetic with zero border-radius.'
        },
        {
            id: 'executive-jumbo',
            name: 'Executive Giant Rule',
            category: 'Corporate & Minimal',
            trackColor: '#e2e8f0',
            fillColor: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
            radius: 'rounded',
            height: 48,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '2px solid #94a3b8',
            description: 'Ultra-thick 48px executive banner bar with deep cobalt gradient and bold inside counter.'
        },
        {
            id: 'matte-graphite',
            name: 'Matte Graphite & Lime',
            category: 'Corporate & Minimal',
            trackColor: '#3f3f46',
            fillColor: '#a3e635',
            radius: 'subtle',
            height: 16,
            showLabel: 'right',
            labelColor: '#4d7c0f',
            description: 'Dark graphite grey bar with lime green accent line.'
        },

        // --- CATEGORY 3: VIBRANT & MODERN ---
        {
            id: 'cyber-cyan',
            name: 'Cyberpunk Glow',
            category: 'Vibrant & Modern',
            trackColor: '#090d16',
            fillColor: '#06b6d4',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#06b6d4',
            glow: '0 0 10px rgba(6, 182, 212, 0.7)',
            description: 'Midnight black track with electric neon cyan glowing fill.'
        },
        {
            id: 'sunset-gradient',
            name: 'Sunset Radiance',
            category: 'Vibrant & Modern',
            trackColor: '#292524',
            fillColor: 'linear-gradient(90deg, #f97316 0%, #ec4899 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Vibrant orange-to-fuchsia gradient on warm charcoal track.'
        },
        {
            id: 'violet-dream',
            name: 'Cosmic Violet',
            category: 'Vibrant & Modern',
            trackColor: '#2e1065',
            fillColor: 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Purple to indigo gradient on deep cosmic violet track.'
        },
        {
            id: 'prestige-gold',
            name: 'Prestige Metallic Gold',
            category: 'Vibrant & Modern',
            trackColor: '#0a1128',
            fillColor: 'linear-gradient(90deg, #d97706 0%, #fbbf24 50%, #fef08a 100%)',
            radius: 'full',
            height: 18,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Midnight navy track with rich metallic gold gradient fill.'
        },
        {
            id: 'aurora-lights',
            name: 'Aurora Borealis',
            category: 'Vibrant & Modern',
            trackColor: '#064e3b',
            fillColor: 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            glow: '0 0 10px rgba(16, 185, 129, 0.6)',
            description: 'Luminous northern lights gradient flowing from emerald to cyan.'
        },
        {
            id: 'retro-synthwave',
            name: 'Synthwave Neon',
            category: 'Vibrant & Modern',
            trackColor: '#180026',
            fillColor: 'linear-gradient(90deg, #ff007f 0%, #b000ff 100%)',
            radius: 'square',
            height: 20,
            showLabel: 'inside',
            labelColor: '#ffffff',
            glow: '0 0 12px rgba(255, 0, 127, 0.7)',
            border: '2px solid #ff007f',
            description: 'Retro 80s arcade neon magenta with sharp corners and glowing outline.'
        },
        {
            id: 'velvet-indigo',
            name: 'Velvet Indigo',
            category: 'Vibrant & Modern',
            trackColor: '#1e1b4b',
            fillColor: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Deep velvet midnight track with royal indigo gradient.'
        },
        {
            id: 'electric-lime',
            name: 'Electric Lime Glow',
            category: 'Vibrant & Modern',
            trackColor: '#022c22',
            fillColor: '#84cc16',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#84cc16',
            glow: '0 0 10px rgba(132, 204, 22, 0.7)',
            description: 'Deep forest black track with electric neon lime glowing fill.'
        },
        {
            id: 'peach-blossom',
            name: 'Peach Blossom',
            category: 'Vibrant & Modern',
            trackColor: '#fff7ed',
            fillColor: 'linear-gradient(90deg, #fb923c 0%, #f43f5e 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'right',
            labelColor: '#c2410c',
            description: 'Warm sunny peach to fuchsia gradient fill on cream track.'
        },
        {
            id: 'ocean-aqua',
            name: 'Deep Ocean Aqua',
            category: 'Vibrant & Modern',
            trackColor: '#082f49',
            fillColor: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
            radius: 'rounded',
            height: 20,
            showLabel: 'inside',
            labelColor: '#ffffff',
            glow: '0 0 8px rgba(6, 182, 212, 0.5)',
            description: 'Midnight ocean track with aqua-to-blue gradient and glowing fill.'
        },
        {
            id: 'hot-coral-glow',
            name: 'Hot Coral & Tangerine',
            category: 'Vibrant & Modern',
            trackColor: '#1c1917',
            fillColor: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
            radius: 'full',
            height: 18,
            showLabel: 'right',
            labelColor: '#ea580c',
            glow: '0 0 10px rgba(249, 115, 22, 0.6)',
            description: 'Dark stone track with high-voltage glowing tangerine-coral gradient.'
        },
        {
            id: 'ultraviolet-beam',
            name: 'Ultraviolet Beam',
            category: 'Vibrant & Modern',
            trackColor: '#09090b',
            fillColor: 'linear-gradient(90deg, #c084fc 0%, #818cf8 50%, #38bdf8 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'none',
            labelColor: '#ffffff',
            glow: '0 0 12px rgba(192, 132, 252, 0.7)',
            description: 'Pitch black track with luminous triple-tone ultraviolet spectrum glow.'
        },
        {
            id: 'cyber-gold-block',
            name: 'Cyber Gold Megabar',
            category: 'Vibrant & Modern',
            trackColor: '#171717',
            fillColor: 'linear-gradient(90deg, #eab308 0%, #facc15 50%, #fef08a 100%)',
            radius: 'subtle',
            height: 34,
            showLabel: 'inside',
            labelColor: '#171717',
            glow: '0 0 10px rgba(234, 179, 8, 0.5)',
            border: '2px solid #ca8a04',
            description: '34px thick cyberpunk gold bar with glowing gradient and dark inset percentage.'
        },
        {
            id: 'frost-cyan-thick',
            name: 'Glacial Cyan Slab',
            category: 'Vibrant & Modern',
            trackColor: '#083344',
            fillColor: 'linear-gradient(90deg, #22d3ee 0%, #67e8f9 100%)',
            radius: 'rounded',
            height: 30,
            showLabel: 'inside',
            labelColor: '#083344',
            glow: '0 0 12px rgba(34, 211, 238, 0.6)',
            description: '30px glowing ice blue glacial slab with high-contrast inside counter.'
        },
        {
            id: 'bubblegum-pop',
            name: 'Bubblegum Pop',
            category: 'Vibrant & Modern',
            trackColor: '#fdf2f8',
            fillColor: 'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)',
            radius: 'full',
            height: 16,
            showLabel: 'right',
            labelColor: '#be185d',
            description: 'Playful vibrant pink bubblegum gradient, perfect for creative and lifestyle media.'
        },
        {
            id: 'inferno-flame',
            name: 'Inferno Flame',
            category: 'Vibrant & Modern',
            trackColor: '#450a0a',
            fillColor: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #facc15 100%)',
            radius: 'full',
            height: 18,
            showLabel: 'inside',
            labelColor: '#ffffff',
            glow: '0 0 10px rgba(239, 68, 68, 0.6)',
            description: 'Blazing red-orange-yellow fire gradient with warm ambient glow.'
        },

        // --- CATEGORY 4: STRIPED PATTERNS (16 STYLES) ---
        {
            id: 'candy-stripe',
            name: 'Barber Stripe',
            category: 'Striped Patterns',
            trackColor: '#e5e7eb',
            fillColor: 'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 10px, #60a5fa 10px, #60a5fa 20px)',
            radius: 'rounded',
            height: 18,
            showLabel: 'none',
            labelColor: '#ffffff',
            description: 'Classic diagonal striped athletic indicator with high visual contrast in bright blue.'
        },
        {
            id: 'hazard-stripe',
            name: 'Caution Hazard',
            category: 'Striped Patterns',
            trackColor: '#262626',
            fillColor: 'repeating-linear-gradient(45deg, #eab308, #eab308 10px, #ca8a04 10px, #ca8a04 20px)',
            radius: 'subtle',
            height: 18,
            showLabel: 'right',
            labelColor: '#a16207',
            border: '1px solid #ca8a04',
            description: 'High-visibility safety and hazard striped construction indicator in vivid amber.'
        },
        {
            id: 'zebra-amber',
            name: 'Safety Warning Stripe',
            category: 'Striped Patterns',
            trackColor: '#1c1917',
            fillColor: 'repeating-linear-gradient(45deg, #f97316, #f97316 10px, #ea580c 10px, #ea580c 20px)',
            radius: 'rounded',
            height: 26,
            showLabel: 'right',
            labelColor: '#c2410c',
            border: '2px solid #ea580c',
            description: '26px bold diagonal warning stripe bar with safety orange pattern.'
        },
        {
            id: 'carbon-fiber-tech',
            name: 'Carbon Fiber & Cobalt',
            category: 'Striped Patterns',
            trackColor: '#111827',
            fillColor: 'repeating-linear-gradient(45deg, #1d4ed8, #1d4ed8 8px, #2563eb 8px, #2563eb 16px)',
            radius: 'subtle',
            height: 22,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '1px solid #374151',
            description: 'Carbon texture styling with cobalt diagonal weave pattern.'
        },
        {
            id: 'emerald-hazard-stripe',
            name: 'Emerald Biohazard Stripe',
            category: 'Striped Patterns',
            trackColor: '#064e3b',
            fillColor: 'repeating-linear-gradient(45deg, #10b981, #10b981 10px, #059669 10px, #059669 20px)',
            radius: 'rounded',
            height: 24,
            showLabel: 'right',
            labelColor: '#047857',
            border: '1px solid #10b981',
            description: 'Vibrant emerald green diagonal stripe with high-contrast biohazard aesthetic.'
        },
        {
            id: 'crimson-danger-stripe',
            name: 'Crimson Danger Stripe',
            category: 'Striped Patterns',
            trackColor: '#450a0a',
            fillColor: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #dc2626 10px, #dc2626 20px)',
            radius: 'rounded',
            height: 26,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '2px solid #b91c1c',
            glow: '0 0 10px rgba(239, 68, 68, 0.4)',
            description: '26px high-alert crimson red diagonal stripe bar with inside percentage label.'
        },
        {
            id: 'neon-magenta-stripe',
            name: 'Synthwave Magenta Stripe',
            category: 'Striped Patterns',
            trackColor: '#180828',
            fillColor: 'repeating-linear-gradient(45deg, #ec4899, #ec4899 10px, #db2777 10px, #db2777 20px)',
            radius: 'rounded',
            height: 20,
            showLabel: 'right',
            labelColor: '#db2777',
            glow: '0 0 10px rgba(236, 72, 153, 0.5)',
            description: 'Electric neon pink and magenta diagonal stripe with vibrant cyberpunk ambient glow.'
        },
        {
            id: 'amethyst-royal-stripe',
            name: 'Royal Violet Stripe',
            category: 'Striped Patterns',
            trackColor: '#1e1035',
            fillColor: 'repeating-linear-gradient(45deg, #8b5cf6, #8b5cf6 10px, #7c3aed 10px, #7c3aed 20px)',
            radius: 'rounded',
            height: 22,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '1px solid #7c3aed',
            description: 'Regal deep violet and lavender diagonal striped indicator bar.'
        },
        {
            id: 'electric-cyan-stripe',
            name: 'Electric Cyan Stripe',
            category: 'Striped Patterns',
            trackColor: '#082f49',
            fillColor: 'repeating-linear-gradient(45deg, #06b6d4, #06b6d4 10px, #0891b2 10px, #0891b2 20px)',
            radius: 'subtle',
            height: 18,
            showLabel: 'right',
            labelColor: '#0284c7',
            border: '1px solid #06b6d4',
            description: 'High-tech vivid aqua cyan diagonal stripe with deep marine track.'
        },
        {
            id: 'hi-vis-lime-stripe',
            name: 'Hi-Vis Acid Lime Stripe',
            category: 'Striped Patterns',
            trackColor: '#1a2e05',
            fillColor: 'repeating-linear-gradient(45deg, #84cc16, #84cc16 10px, #65a30d 10px, #65a30d 20px)',
            radius: 'rounded',
            height: 24,
            showLabel: 'right',
            labelColor: '#4d7c0f',
            border: '1px solid #84cc16',
            description: 'Ultra high-visibility reflective acid lime diagonal stripe bar.'
        },
        {
            id: 'rose-gold-stripe',
            name: 'Rose Gold Luxury Stripe',
            category: 'Striped Patterns',
            trackColor: '#2a1215',
            fillColor: 'repeating-linear-gradient(45deg, #fb7185, #fb7185 10px, #f43f5e 10px, #f43f5e 20px)',
            radius: 'full',
            height: 20,
            showLabel: 'right',
            labelColor: '#e11d48',
            border: '1px solid #fb7185',
            description: 'Sophisticated blush rose gold diagonal stripe with pill-shaped rounded ends.'
        },
        {
            id: 'monochrome-industrial-stripe',
            name: 'Monochrome Steel Stripe',
            category: 'Striped Patterns',
            trackColor: '#111827',
            fillColor: 'repeating-linear-gradient(45deg, #6b7280, #6b7280 10px, #4b5563 10px, #4b5563 20px)',
            radius: 'square',
            height: 22,
            showLabel: 'inside',
            labelColor: '#f3f4f6',
            border: '1px solid #4b5563',
            description: 'Stark industrial monochromatic grey steel diagonal stripe bar.'
        },
        {
            id: 'tangerine-burst-stripe',
            name: 'Tangerine Burst Stripe',
            category: 'Striped Patterns',
            trackColor: '#fff7ed',
            fillColor: 'repeating-linear-gradient(45deg, #fb923c, #fb923c 10px, #f97316 10px, #f97316 20px)',
            radius: 'rounded',
            height: 18,
            showLabel: 'right',
            labelColor: '#ea580c',
            border: '1px solid #fed7aa',
            description: 'Warm citrus tangerine and cream diagonal stripe for friendly modern CVs.'
        },
        {
            id: 'arctic-ice-stripe',
            name: 'Arctic Glacier Stripe',
            category: 'Striped Patterns',
            trackColor: '#f0fdfa',
            fillColor: 'repeating-linear-gradient(45deg, #38bdf8, #38bdf8 10px, #0ea5e9 10px, #0ea5e9 20px)',
            radius: 'subtle',
            height: 20,
            showLabel: 'right',
            labelColor: '#0369a1',
            border: '1px solid #bae6fd',
            description: 'Crisp arctic glacier blue diagonal stripe over light frosty track.'
        },
        {
            id: 'gold-patrol-stripe',
            name: 'Golden Sovereign Stripe',
            category: 'Striped Patterns',
            trackColor: '#1c1917',
            fillColor: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #d97706 10px, #d97706 20px)',
            radius: 'rounded',
            height: 28,
            showLabel: 'inside',
            labelColor: '#000000',
            border: '2px solid #b45309',
            glow: '0 0 10px rgba(245, 158, 11, 0.4)',
            description: '28px prestigious gold and amber diagonal stripe banner with dark inset label.'
        },
        {
            id: 'obsidian-white-stripe',
            name: 'Obsidian Crosswalk Stripe',
            category: 'Striped Patterns',
            trackColor: '#09090b',
            fillColor: 'repeating-linear-gradient(45deg, #fafafa, #fafafa 10px, #d4d4d8 10px, #d4d4d8 20px)',
            radius: 'square',
            height: 26,
            showLabel: 'inside',
            labelColor: '#09090b',
            border: '2px solid #52525b',
            description: '26px high-contrast black and white crosswalk diagonal stripe for architectural reports.'
        },

        // --- CATEGORY 5: SPECIALTY & SEGMENTED (12 STYLES) ---
        {
            id: 'segmented-pips',
            name: '10-Pip Rating Blocks',
            category: 'Specialty',
            trackColor: '#1e293b',
            fillColor: '#10b981',
            radius: 'subtle',
            height: 16,
            showLabel: 'right',
            labelColor: '#1e293b',
            pips: 10,
            description: '10 discrete rating blocks with 3px gaps, perfect for 1 to 10 skill ratings.'
        },
        {
            id: '5-segment-gauge',
            name: '5-Star Rating Blocks',
            category: 'Specialty',
            trackColor: '#334155',
            fillColor: '#eab308',
            radius: 'rounded',
            height: 18,
            pips: 5,
            showLabel: 'right',
            labelColor: '#854d0e',
            description: '5 discrete star-scale blocks for 1 to 5 CV competency ratings.'
        },
        {
            id: 'floating-badge',
            name: 'Hovering Pin Badge',
            category: 'Specialty',
            trackColor: '#cbd5e1',
            fillColor: '#3b82f6',
            radius: 'full',
            height: 14,
            showLabel: 'floating',
            labelColor: '#ffffff',
            description: 'Displays a floating pin badge bubble pointing directly at current percentage.'
        },
        {
            id: 'terminal-matrix',
            name: 'Terminal Matrix',
            category: 'Specialty',
            trackColor: '#052e16',
            fillColor: '#22c55e',
            radius: 'square',
            height: 16,
            showLabel: 'inside',
            labelColor: '#052e16',
            border: '1px solid #16a34a',
            description: 'Code-editor terminal style with stark high-contrast matrix green.'
        },
        {
            id: '4-segment-milestone',
            name: '4-Quarter Milestones',
            category: 'Specialty',
            trackColor: '#1e293b',
            fillColor: '#38bdf8',
            radius: 'subtle',
            height: 20,
            pips: 4,
            showLabel: 'right',
            labelColor: '#0284c7',
            description: '4 discrete milestone blocks representing quarterly progress (Q1 to Q4).'
        },
        {
            id: '8-pip-level',
            name: '8-Pip Competency Scale',
            category: 'Specialty',
            trackColor: '#0f172a',
            fillColor: '#8b5cf6',
            radius: 'subtle',
            height: 16,
            pips: 8,
            showLabel: 'right',
            labelColor: '#6d28d9',
            description: '8-step modular competency blocks with purple violet fill.'
        },
        {
            id: 'battery-cell',
            name: 'Lithium Battery Cell',
            category: 'Specialty',
            trackColor: '#18181b',
            fillColor: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
            radius: 'subtle',
            height: 28,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '3px solid #3f3f46',
            description: '28px battery gauge with metallic border and energetic green charge level.'
        },
        {
            id: 'arcade-pixel-life',
            name: 'Arcade Health Bar',
            category: 'Specialty',
            trackColor: '#450a0a',
            fillColor: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
            radius: 'square',
            height: 32,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '3px solid #7f1d1d',
            glow: '0 0 8px rgba(220, 38, 38, 0.7)',
            description: '32px retro video game health gauge with glowing crimson fill and bold percentage.'
        },
        {
            id: 'rainbow-spectrum',
            name: 'Rainbow Prism Spectrum',
            category: 'Specialty',
            trackColor: '#1e1e1e',
            fillColor: 'linear-gradient(90deg, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #06b6d4 80%, #a855f7 100%)',
            radius: 'full',
            height: 18,
            showLabel: 'right',
            labelColor: '#3b82f6',
            description: 'Full rainbow color spectrum flowing through red, orange, yellow, green, cyan, and violet.'
        },
        {
            id: 'speedometer-redline',
            name: 'Tachometer Redline',
            category: 'Specialty',
            trackColor: '#171717',
            fillColor: 'linear-gradient(90deg, #22c55e 0%, #eab308 65%, #ef4444 85%, #dc2626 100%)',
            radius: 'rounded',
            height: 26,
            showLabel: 'inside',
            labelColor: '#ffffff',
            border: '2px solid #404040',
            description: 'Automotive dashboard rev gauge transitioning from green to yellow into redline.'
        },
        {
            id: 'glassmorphism-frost',
            name: 'Frosted Glassmorphism',
            category: 'Specialty',
            trackColor: 'rgba(255, 255, 255, 0.15)',
            fillColor: 'linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.9) 100%)',
            radius: 'rounded',
            height: 26,
            showLabel: 'inside',
            labelColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            glow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            description: 'Semi-transparent frosted glass design with clean modern translucency.'
        },
        {
            id: 'golden-crest-grand',
            name: 'Grand Luxury Gold Banner',
            category: 'Specialty',
            trackColor: '#0c0a09',
            fillColor: 'linear-gradient(90deg, #92400e 0%, #d97706 35%, #fbbf24 70%, #fef08a 100%)',
            radius: 'rounded',
            height: 42,
            showLabel: 'inside',
            labelColor: '#0c0a09',
            border: '3px solid #d97706',
            glow: '0 0 14px rgba(217, 119, 6, 0.6)',
            description: '42px massive luxury gold banner with polished bevel gradient and dark inset text.'
        }
    ];

    // Helper: Map radius key to CSS value
    function getRadiusCSS(radiusKey) {
        switch (radiusKey) {
            case 'full': return '9999px';
            case 'rounded': return '8px';
            case 'subtle': return '4px';
            case 'square': return '0px';
            default: return radiusKey || '9999px';
        }
    }

    // Helper: Find style preset by ID
    function getStyleById(id) {
        return PROGRESS_BAR_STYLES.find(s => s.id === id) || PROGRESS_BAR_STYLES[0];
    }

    // --- HTML2CANVAS & PRINT STRIPE PATTERN ENGINE ---
    const stripePatternCache = {};

    function parseStripeGradient(gradientStr) {
        if (!gradientStr || typeof gradientStr !== 'string') return null;
        if (!gradientStr.includes('repeating-linear-gradient')) return null;

        const colorRegex = /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)/g;
        const matches = gradientStr.match(colorRegex) || [];
        const validColors = [];
        for (let i = 0; i < matches.length; i++) {
            const m = matches[i];
            if (!['repeating', 'linear', 'gradient', 'deg', 'px'].includes(m.toLowerCase())) {
                if (!validColors.includes(m)) validColors.push(m);
            }
        }
        if (validColors.length === 0) return null;
        const c1 = validColors[0];
        const c2 = validColors[1] || validColors[0];

        const numMatch = gradientStr.match(/(\d+(?:\.\d+)?)\s*px/);
        const stripeWidth = numMatch ? Math.max(4, Math.round(parseFloat(numMatch[1]))) : 10;

        return { c1, c2, stripeWidth };
    }

    function createStripePatternDataURL(color1, color2, stripeWidth = 10) {
        const key = `${color1}_${color2}_${stripeWidth}`;
        if (stripePatternCache[key]) return stripePatternCache[key];

        if (typeof document === 'undefined') return '';

        // In 45-degree diagonal stripes, the period along the gradient line is 2 * stripeWidth.
        // Along the horizontal and vertical axes, the period is W = Math.round(stripeWidth * Math.SQRT2).
        // A periodic tile of size S x S (where S = 2 * W) tiles seamlessly in both X and Y with zero distortion.
        const W = Math.max(4, Math.round(stripeWidth * Math.SQRT2));
        const S = W * 2;
        const cvs = document.createElement('canvas');
        cvs.width = S;
        cvs.height = S;
        const ctx = cvs.getContext('2d');
        if (!ctx) return '';

        // Fill background color (color1)
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, S, S);

        // Fill 45-degree diagonal stripes (color2)
        ctx.fillStyle = color2;

        // Region A: Center band running from (0,0) down-right to (S, S)
        // Vertices: (0, 0) -> (W, 0) -> (S, S - W) -> (S, S)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(S, S - W);
        ctx.lineTo(S, S);
        ctx.closePath();
        ctx.fill();

        // Region B: Top-left corner triangle (which seamlessly connects with bottom-right corner across tile boundaries)
        // Vertices: (0, W) -> (0, S) -> (S - W, S)
        ctx.beginPath();
        ctx.moveTo(0, W);
        ctx.lineTo(0, S);
        ctx.lineTo(S - W, S);
        ctx.closePath();
        ctx.fill();

        try {
            const dataUrl = cvs.toDataURL('image/png');
            stripePatternCache[key] = dataUrl;
            return dataUrl;
        } catch (e) {
            return '';
        }
    }

    // --- 2. HTML RENDERING ENGINE ---
    /**
     * Builds inner HTML for .element-content representing the progress bar widget.
     * Guarantees exact WYSIWYG colors for print engines via inline print-color-adjust.
     */
    function renderWidgetHTML(config) {
        const pct = Math.max(0, Math.min(100, Math.round(Number(config.percentage ?? 75))));
        const styleId = config.styleId || 'capsule-green';
        const preset = getStyleById(styleId);

        const trackColor = config.trackColor || preset.trackColor;
        const fillColor = config.fillColor || preset.fillColor;
        const radiusKey = config.radius || preset.radius || 'full';
        const radiusCSS = getRadiusCSS(radiusKey);
        const barHeight = Math.max(4, Math.min(80, Number(config.height || preset.height || 16)));
        const showLabel = config.showLabel !== undefined ? config.showLabel : (preset.showLabel || 'none');
        const labelColor = config.labelColor || preset.labelColor || '#ffffff';
        const border = config.border || preset.border || 'none';
        const glow = config.glow || preset.glow || 'none';
        const pipCount = preset.pips || (config.isSegmented ? 10 : 0);
        const isSegmented = pipCount > 0;

        // Dynamic handle and inside label typography scaling for thicker bars
        const handleSize = Math.max(14, Math.min(Math.round(barHeight * 0.8), 26));
        const handleOffset = Math.round(handleSize / 2);
        const insideFontSize = barHeight >= 36 ? '14px' : (barHeight >= 24 ? '12px' : '11px');

        // Print fidelity styling
        const printAdjust = '-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;';

        let innerContent = '';

        // Resolve print-safe and export-safe background for repeating linear gradients (html2canvas compatibility)
        let fillStyle = '';
        if (fillColor && typeof fillColor === 'string' && fillColor.includes('repeating-linear-gradient')) {
            const parsed = parseStripeGradient(fillColor);
            if (parsed) {
                const stripePng = createStripePatternDataURL(parsed.c1, parsed.c2, parsed.stripeWidth);
                if (stripePng) {
                    fillStyle = `background-image: url(${stripePng}); background-repeat: repeat; background-color: ${parsed.c1};`;
                } else {
                    fillStyle = `background: ${fillColor};`;
                }
            } else {
                fillStyle = `background: ${fillColor};`;
            }
        } else {
            fillStyle = `background: ${fillColor};`;
        }

        if (isSegmented) {
            // Discrete rating pips
            let pipsHTML = '';
            const totalPips = pipCount;
            for (let i = 0; i < totalPips; i++) {
                const pipStep = 100 / totalPips;
                const pipThreshold = (i + 1) * pipStep;
                const isFilled = pct >= pipThreshold;
                const isPartial = !isFilled && (pct > i * pipStep);
                
                let pipBg = 'rgba(255,255,255,0.08)';
                let pipExtraStyle = '';
                if (isFilled) {
                    if (fillColor && fillColor.includes('repeating-linear-gradient')) {
                        const parsed = parseStripeGradient(fillColor);
                        if (parsed) {
                            const stripePng = createStripePatternDataURL(parsed.c1, parsed.c2, parsed.stripeWidth);
                            pipExtraStyle = `background-image: url(${stripePng}); background-repeat: repeat; background-color: ${parsed.c1};`;
                        } else {
                            pipBg = fillColor;
                        }
                    } else {
                        pipBg = fillColor;
                    }
                } else if (isPartial) {
                    const partialRatio = ((pct - (i * pipStep)) / pipStep) * 100;
                    pipBg = `linear-gradient(to right, ${fillColor} ${partialRatio}%, rgba(255,255,255,0.08) ${partialRatio}%)`;
                }

                pipsHTML += `
                    <div class="pb-pip" style="flex: 1; height: 100%; background: ${pipBg}; ${pipExtraStyle} border-radius: ${radiusKey === 'square' ? '0px' : '2px'}; margin-right: ${i === totalPips - 1 ? '0' : '3px'}; transition: background 0.1s ease; ${printAdjust}"></div>
                `;
            }

            innerContent = `
                <div class="pb-track pb-track-segmented" style="flex: 1; height: ${barHeight}px; background: ${trackColor}; border-radius: ${radiusCSS}; border: ${border}; display: flex; padding: 2px; box-sizing: border-box; overflow: hidden; position: relative; cursor: pointer; ${printAdjust}">
                    ${pipsHTML}
                    <div class="pb-drag-handle no-print" style="position: absolute; left: calc(${pct}% - ${handleOffset}px); top: 50%; transform: translateY(-50%); width: ${handleSize}px; height: ${handleSize}px; border-radius: 50%; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.4); border: 2px solid ${trackColor}; cursor: ew-resize; pointer-events: auto; z-index: 5;"></div>
                </div>
            `;
        } else {
            // Continuous progress bar
            const glowCSS = glow !== 'none' ? `box-shadow: ${glow};` : '';
            const borderCSS = border !== 'none' ? `border: ${border};` : '';

            // Handle inside label
            let insideLabelHTML = '';
            if (showLabel === 'inside' && pct >= 12) {
                insideLabelHTML = `
                    <span class="pb-label-inside" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: ${labelColor}; font-size: ${insideFontSize}; font-weight: 700; font-family: Segoe UI, sans-serif; white-space: nowrap; pointer-events: none; line-height: 1;">${pct}%</span>
                `;
            }

            // Handle floating pin badge
            let floatingBadgeHTML = '';
            if (showLabel === 'floating') {
                floatingBadgeHTML = `
                    <div class="pb-floating-badge" style="position: absolute; left: ${pct}%; bottom: calc(100% + 6px); transform: translateX(-50%); background: #1e293b; color: ${labelColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; font-family: Segoe UI, sans-serif; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3); pointer-events: none; ${printAdjust}">
                        ${pct}%
                        <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #1e293b;"></div>
                    </div>
                `;
            }

            innerContent = `
                <div class="pb-track" style="flex: 1; height: ${barHeight}px; background: ${trackColor}; border-radius: ${radiusCSS}; ${borderCSS} position: relative; overflow: visible; box-sizing: border-box; cursor: pointer; ${printAdjust}">
                    <div class="pb-fill" style="width: ${pct}%; height: 100%; ${fillStyle} border-radius: ${radiusCSS}; position: relative; transition: width 0.05s ease-out; ${glowCSS} ${printAdjust}">
                        ${insideLabelHTML}
                    </div>
                    <div class="pb-drag-handle no-print" title="Drag to adjust (0-100%) or scroll with mousewheel" style="position: absolute; left: calc(${pct}% - ${handleOffset}px); top: 50%; transform: translateY(-50%); width: ${handleSize}px; height: ${handleSize}px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.45); border: 2px solid ${trackColor}; cursor: ew-resize; pointer-events: auto; z-index: 5; transition: left 0.05s ease-out;"></div>
                    ${floatingBadgeHTML}
                </div>
            `;
        }

        // Handle right side label
        let rightLabelHTML = '';
        if (showLabel === 'right') {
            rightLabelHTML = `
                <span class="pb-label-right" style="margin-left: 10px; color: ${labelColor}; font-size: 12px; font-weight: 700; font-family: Segoe UI, sans-serif; white-space: nowrap; line-height: 1; user-select: none; ${printAdjust}">${pct}%</span>
            `;
        }

        return `
            <div class="progress-bar-widget" style="width: 100%; height: 100%; display: flex; align-items: center; position: relative; box-sizing: border-box; user-select: none;">
                ${innerContent}
                ${rightLabelHTML}
            </div>
        `;
    }

    // --- 3. PROGRESS BAR ELEMENT LIFECYCLE ---
    const ProgressBarEngine = {
        styles: PROGRESS_BAR_STYLES,
        renderWidgetHTML: renderWidgetHTML,
        parseStripeGradient: parseStripeGradient,
        createStripePatternDataURL: createStripePatternDataURL,

        /**
         * Inserts a new Progress Bar onto the canvas.
         */
        insertProgressBar: function(styleId = 'capsule-green', options = {}) {
            const preset = getStyleById(styleId);
            const pct = options.percentage !== undefined ? options.percentage : 75;
            const barHeight = options.height || preset.height || 16;
            const widgetHeight = Math.max(barHeight + 14, 28);
            const widgetWidth = options.width || (barHeight >= 30 ? 320 : 280);

            const config = {
                percentage: pct,
                styleId: styleId,
                fillColor: options.fillColor || preset.fillColor,
                trackColor: options.trackColor || preset.trackColor,
                radius: options.radius || preset.radius,
                height: barHeight,
                showLabel: options.showLabel !== undefined ? options.showLabel : preset.showLabel,
                labelColor: options.labelColor || preset.labelColor,
                border: options.border || preset.border,
                glow: options.glow || preset.glow,
                isSegmented: (preset.pips || 0) > 0
            };

            const html = renderWidgetHTML(config);

            const createFn = (typeof createWrapper === 'function') ? createWrapper : ((typeof window.createWrapper === 'function') ? window.createWrapper : null);
            if (!createFn) {
                console.error('[ProgressBarEngine] createWrapper is not available.');
                return null;
            }

            const el = createFn(html);
            if (!el) return null;

            // Size element cleanly
            el.style.width = widgetWidth + 'px';
            el.style.height = widgetHeight + 'px';

            // Set configuration attributes on .pub-element
            el.setAttribute('data-type', 'progress-bar');
            el.setAttribute('data-pb-percentage', String(config.percentage));
            el.setAttribute('data-pb-style', config.styleId);
            el.setAttribute('data-pb-fill', config.fillColor);
            el.setAttribute('data-pb-track', config.trackColor);
            el.setAttribute('data-pb-radius', config.radius);
            el.setAttribute('data-pb-height', String(config.height));
            el.setAttribute('data-pb-show-label', String(config.showLabel));
            el.setAttribute('data-pb-label-color', config.labelColor);
            if (config.border) el.setAttribute('data-pb-border', config.border);
            if (config.glow) el.setAttribute('data-pb-glow', config.glow);

            this.initElement(el);
            this.showToolbar(el);

            if (typeof window.ContextRibbonSystem !== 'undefined' && typeof window.ContextRibbonSystem.updateTabs === 'function') {
                window.ContextRibbonSystem.updateTabs(el);
            }

            if (typeof window.pushHistory === 'function') window.pushHistory();
            if (typeof window.updateThumbnails === 'function') window.updateThumbnails();

            return el;
        },

        /**
         * Re-attaches event listeners to an existing or deserialized progress bar element.
         */
        initElement: function(el) {
            if (!el) return;
            const widget = el.querySelector('.progress-bar-widget');
            if (!widget) return;

            // Prevent duplicate initialization
            if (el._pbInitialized) return;
            el._pbInitialized = true;

            // Bind Dragging on Track & Handle
            this.bindDragInteraction(el);

            // Bind Scrollwheel Adjustment
            this.bindScrollInteraction(el);

            // Double click opens the designer modal
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.showModal(el);
            });
        },

        /**
         * Refreshes widget HTML from its data attributes (e.g. after resize or style tweak).
         */
        refreshElement: function(el) {
            if (!el || el.getAttribute('data-type') !== 'progress-bar') return;
            const content = el.querySelector('.element-content');
            if (!content) return;

            const config = {
                percentage: parseFloat(el.getAttribute('data-pb-percentage') || 75),
                styleId: el.getAttribute('data-pb-style') || 'capsule-green',
                fillColor: el.getAttribute('data-pb-fill') || '#22c55e',
                trackColor: el.getAttribute('data-pb-track') || '#1e293b',
                radius: el.getAttribute('data-pb-radius') || 'full',
                height: parseFloat(el.getAttribute('data-pb-height') || 16),
                showLabel: el.getAttribute('data-pb-show-label') || 'none',
                labelColor: el.getAttribute('data-pb-label-color') || '#ffffff',
                border: el.getAttribute('data-pb-border') || 'none',
                glow: el.getAttribute('data-pb-glow') || 'none'
            };

            // Container height check: ensure container is at least bar height + 14px or 28px
            const minH = Math.max(config.height + 14, 28);
            const currentH = parseFloat(el.style.height || el.offsetHeight || 0);
            if (currentH < minH) {
                el.style.height = minH + 'px';
            }

            content.innerHTML = renderWidgetHTML(config);
            el._pbInitialized = false;
            this.initElement(el);

            // Update floating toolbar if this element is currently selected
            if (typeof state !== 'undefined' && state.selectedEl === el) {
                this.updateToolbarValues(el);
            }
        },

        /**
         * Updates the percentage of a progress bar in real-time.
         */
        setPercentage: function(el, percentage, skipHistory = false) {
            if (!el) return;
            const pct = Math.max(0, Math.min(100, Math.round(Number(percentage))));
            el.setAttribute('data-pb-percentage', String(pct));

            // Fast in-place DOM update for optimal 60fps responsiveness during drag
            const track = el.querySelector('.pb-track');
            const fill = el.querySelector('.pb-fill');
            const handle = el.querySelector('.pb-drag-handle');
            const insideLabel = el.querySelector('.pb-label-inside');
            const rightLabel = el.querySelector('.pb-label-right');
            const floatingBadge = el.querySelector('.pb-floating-badge');

            const barHeight = parseFloat(el.getAttribute('data-pb-height') || 16);
            const handleSize = Math.max(14, Math.min(Math.round(barHeight * 0.8), 26));
            const handleOffset = Math.round(handleSize / 2);

            if (fill) fill.style.width = pct + '%';
            if (handle) handle.style.left = `calc(${pct}% - ${handleOffset}px)`;
            if (insideLabel) {
                insideLabel.innerText = pct + '%';
                insideLabel.style.display = pct >= 12 ? 'block' : 'none';
            }
            if (rightLabel) rightLabel.innerText = pct + '%';
            if (floatingBadge) {
                floatingBadge.innerHTML = `
                    ${pct}%
                    <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #1e293b;"></div>
                `;
                floatingBadge.style.left = pct + '%';
            }

            // If segmented, update the individual pips
            const pips = el.querySelectorAll('.pb-pip');
            if (pips && pips.length > 0) {
                const totalPips = pips.length;
                const fillColor = el.getAttribute('data-pb-fill') || '#10b981';
                pips.forEach((pip, i) => {
                    const step = 100 / totalPips;
                    const threshold = (i + 1) * step;
                    if (pct >= threshold) {
                        pip.style.background = fillColor;
                    } else if (pct > i * step) {
                        const ratio = ((pct - (i * step)) / step) * 100;
                        pip.style.background = `linear-gradient(to right, ${fillColor} ${ratio}%, rgba(255,255,255,0.08) ${ratio}%)`;
                    } else {
                        pip.style.background = 'rgba(255,255,255,0.08)';
                    }
                });
            }

            // Update floating toolbar inputs
            this.updateToolbarValues(el);

            if (!skipHistory) {
                if (typeof window.pushHistory === 'function') window.pushHistory();
                if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
            }
        },

        // --- 4. INTERACTION BINDINGS ---
        /**
         * Allows direct clicking and dragging on the track or handle to change percentage.
         */
        bindDragInteraction: function(el) {
            const track = el.querySelector('.pb-track');
            if (!track) return;

            let isDragging = false;

            const onMouseDown = (e) => {
                // Ignore right clicks or secondary buttons
                if (e.button !== 0) return;

                // Auto-select element if not already selected
                if (typeof window.selectElement === 'function' && (!window.state || window.state.selectedEl !== el)) {
                    window.selectElement(el);
                }

                isDragging = true;
                e.preventDefault();
                e.stopPropagation();

                const updateFromMouse = (moveEvent) => {
                    const rect = track.getBoundingClientRect();
                    if (rect.width <= 0) return;
                    const clientX = moveEvent.clientX;
                    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
                    const newPct = Math.round((offsetX / rect.width) * 100);
                    ProgressBarEngine.setPercentage(el, newPct, true);
                };

                updateFromMouse(e);

                const onMouseMove = (moveEvent) => {
                    if (!isDragging) return;
                    moveEvent.preventDefault();
                    updateFromMouse(moveEvent);
                };

                const onMouseUp = () => {
                    if (isDragging) {
                        isDragging = false;
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                        if (typeof window.pushHistory === 'function') window.pushHistory();
                        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
                    }
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            };

            track.addEventListener('mousedown', onMouseDown);
        },

        /**
         * Mousewheel scrollwheel adjustment: scrolling over the bar increments/decrements percentage.
         */
        bindScrollInteraction: function(el) {
            const widget = el.querySelector('.progress-bar-widget');
            if (!widget) return;

            let wheelDebounceTimer = null;

            widget.addEventListener('wheel', (e) => {
                // Only scroll when element is selected or hovered
                if (typeof window.state !== 'undefined' && window.state.selectedEl !== el) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                const step = e.shiftKey ? 5 : 1;
                const delta = e.deltaY < 0 ? step : -step;
                const curPct = parseFloat(el.getAttribute('data-pb-percentage') || 75);
                const newPct = Math.max(0, Math.min(100, curPct + delta));

                ProgressBarEngine.setPercentage(el, newPct, true);

                if (wheelDebounceTimer) clearTimeout(wheelDebounceTimer);
                wheelDebounceTimer = setTimeout(() => {
                    if (typeof window.pushHistory === 'function') window.pushHistory();
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
                }, 250);
            }, { passive: false });
        },

        // --- 5. FLOATING QUICK CUSTOMIZER TOOLBAR ---
        _toolbarEl: null,

        getToolbar: function() {
            if (!this._toolbarEl) {
                this.createToolbar();
            }
            return this._toolbarEl;
        },

        createToolbar: function() {
            let tb = document.getElementById('pb-float-toolbar');
            if (!tb) {
                tb = document.createElement('div');
                tb.id = 'pb-float-toolbar';
                tb.className = 'no-print';
                tb.innerHTML = `
                    <div class="pb-tb-row">
                        <div class="pb-tb-grip" title="Drag to reposition toolbar"><i class="fas fa-grip-vertical"></i></div>
                        <div class="pb-tb-group">
                            <span class="pb-tb-label">Progress:</span>
                            <input type="range" min="0" max="100" class="pb-tb-slider" id="pb-tb-slider" title="Drag percentage">
                            <input type="number" min="0" max="100" class="pb-tb-num" id="pb-tb-num" title="Exact percentage">%
                        </div>
                        <div class="pb-tb-divider"></div>
                        <button class="pb-tb-btn" id="pb-tb-more-btn" title="Open Full Progress Bar Designer">
                            <i class="fas fa-sliders-h"></i> Designer
                        </button>
                    </div>
                    <div class="pb-tb-row">
                        <div class="pb-tb-group">
                            <div class="pb-tb-select-wrap" title="Switch Progress Bar Style">
                                <select class="pb-tb-select" id="pb-tb-style">
                                    ${(() => {
                                        const cats = ['CV & Skills', 'Corporate & Minimal', 'Vibrant & Modern', 'Striped Patterns', 'Specialty'];
                                        return cats.map(cat => {
                                            const items = PROGRESS_BAR_STYLES.filter(s => s.category === cat);
                                            if (!items.length) return '';
                                            return `<optgroup label="${cat}">${items.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</optgroup>`;
                                        }).join('');
                                    })()}
                                </select>
                                <div class="pb-tb-select-arrow"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        <div class="pb-tb-divider"></div>
                        <div class="pb-tb-group">
                            <div class="pb-tb-swatch-btn" id="pb-tb-fill-swatch" title="Fill Color">
                                <span class="pb-tb-swatch-box" id="pb-tb-fill-box"></span>
                                <span class="pb-tb-swatch-text">Fill</span>
                            </div>
                            <div class="pb-tb-swatch-btn" id="pb-tb-track-swatch" title="Track (Background) Color">
                                <span class="pb-tb-swatch-box" id="pb-tb-track-box"></span>
                                <span class="pb-tb-swatch-text">Track</span>
                            </div>
                        </div>
                        <div class="pb-tb-divider"></div>
                        <div class="pb-tb-group">
                            <div class="pb-tb-select-wrap" title="Percentage Label Display">
                                <select class="pb-tb-select" id="pb-tb-label-mode">
                                    <option value="none">No Label</option>
                                    <option value="right">Right Side</option>
                                    <option value="inside">Inside Bar</option>
                                    <option value="floating">Floating Pin</option>
                                </select>
                                <div class="pb-tb-select-arrow"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(tb);

                // Prevent toolbar mousedown from deselecting canvas items
                tb.addEventListener('mousedown', (e) => {
                    if (!e.target.closest('.pb-tb-grip')) {
                        e.stopPropagation();
                    }
                });

                // Setup Draggable Toolbar
                this.makeToolbarDraggable(tb);

                const getTargetEl = () => {
                    const st = (typeof state !== 'undefined' && state) ? state : (window.state || null);
                    if (st && st.selectedEl && st.selectedEl.getAttribute('data-type') === 'progress-bar') {
                        return st.selectedEl;
                    }
                    return tb._targetEl || null;
                };

                // Slider & Number change events
                const slider = tb.querySelector('#pb-tb-slider');
                const num = tb.querySelector('#pb-tb-num');
                const styleSelect = tb.querySelector('#pb-tb-style');
                const labelModeSelect = tb.querySelector('#pb-tb-label-mode');
                const fillSwatch = tb.querySelector('#pb-tb-fill-swatch');
                const trackSwatch = tb.querySelector('#pb-tb-track-swatch');
                const moreBtn = tb.querySelector('#pb-tb-more-btn');

                slider.addEventListener('input', () => {
                    const el = getTargetEl();
                    if (el) {
                        ProgressBarEngine.setPercentage(el, slider.value, true);
                    }
                });
                slider.addEventListener('change', () => {
                    if (typeof window.pushHistory === 'function') window.pushHistory();
                });

                num.addEventListener('input', () => {
                    const el = getTargetEl();
                    if (el) {
                        ProgressBarEngine.setPercentage(el, num.value, false);
                    }
                });

                styleSelect.addEventListener('change', () => {
                    const el = getTargetEl();
                    if (el) {
                        const preset = getStyleById(styleSelect.value);
                        el.setAttribute('data-pb-style', preset.id);
                        el.setAttribute('data-pb-fill', preset.fillColor);
                        el.setAttribute('data-pb-track', preset.trackColor);
                        el.setAttribute('data-pb-radius', preset.radius);
                        el.setAttribute('data-pb-height', String(preset.height));
                        el.setAttribute('data-pb-show-label', preset.showLabel);
                        el.setAttribute('data-pb-label-color', preset.labelColor);
                        if (preset.border) el.setAttribute('data-pb-border', preset.border);
                        else el.removeAttribute('data-pb-border');
                        if (preset.glow) el.setAttribute('data-pb-glow', preset.glow);
                        else el.removeAttribute('data-pb-glow');

                        ProgressBarEngine.refreshElement(el);
                        ProgressBarEngine.updateToolbarValues(el);
                        if (typeof window.pushHistory === 'function') window.pushHistory();
                    }
                });

                labelModeSelect.addEventListener('change', () => {
                    const el = getTargetEl();
                    if (el) {
                        el.setAttribute('data-pb-show-label', labelModeSelect.value);
                        ProgressBarEngine.refreshElement(el);
                        if (typeof window.pushHistory === 'function') window.pushHistory();
                    }
                });

                fillSwatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const el = getTargetEl();
                    if (!el) return;
                    const curColor = el.getAttribute('data-pb-fill') || '#22c55e';
                    if (window.CustomColorPicker) {
                        window.CustomColorPicker.open(fillSwatch, curColor, (chosenColor) => {
                            el.setAttribute('data-pb-fill', chosenColor);
                            ProgressBarEngine.refreshElement(el);
                            ProgressBarEngine.updateToolbarValues(el);
                            if (typeof window.pushHistory === 'function') window.pushHistory();
                        });
                    }
                });

                trackSwatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const el = getTargetEl();
                    if (!el) return;
                    const curColor = el.getAttribute('data-pb-track') || '#1e293b';
                    if (window.CustomColorPicker) {
                        window.CustomColorPicker.open(trackSwatch, curColor, (chosenColor) => {
                            el.setAttribute('data-pb-track', chosenColor);
                            ProgressBarEngine.refreshElement(el);
                            ProgressBarEngine.updateToolbarValues(el);
                            if (typeof window.pushHistory === 'function') window.pushHistory();
                        });
                    }
                });

                moreBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });

                moreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const el = getTargetEl();
                    ProgressBarEngine.showModal(el || null);
                });
            }
            this._toolbarEl = tb;
            return tb;
        },

        makeToolbarDraggable: function(tb) {
            const grip = tb.querySelector('.pb-tb-grip');
            if (!grip) return;

            let isDragging = false;
            let startX = 0, startY = 0, startLeft = 0, startTop = 0;

            grip.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(tb.style.left || '0', 10);
                startTop = parseInt(tb.style.top || '0', 10);
                e.preventDefault();
                e.stopPropagation();

                const onMove = (moveEvt) => {
                    if (!isDragging) return;
                    const dx = moveEvt.clientX - startX;
                    const dy = moveEvt.clientY - startY;
                    tb.style.left = (startLeft + dx) + 'px';
                    tb.style.top = (startTop + dy) + 'px';
                    tb._customPos = true;
                };

                const onUp = () => {
                    isDragging = false;
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };

                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
        },

        showToolbar: function(el) {
            if (!el) return;
            const pbEl = el.getAttribute('data-type') === 'progress-bar' ? el : el.closest('[data-type="progress-bar"]');
            if (!pbEl) return;
            const tb = this.getToolbar();
            if (!tb) return;

            tb._targetEl = pbEl;
            this.updateToolbarValues(pbEl);

            tb.style.display = 'flex';

            // Position toolbar directly above the element if no custom drag position
            if (!tb._customPos) {
                const rect = el.getBoundingClientRect();
                const tbHeight = 72;
                let top = rect.top - tbHeight - 10;
                if (top < 70) {
                    // Place below if too close to ribbon
                    top = rect.bottom + 10;
                }
                const left = Math.max(10, Math.min(window.innerWidth - 390, rect.left));
                tb.style.top = top + 'px';
                tb.style.left = left + 'px';
            }
        },

        hideToolbar: function() {
            if (this._toolbarEl) {
                this._toolbarEl.style.display = 'none';
                this._toolbarEl._customPos = false;
            }
        },

        updateToolbarValues: function(el) {
            if (!el || !this._toolbarEl) return;
            const tb = this._toolbarEl;
            const pct = parseFloat(el.getAttribute('data-pb-percentage') || 75);
            const styleId = el.getAttribute('data-pb-style') || 'capsule-green';
            const fillColor = el.getAttribute('data-pb-fill') || '#22c55e';
            const trackColor = el.getAttribute('data-pb-track') || '#1e293b';
            const labelMode = el.getAttribute('data-pb-show-label') || 'none';

            const slider = tb.querySelector('#pb-tb-slider');
            const num = tb.querySelector('#pb-tb-num');
            const styleSelect = tb.querySelector('#pb-tb-style');
            const labelModeSelect = tb.querySelector('#pb-tb-label-mode');
            const fillBox = tb.querySelector('#pb-tb-fill-box');
            const trackBox = tb.querySelector('#pb-tb-track-box');

            if (slider) slider.value = pct;
            if (num) num.value = pct;
            if (styleSelect) styleSelect.value = styleId;
            if (labelModeSelect) labelModeSelect.value = labelMode;
            if (fillBox) fillBox.style.background = fillColor;
            if (trackBox) trackBox.style.background = trackColor;
        },

        // --- 6. FULL PROGRESS BAR DESIGNER MODAL ---
        /**
         * Opens the comprehensive visual designer dialog.
         * If targetEl is provided, modifies that element. Otherwise inserts a new one.
         */
        showModal: function(targetEl = null) {
            const isEditing = targetEl !== null && targetEl.getAttribute('data-type') === 'progress-bar';

            // Initial state from targetEl or defaults
            let currentConfig = {
                percentage: isEditing ? parseFloat(targetEl.getAttribute('data-pb-percentage') || 75) : 80,
                styleId: isEditing ? (targetEl.getAttribute('data-pb-style') || 'capsule-green') : 'capsule-green',
                fillColor: isEditing ? (targetEl.getAttribute('data-pb-fill') || '#22c55e') : '#22c55e',
                trackColor: isEditing ? (targetEl.getAttribute('data-pb-track') || '#1e293b') : '#1e293b',
                radius: isEditing ? (targetEl.getAttribute('data-pb-radius') || 'full') : 'full',
                height: isEditing ? parseFloat(targetEl.getAttribute('data-pb-height') || 16) : 16,
                showLabel: isEditing ? (targetEl.getAttribute('data-pb-show-label') || 'none') : 'none',
                labelColor: isEditing ? (targetEl.getAttribute('data-pb-label-color') || '#ffffff') : '#ffffff'
            };

            const preset = getStyleById(currentConfig.styleId);
            if (!isEditing) {
                currentConfig.fillColor = preset.fillColor;
                currentConfig.trackColor = preset.trackColor;
                currentConfig.radius = preset.radius;
                currentConfig.height = preset.height;
                currentConfig.showLabel = preset.showLabel;
                currentConfig.labelColor = preset.labelColor;
            }

            // Generate HTML for style selection cards
            const styleCardsHTML = PROGRESS_BAR_STYLES.map(style => {
                const isSelected = style.id === currentConfig.styleId;
                const sampleHeight = Math.min(Math.max(Math.round((style.height || 16) * 0.7), 10), 22);
                const sampleHTML = renderWidgetHTML({
                    percentage: 75,
                    styleId: style.id,
                    fillColor: style.fillColor,
                    trackColor: style.trackColor,
                    radius: style.radius,
                    height: sampleHeight,
                    showLabel: 'none',
                    border: style.border,
                    glow: style.glow,
                    isSegmented: (style.pips || 0) > 0
                });

                return `
                    <div class="pb-card ${isSelected ? 'active' : ''}" data-style-id="${style.id}" title="${style.description}">
                        <div class="pb-card-header">
                            <span class="pb-card-title">${style.name}</span>
                            <span class="pb-card-badge">${style.category}</span>
                        </div>
                        <div class="pb-card-preview">
                            ${sampleHTML}
                        </div>
                    </div>
                `;
            }).join('');

            const modalContentHTML = `
                <div class="pb-designer-container">
                    <!-- Top: Interactive Live Preview -->
                    <div class="pb-preview-section">
                        <div class="pb-preview-header">
                            <span><i class="fas fa-eye"></i> Live Preview</span>
                            <span id="pb-modal-pct-display" style="font-weight: 700; color: var(--ui-theme-color, #007670);">${currentConfig.percentage}%</span>
                        </div>
                        <div class="pb-live-preview-box" id="pb-modal-preview-box">
                            ${renderWidgetHTML(currentConfig)}
                        </div>
                        <div class="pb-preview-slider-row">
                            <label><i class="fas fa-sliders-h"></i> Adjust Value:</label>
                            <input type="range" min="0" max="100" value="${currentConfig.percentage}" id="pb-modal-slider" class="pb-modal-range">
                            <input type="number" min="0" max="100" value="${currentConfig.percentage}" id="pb-modal-num" class="pb-modal-number"> %
                        </div>
                    </div>

                    <!-- Middle: Visual Style Gallery -->
                    <div class="pb-gallery-section">
                        <div class="pb-section-title">
                            <span><i class="fas fa-palette"></i> Select Style Preset (${PROGRESS_BAR_STYLES.length} Professional Styles)</span>
                            <span class="pb-hint">Click to select • Double-click to apply instantly</span>
                        </div>
                        <div class="pb-cards-grid" id="pb-cards-grid">
                            ${styleCardsHTML}
                        </div>
                    </div>

                    <!-- Bottom: Fine-Tuning Customizer Controls -->
                    <div class="pb-controls-section">
                        <div class="pb-control-col">
                            <label>Fill Color:</label>
                            <div class="pb-color-swatch-row" id="pb-modal-fill-row">
                                <span class="pb-modal-swatch" id="pb-modal-fill-swatch" style="background: ${currentConfig.fillColor};"></span>
                                <input type="text" id="pb-modal-fill-val" value="${currentConfig.fillColor}" class="pb-color-text" readonly>
                            </div>
                        </div>

                        <div class="pb-control-col">
                            <label>Track Background:</label>
                            <div class="pb-color-swatch-row" id="pb-modal-track-row">
                                <span class="pb-modal-swatch" id="pb-modal-track-swatch" style="background: ${currentConfig.trackColor};"></span>
                                <input type="text" id="pb-modal-track-val" value="${currentConfig.trackColor}" class="pb-color-text" readonly>
                            </div>
                        </div>

                        <div class="pb-control-col">
                            <label>Corner Radius:</label>
                            <select id="pb-modal-radius" class="pb-form-select">
                                <option value="full" ${currentConfig.radius === 'full' ? 'selected' : ''}>Full Capsule (Pill)</option>
                                <option value="rounded" ${currentConfig.radius === 'rounded' ? 'selected' : ''}>Rounded (8px)</option>
                                <option value="subtle" ${currentConfig.radius === 'subtle' ? 'selected' : ''}>Subtle (4px)</option>
                                <option value="square" ${currentConfig.radius === 'square' ? 'selected' : ''}>Square (0px)</option>
                            </select>
                        </div>

                        <div class="pb-control-col">
                            <label>Percentage Label:</label>
                            <select id="pb-modal-label-mode" class="pb-form-select">
                                <option value="none" ${currentConfig.showLabel === 'none' ? 'selected' : ''}>None</option>
                                <option value="right" ${currentConfig.showLabel === 'right' ? 'selected' : ''}>Right Side</option>
                                <option value="inside" ${currentConfig.showLabel === 'inside' ? 'selected' : ''}>Inside Bar</option>
                                <option value="floating" ${currentConfig.showLabel === 'floating' ? 'selected' : ''}>Floating Pin</option>
                            </select>
                        </div>

                        <div class="pb-control-col">
                            <label>Bar Thickness:</label>
                            <select id="pb-modal-height" class="pb-form-select">
                                <option value="6" ${currentConfig.height === 6 ? 'selected' : ''}>Hairline (6px)</option>
                                <option value="10" ${currentConfig.height === 10 ? 'selected' : ''}>Slim (10px)</option>
                                <option value="14" ${currentConfig.height === 14 ? 'selected' : ''}>Compact (14px)</option>
                                <option value="18" ${currentConfig.height === 18 ? 'selected' : ''}>Standard (18px)</option>
                                <option value="24" ${currentConfig.height === 24 ? 'selected' : ''}>Bold (24px)</option>
                                <option value="30" ${currentConfig.height === 30 ? 'selected' : ''}>Chunky (30px)</option>
                                <option value="36" ${currentConfig.height === 36 ? 'selected' : ''}>Heavy Industrial (36px)</option>
                                <option value="42" ${currentConfig.height === 42 ? 'selected' : ''}>Massive Block (42px)</option>
                                <option value="48" ${currentConfig.height === 48 ? 'selected' : ''}>Jumbo Banner (48px)</option>
                                <option value="56" ${currentConfig.height === 56 ? 'selected' : ''}>Super Monumental (56px)</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;

            const dialog = (typeof DialogSystem !== 'undefined') ? DialogSystem : ((typeof window.DialogSystem !== 'undefined') ? window.DialogSystem : null);
            if (!dialog) {
                console.error('[ProgressBarEngine] DialogSystem is not loaded.');
                return;
            }
            if (!document.getElementById('custom-dialog-overlay') && typeof dialog.init === 'function') {
                dialog.init();
            }

            const title = isEditing ? 'Edit Progress Bar' : 'Insert Progress Bar';
            const confirmBtnText = isEditing ? 'Apply Changes' : 'Insert Bar';

            dialog.show(title, modalContentHTML, () => {
                // Confirm action
                if (isEditing) {
                    targetEl.setAttribute('data-pb-percentage', String(currentConfig.percentage));
                    targetEl.setAttribute('data-pb-style', currentConfig.styleId);
                    targetEl.setAttribute('data-pb-fill', currentConfig.fillColor);
                    targetEl.setAttribute('data-pb-track', currentConfig.trackColor);
                    targetEl.setAttribute('data-pb-radius', currentConfig.radius);
                    targetEl.setAttribute('data-pb-height', String(currentConfig.height));
                    targetEl.setAttribute('data-pb-show-label', currentConfig.showLabel);
                    targetEl.setAttribute('data-pb-label-color', currentConfig.labelColor);
                    if (currentConfig.border) targetEl.setAttribute('data-pb-border', currentConfig.border);
                    else targetEl.removeAttribute('data-pb-border');
                    if (currentConfig.glow) targetEl.setAttribute('data-pb-glow', currentConfig.glow);
                    else targetEl.removeAttribute('data-pb-glow');

                    const minH = Math.max(currentConfig.height + 14, 28);
                    const curH = parseFloat(targetEl.style.height || targetEl.offsetHeight || 0);
                    if (curH < minH) {
                        targetEl.style.height = minH + 'px';
                    }

                    ProgressBarEngine.refreshElement(targetEl);
                    if (typeof window.pushHistory === 'function') window.pushHistory();
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
                } else {
                    ProgressBarEngine.insertProgressBar(currentConfig.styleId, currentConfig);
                }
            }, false, confirmBtnText);

            // Expand dialog box width for optimal comfortable design studio experience
            const dialogBox = document.getElementById('custom-dialog-box');
            if (dialogBox) {
                dialogBox.style.maxWidth = '780px';
                dialogBox.style.width = '94vw';
                dialogBox.classList.add('allow-overflow');
                dialogBox.style.overflow = 'visible';
            }

            // Wire up interactive modal events
            setTimeout(() => {
                const previewBox = document.getElementById('pb-modal-preview-box');
                const pctDisplay = document.getElementById('pb-modal-pct-display');
                const slider = document.getElementById('pb-modal-slider');
                const num = document.getElementById('pb-modal-num');
                const fillSwatch = document.getElementById('pb-modal-fill-swatch');
                const fillVal = document.getElementById('pb-modal-fill-val');
                const fillRow = document.getElementById('pb-modal-fill-row');
                const trackSwatch = document.getElementById('pb-modal-track-swatch');
                const trackVal = document.getElementById('pb-modal-track-val');
                const trackRow = document.getElementById('pb-modal-track-row');
                const radiusSelect = document.getElementById('pb-modal-radius');
                const labelModeSelect = document.getElementById('pb-modal-label-mode');
                const heightSelect = document.getElementById('pb-modal-height');
                const cardsGrid = document.getElementById('pb-cards-grid');

                function syncCustomDomSelect(sel) {
                    if (!sel) return;
                    const customSel = sel.nextElementSibling;
                    if (customSel && customSel.classList.contains('custom-dom-select')) {
                        const span = customSel.querySelector('span');
                        if (span && sel.selectedOptions && sel.selectedOptions[0]) {
                            span.innerText = sel.selectedOptions[0].text;
                        }
                    }
                }

                function updateLivePreview() {
                    if (previewBox) {
                        previewBox.innerHTML = renderWidgetHTML(currentConfig);
                    }
                    if (pctDisplay) {
                        pctDisplay.innerText = currentConfig.percentage + '%';
                    }
                    if (slider) slider.value = currentConfig.percentage;
                    if (num) num.value = currentConfig.percentage;
                    if (fillSwatch) fillSwatch.style.background = currentConfig.fillColor;
                    if (fillVal) fillVal.value = currentConfig.fillColor;
                    if (trackSwatch) trackSwatch.style.background = currentConfig.trackColor;
                    if (trackVal) trackVal.value = currentConfig.trackColor;
                    if (radiusSelect) {
                        radiusSelect.value = currentConfig.radius;
                        syncCustomDomSelect(radiusSelect);
                    }
                    if (labelModeSelect) {
                        labelModeSelect.value = currentConfig.showLabel;
                        syncCustomDomSelect(labelModeSelect);
                    }
                    if (heightSelect) {
                        const hVal = String(currentConfig.height);
                        let opt = heightSelect.querySelector(`option[value="${hVal}"]`);
                        if (!opt) {
                            opt = document.createElement('option');
                            opt.value = hVal;
                            opt.text = `${hVal}px (Preset)`;
                            heightSelect.appendChild(opt);
                        }
                        heightSelect.value = hVal;
                        syncCustomDomSelect(heightSelect);
                    }
                }

                if (slider) {
                    slider.addEventListener('input', () => {
                        currentConfig.percentage = parseInt(slider.value, 10);
                        updateLivePreview();
                    });
                }

                if (num) {
                    num.addEventListener('input', () => {
                        currentConfig.percentage = Math.max(0, Math.min(100, parseInt(num.value || 0, 10)));
                        updateLivePreview();
                    });
                }

                // Fill color picker
                if (fillRow) {
                    fillRow.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.CustomColorPicker) {
                            window.CustomColorPicker.open(fillSwatch, currentConfig.fillColor, (c) => {
                                currentConfig.fillColor = c;
                                updateLivePreview();
                            });
                        }
                    });
                }

                // Track color picker
                if (trackRow) {
                    trackRow.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.CustomColorPicker) {
                            window.CustomColorPicker.open(trackSwatch, currentConfig.trackColor, (c) => {
                                currentConfig.trackColor = c;
                                updateLivePreview();
                            });
                        }
                    });
                }

                if (radiusSelect) {
                    radiusSelect.addEventListener('change', () => {
                        currentConfig.radius = radiusSelect.value;
                        updateLivePreview();
                    });
                }

                if (labelModeSelect) {
                    labelModeSelect.addEventListener('change', () => {
                        currentConfig.showLabel = labelModeSelect.value;
                        updateLivePreview();
                    });
                }

                if (heightSelect) {
                    heightSelect.addEventListener('change', () => {
                        currentConfig.height = parseInt(heightSelect.value, 10);
                        updateLivePreview();
                    });
                }

                // Style cards click and double click
                if (cardsGrid) {
                    cardsGrid.querySelectorAll('.pb-card').forEach(card => {
                        const styleId = card.getAttribute('data-style-id');
                        card.addEventListener('click', () => {
                            cardsGrid.querySelectorAll('.pb-card').forEach(c => c.classList.remove('active'));
                            card.classList.add('active');

                            const chosenPreset = getStyleById(styleId);
                            currentConfig.styleId = chosenPreset.id;
                            currentConfig.fillColor = chosenPreset.fillColor;
                            currentConfig.trackColor = chosenPreset.trackColor;
                            currentConfig.radius = chosenPreset.radius;
                            currentConfig.height = chosenPreset.height;
                            currentConfig.showLabel = chosenPreset.showLabel;
                            currentConfig.labelColor = chosenPreset.labelColor;
                            currentConfig.border = chosenPreset.border || 'none';
                            currentConfig.glow = chosenPreset.glow || 'none';

                            updateLivePreview();
                        });

                        card.addEventListener('dblclick', () => {
                            const confirmBtn = document.getElementById('custom-dialog-confirm');
                            if (confirmBtn) confirmBtn.click();
                        });
                    });
                }
            }, 50);
        }
    };

    // Export to global scope
    window.ProgressBarEngine = ProgressBarEngine;
    window.showProgressBarModal = function(targetEl) {
        ProgressBarEngine.showModal(targetEl);
    };

})(window);
