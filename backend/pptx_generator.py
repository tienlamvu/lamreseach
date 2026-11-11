import io
import json
from datetime import datetime
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

THEMES = {
    "oxford_navy": {
        "primary": RGBColor(15, 23, 42),       # #0F172A
        "secondary": RGBColor(37, 99, 235),    # #2563EB
        "accent": RGBColor(14, 165, 233),      # #0EA5E9
        "bg_light": RGBColor(248, 250, 252),   # #F8FAFC
        "card_bg": RGBColor(255, 255, 255),
        "border": RGBColor(203, 213, 225),
        "text_dark": RGBColor(30, 41, 59),
        "text_muted": RGBColor(100, 116, 139),
    },
    "mit_crimson": {
        "primary": RGBColor(24, 24, 27),       # #18181B
        "secondary": RGBColor(163, 31, 52),    # #A31F34
        "accent": RGBColor(225, 29, 72),       # #E11D48
        "bg_light": RGBColor(250, 250, 249),
        "card_bg": RGBColor(255, 255, 255),
        "border": RGBColor(214, 211, 209),
        "text_dark": RGBColor(28, 25, 23),
        "text_muted": RGBColor(120, 113, 108),
    },
    "emerald_lab": {
        "primary": RGBColor(6, 78, 59),        # #064E3B
        "secondary": RGBColor(13, 148, 136),   # #0D9488
        "accent": RGBColor(16, 185, 129),      # #10B981
        "bg_light": RGBColor(240, 253, 250),
        "card_bg": RGBColor(255, 255, 255),
        "border": RGBColor(153, 246, 228),
        "text_dark": RGBColor(19, 78, 74),
        "text_muted": RGBColor(100, 116, 139),
    },
    "royal_indigo": {
        "primary": RGBColor(30, 27, 75),       # #1E1B4B
        "secondary": RGBColor(79, 70, 229),    # #4F46E5
        "accent": RGBColor(124, 58, 237),      # #7C3AED
        "bg_light": RGBColor(245, 243, 255),
        "card_bg": RGBColor(255, 255, 255),
        "border": RGBColor(221, 214, 254),
        "text_dark": RGBColor(30, 27, 75),
        "text_muted": RGBColor(107, 114, 128),
    }
}


def add_header_and_footer(slide, title_text: str, subtitle_text: str, footer_text: str, slide_num: int, theme: dict):
    # Background fill
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = theme["bg_light"]
    bg.line.fill.background()

    # Header bar
    header = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.05))
    header.fill.solid()
    header.fill.fore_color.rgb = theme["primary"]
    header.line.fill.background()

    # Accent stripe under header
    stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.05), Inches(13.333), Inches(0.06))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = theme["secondary"]
    stripe.line.fill.background()

    # Title text box
    tb = slide.shapes.add_textbox(Inches(0.6), Inches(0.14), Inches(10.5), Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.font.name = "Calibri"

    if subtitle_text:
        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.size = Pt(12)
        p2.font.color.rgb = RGBColor(203, 213, 225)
        p2.font.name = "Calibri"

    # Footer bar
    footer_tb = slide.shapes.add_textbox(Inches(0.6), Inches(7.05), Inches(10.0), Inches(0.35))
    ftf = footer_tb.text_frame
    fp = ftf.paragraphs[0]
    fp.text = footer_text
    fp.font.size = Pt(10)
    fp.font.color.rgb = theme["text_muted"]
    fp.font.name = "Calibri"

    num_tb = slide.shapes.add_textbox(Inches(11.5), Inches(7.05), Inches(1.2), Inches(0.35))
    ntf = num_tb.text_frame
    np = ntf.paragraphs[0]
    np.text = f"Slide {slide_num} / 5"
    np.alignment = PP_ALIGN.RIGHT
    np.font.size = Pt(10)
    np.font.bold = True
    np.font.color.rgb = theme["secondary"]
    np.font.name = "Calibri"


def build_weekly_report_pptx(report_data: dict) -> io.BytesIO:
    """
    Generate a 5-slide widescreen Group Meeting PowerPoint (.pptx) presentation
    from report_data and return as an in-memory BytesIO stream.
    """
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    theme_key = report_data.get("theme_color", "oxford_navy")
    theme = THEMES.get(theme_key, THEMES["oxford_navy"])

    title = report_data.get("title") or "Weekly Research Progress Report"
    week_start = report_data.get("week_start") or datetime.now().strftime("%Y-%m-%d")
    week_end = report_data.get("week_end") or datetime.now().strftime("%Y-%m-%d")
    presenter = report_data.get("presenter_name") or "Alex Chen"
    advisor = report_data.get("advisor_name") or "Prof. Sarah Jenkins"
    lab_name = report_data.get("lab_name") or "Nanomaterials & Energy Storage Laboratory"
    university = report_data.get("university") or "Department of Materials Science & Engineering"

    footer_str = f"{lab_name}  |  {presenter}  |  Week: {week_start} to {week_end}"

    # Parse JSON fields safely
    exp_results = report_data.get("experimental_results", [])
    if isinstance(exp_results, str):
        try:
            exp_results = json.loads(exp_results)
        except Exception:
            exp_results = []

    lit_reviews = report_data.get("literature_review", [])
    if isinstance(lit_reviews, str):
        try:
            lit_reviews = json.loads(lit_reviews)
        except Exception:
            lit_reviews = []

    metrics = report_data.get("metrics", {})
    if isinstance(metrics, str):
        try:
            metrics = json.loads(metrics)
        except Exception:
            metrics = {}

    # =========================================================================
    # SLIDE 1: COVER SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = theme["primary"]
    bg1.line.fill.background()

    # Left decorative accent pillar
    pillar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.45), Inches(7.5))
    pillar.fill.solid()
    pillar.fill.fore_color.rgb = theme["secondary"]
    pillar.line.fill.background()

    # Top badge (University & Lab)
    badge_tb = slide1.shapes.add_textbox(Inches(1.2), Inches(1.1), Inches(11.0), Inches(0.9))
    btf = badge_tb.text_frame
    btf.word_wrap = True
    bp1 = btf.paragraphs[0]
    bp1.text = university.upper()
    bp1.font.size = Pt(13)
    bp1.font.bold = True
    bp1.font.color.rgb = theme["accent"]
    bp1.font.name = "Calibri"

    bp2 = btf.add_paragraph()
    bp2.text = lab_name
    bp2.font.size = Pt(16)
    bp2.font.color.rgb = RGBColor(203, 213, 225)
    bp2.font.name = "Calibri"

    # Main Title
    title_tb = slide1.shapes.add_textbox(Inches(1.2), Inches(2.4), Inches(11.0), Inches(2.2))
    ttf = title_tb.text_frame
    ttf.word_wrap = True
    tp1 = ttf.paragraphs[0]
    tp1.text = title
    tp1.font.size = Pt(40)
    tp1.font.bold = True
    tp1.font.color.rgb = RGBColor(255, 255, 255)
    tp1.font.name = "Calibri"

    tp2 = ttf.add_paragraph()
    tp2.text = f"Reporting Period: {week_start}  —  {week_end}"
    tp2.font.size = Pt(20)
    tp2.font.color.rgb = RGBColor(148, 163, 184)
    tp2.font.name = "Calibri"

    # Metadata Card at Bottom
    meta_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(5.0), Inches(10.8), Inches(1.6))
    meta_card.fill.solid()
    meta_card.fill.fore_color.rgb = RGBColor(30, 41, 59)
    meta_card.line.color.rgb = theme["secondary"]
    meta_card.line.width = Pt(1.5)

    meta_tb = slide1.shapes.add_textbox(Inches(1.5), Inches(5.2), Inches(10.2), Inches(1.2))
    mtf = meta_tb.text_frame
    mtf.word_wrap = True
    mp1 = mtf.paragraphs[0]
    mp1.text = f"Presenter:  {presenter}"
    mp1.font.size = Pt(18)
    mp1.font.bold = True
    mp1.font.color.rgb = RGBColor(255, 255, 255)
    mp1.font.name = "Calibri"

    mp2 = mtf.add_paragraph()
    mp2.text = f"Principal Investigator (PI):  {advisor}   |   Materials Science & Engineering Group Meeting"
    mp2.font.size = Pt(14)
    mp2.font.color.rgb = RGBColor(203, 213, 225)
    mp2.font.name = "Calibri"

    # =========================================================================
    # SLIDE 2: COMPLETED WORK & WEEKLY METRICS
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        slide2,
        "1. Executive Summary & Completed Work",
        f"Key research milestones and laboratory output for {week_start} to {week_end}",
        footer_str,
        2,
        theme,
    )

    # 4 KPI Cards across the top
    kpi_items = [
        ("Samples Synthesized", str(metrics.get("samples_count", max(len(exp_results), 2)))),
        ("Characterizations Run", str(metrics.get("characterizations_count", 4))),
        ("Papers Reviewed", str(metrics.get("papers_count", max(len(lit_reviews), 2)))),
        ("Tasks Completed", str(metrics.get("tasks_completed", 5))),
    ]
    for idx, (label, val) in enumerate(kpi_items):
        left = Inches(0.6 + idx * 3.1)
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.35), Inches(2.9), Inches(1.25))
        card.fill.solid()
        card.fill.fore_color.rgb = theme["card_bg"]
        card.line.color.rgb = theme["border"]
        card.line.width = Pt(1)

        ktb = slide2.shapes.add_textbox(left + Inches(0.15), Inches(1.42), Inches(2.6), Inches(1.1))
        ktf = ktb.text_frame
        ktf.word_wrap = True
        kp1 = ktf.paragraphs[0]
        kp1.text = val
        kp1.font.size = Pt(28)
        kp1.font.bold = True
        kp1.font.color.rgb = theme["secondary"]
        kp1.font.name = "Calibri"

        kp2 = ktf.add_paragraph()
        kp2.text = label
        kp2.font.size = Pt(12)
        kp2.font.bold = True
        kp2.font.color.rgb = theme["text_muted"]
        kp2.font.name = "Calibri"

    # Completed Work Main Card
    ach_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(2.85), Inches(12.1), Inches(3.95))
    ach_card.fill.solid()
    ach_card.fill.fore_color.rgb = theme["card_bg"]
    ach_card.line.color.rgb = theme["border"]
    ach_card.line.width = Pt(1)

    ach_tb = slide2.shapes.add_textbox(Inches(0.85), Inches(3.0), Inches(11.6), Inches(3.6))
    atf = ach_tb.text_frame
    atf.word_wrap = True

    ap_head = atf.paragraphs[0]
    ap_head.text = "Key Completed Objectives & Experimental Highlights"
    ap_head.font.size = Pt(18)
    ap_head.font.bold = True
    ap_head.font.color.rgb = theme["primary"]
    ap_head.font.name = "Calibri"

    raw_achievements = report_data.get("summary_achievements") or ""
    bullet_lines = [line.strip().lstrip("•-*").strip() for line in raw_achievements.splitlines() if line.strip()]
    if not bullet_lines:
        bullet_lines = [
            "Synthesized target material batches and verified phase purity via powder X-ray diffraction (XRD).",
            "Performed microstructural and surface chemical analysis (SEM/EDS, XPS) to quantify interfacial composition.",
            "Evaluated functional performance metrics and benchmarked against recent literature standards.",
        ]

    for line in bullet_lines[:8]:
        p = atf.add_paragraph()
        p.text = f"•  {line}"
        p.font.size = Pt(15)
        p.font.color.rgb = theme["text_dark"]
        p.font.name = "Calibri"
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 3: EXPERIMENTAL / SYNTHESIS & CHARACTERIZATION RESULTS
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        slide3,
        "2. Experimental Synthesis & Characterization Results",
        "Summary of sample batches, processing parameters, characterization techniques, and quantitative findings",
        footer_str,
        3,
        theme,
    )

    if not exp_results:
        exp_results = [
            {
                "sample_id": "LLZTO-2026-04",
                "material": "Li6.4La3Zr1.4Ta0.6O12",
                "conditions": "1140 °C, 12h in O2, +10 wt% Li2CO3",
                "methods": "XRD, EIS, Archimedes",
                "findings": "Pure cubic Ia-3d phase (a = 12.928 Å); rel. density 95.8%; σ = 0.84 mS/cm."
            },
            {
                "sample_id": "LLZTO-2026-04-ALD",
                "material": "Al2O3 / LLZTO Interface",
                "conditions": "Thermal ALD Al2O3 (25 cycles, 3 nm) + 600 °C Ar anneal",
                "methods": "XPS, Symmetric Li Cell",
                "findings": "Surface Li2CO3 reduced by 91%; interfacial ASR dropped from 410 to 14.2 Ω·cm²."
            }
        ]

    rows_count = min(len(exp_results), 5) + 1
    table_shape = slide3.shapes.add_table(rows_count, 4, Inches(0.6), Inches(1.4), Inches(12.1), Inches(5.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.3)
    table.columns[1].width = Inches(3.3)
    table.columns[2].width = Inches(2.2)
    table.columns[3].width = Inches(4.3)

    headers = ["Sample ID & Formula", "Synthesis / Processing Conditions", "Characterization", "Key Quantitative Findings"]
    for col_idx, h_text in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = theme["primary"]
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.font.name = "Calibri"

    for row_idx, item in enumerate(exp_results[:5], start=1):
        row_vals = [
            f"{item.get('sample_id', 'Sample')}\n({item.get('material', '')})",
            item.get("conditions", ""),
            item.get("methods", ""),
            item.get("findings", ""),
        ]
        for col_idx, val in enumerate(row_vals):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(255, 255, 255) if row_idx % 2 == 1 else RGBColor(241, 245, 249)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            p = cell.text_frame.paragraphs[0]
            p.text = str(val).strip()
            p.font.size = Pt(12)
            p.font.bold = (col_idx == 0)
            p.font.color.rgb = theme["text_dark"]
            p.font.name = "Calibri"

    # =========================================================================
    # SLIDE 4: LITERATURE REVIEW & BENCHMARKING
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        slide4,
        "3. Literature Review & State-of-the-Art Benchmarking",
        "Key publications analyzed this week and direct relevance to experimental design",
        footer_str,
        4,
        theme,
    )

    if not lit_reviews:
        lit_reviews = [
            {
                "title": "Ta-Doped Li7La3Zr2O12 Garnet Solid Electrolytes: Role of Excess Li and Sintering Atmosphere",
                "journal": "Chemistry of Materials (2021) | DOI: 10.1021/acs.chemmater.0c04125",
                "material": "Li6.4La3Zr1.4Ta0.6O12 (XRD, SEM, Raman, EIS)",
                "takeaway": "10 wt% excess Li2CO3 with mother powder bed prevents La2Zr2O7 pyrochlore impurity during 1140 °C sintering."
            }
        ]

    for idx, paper in enumerate(lit_reviews[:3]):
        top = Inches(1.4 + idx * 1.8)
        p_card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), top, Inches(12.1), Inches(1.62))
        p_card.fill.solid()
        p_card.fill.fore_color.rgb = theme["card_bg"]
        p_card.line.color.rgb = theme["border"]
        p_card.line.width = Pt(1)

        ptb = slide4.shapes.add_textbox(Inches(0.8), top + Inches(0.1), Inches(11.7), Inches(1.42))
        ptf = ptb.text_frame
        ptf.word_wrap = True

        pp1 = ptf.paragraphs[0]
        pp1.text = f"[{idx + 1}]  {paper.get('title', 'Paper Title')}"
        pp1.font.size = Pt(15)
        pp1.font.bold = True
        pp1.font.color.rgb = theme["primary"]
        pp1.font.name = "Calibri"

        pp2 = ptf.add_paragraph()
        pp2.text = f"Source: {paper.get('journal', '')}    |    System: {paper.get('material', '')}"
        pp2.font.size = Pt(12)
        pp2.font.bold = True
        pp2.font.color.rgb = theme["secondary"]
        pp2.font.name = "Calibri"
        pp2.space_before = Pt(3)

        pp3 = ptf.add_paragraph()
        pp3.text = f"Key Takeaway: {paper.get('takeaway', '')}"
        pp3.font.size = Pt(13)
        pp3.font.color.rgb = theme["text_dark"]
        pp3.font.name = "Calibri"
        pp3.space_before = Pt(4)

    # =========================================================================
    # SLIDE 5: BLOCKERS / TROUBLESHOOTING & NEXT WEEK PLAN
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        slide5,
        "4. Challenges, Troubleshooting & Next Week Plan",
        "Technical bottlenecks, mitigation strategies, and upcoming experimental schedule",
        footer_str,
        5,
        theme,
    )

    # Left Column: Blockers & Troubleshooting
    left_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.4), Inches(5.85), Inches(5.35))
    left_card.fill.solid()
    left_card.fill.fore_color.rgb = theme["card_bg"]
    left_card.line.color.rgb = RGBColor(245, 158, 11)
    left_card.line.width = Pt(1.5)

    ltb = slide5.shapes.add_textbox(Inches(0.85), Inches(1.6), Inches(5.35), Inches(4.95))
    ltf = ltb.text_frame
    ltf.word_wrap = True
    lp_head = ltf.paragraphs[0]
    lp_head.text = "Challenges & Troubleshooting"
    lp_head.font.size = Pt(18)
    lp_head.font.bold = True
    lp_head.font.color.rgb = RGBColor(180, 83, 9)
    lp_head.font.name = "Calibri"

    raw_blockers = report_data.get("blockers_troubleshooting") or ""
    blocker_lines = [line.strip().lstrip("•-*").strip() for line in raw_blockers.splitlines() if line.strip()]
    if not blocker_lines:
        blocker_lines = [
            "Brief air exposure during sample transfer caused trace surface carbonate re-formation.",
            "Mitigation: Utilize air-tight transfer vessel between Ar glovebox and XPS/SEM load-lock.",
        ]
    for line in blocker_lines[:7]:
        p = ltf.add_paragraph()
        p.text = f"•  {line}"
        p.font.size = Pt(14)
        p.font.color.rgb = theme["text_dark"]
        p.font.name = "Calibri"
        p.space_before = Pt(8)

    # Right Column: Next Week Plan
    right_card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.85), Inches(1.4), Inches(5.85), Inches(5.35))
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = theme["card_bg"]
    right_card.line.color.rgb = theme["secondary"]
    right_card.line.width = Pt(1.5)

    rtb = slide5.shapes.add_textbox(Inches(7.1), Inches(1.6), Inches(5.35), Inches(4.95))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    rp_head = rtf.paragraphs[0]
    rp_head.text = "Action Plan for Next Week"
    rp_head.font.size = Pt(18)
    rp_head.font.bold = True
    rp_head.font.color.rgb = theme["secondary"]
    rp_head.font.name = "Calibri"

    raw_next = report_data.get("next_week_plan") or ""
    next_lines = [line.strip().lstrip("•-*").strip() for line in raw_next.splitlines() if line.strip()]
    if not next_lines:
        next_lines = [
            "Conduct FE-SEM cross-sectional imaging and EDS elemental mapping on batch LLZTO-2026-04-ALD.",
            "Assemble Li | LLZTO-ALD | Li symmetric coin cells for critical current density (CCD) testing.",
            "Draft manuscript Section 3.2 on XPS depth profile analysis.",
        ]
    for line in next_lines[:7]:
        p = rtf.add_paragraph()
        p.text = f"•  {line}"
        p.font.size = Pt(14)
        p.font.color.rgb = theme["text_dark"]
        p.font.name = "Calibri"
        p.space_before = Pt(8)

    output = io.BytesIO()
    prs.save(output)
    output.seek(0)
    return output
