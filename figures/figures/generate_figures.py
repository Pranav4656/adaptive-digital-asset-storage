from pathlib import Path 
import matplotlib.pyplot as plt 
from matplotlib.patches import Rectangle, Polygon 
 
 
# ============================================================ 
# OUTPUT 
# ============================================================ 
 
OUTPUT_DIR = Path(__file__).resolve().parent 
 
 
# ============================================================ 
# COLORS / STYLE 
# ============================================================ 
 
BOX_FACE = "#EAF2F8" 
BOX_EDGE = "#1F4E79" 
TEXT_COLOR = "#111111" 
ARROW_COLOR = "#1F1F1F" 
 
BOX_LINEWIDTH = 2.0 
ARROW_LINEWIDTH = 2.0 
 
 
# ============================================================ 
# BOX 
# ============================================================ 
 
def create_box(ax, x1, y1, x2, y2, text, fontsize=13): 
 
    rect = Rectangle( 
        (x1, y1), 
        x2 - x1, 
        y2 - y1, 
        facecolor=BOX_FACE, 
        edgecolor=BOX_EDGE, 
        linewidth=BOX_LINEWIDTH, 
        zorder=3 
    ) 
 
    ax.add_patch(rect) 
 
    ax.text( 
        (x1 + x2) / 2, 
        (y1 + y2) / 2, 
        text, 
        ha="center", 
        va="center", 
        fontsize=fontsize, 
        fontweight="bold", 
        color=TEXT_COLOR, 
        zorder=4 
    ) 
 
    return { 
        "left": (x1, (y1 + y2) / 2), 
        "right": (x2, (y1 + y2) / 2), 
        "top": ((x1 + x2) / 2, y1), 
        "bottom": ((x1 + x2) / 2, y2), 
        "center": ((x1 + x2) / 2, (y1 + y2) / 2) 
    } 
 
 
# ============================================================ 
# ARROW HEAD 
# ============================================================ 
 
def draw_arrow_head(ax, start, end, head_length=18, head_width=12): 
 
    x1, y1 = start 
    x2, y2 = end 
 
    dx = x2 - x1 
    dy = y2 - y1 
 
    length = (dx ** 2 + dy ** 2) ** 0.5 
 
    if length == 0: 
        return 
 
    ux = dx / length 
    uy = dy / length 
 
    base_x = x2 - ux * head_length 
    base_y = y2 - uy * head_length 
 
    px = -uy 
    py = ux 
 
    left = ( 
        base_x + px * head_width / 2, 
        base_y + py * head_width / 2 
    ) 
 
    right = ( 
        base_x - px * head_width / 2, 
        base_y - py * head_width / 2 
    ) 
 
    triangle = Polygon( 
        [ 
            (x2, y2), 
            left, 
            right 
        ], 
        closed=True, 
        facecolor=ARROW_COLOR, 
        edgecolor=ARROW_COLOR, 
        zorder=2 
    ) 
 
    ax.add_patch(triangle) 
 
 
# ============================================================ 
# STRAIGHT ARROW 
# ============================================================ 
 
def draw_segment_arrow( 
    ax, 
    start, 
    end, 
    head_length=18, 
    head_width=12 
): 
 
    x1, y1 = start 
    x2, y2 = end 
 
    dx = x2 - x1 
    dy = y2 - y1 
 
    length = (dx ** 2 + dy ** 2) ** 0.5 
 
    if length == 0: 
        return 
 
    ux = dx / length 
    uy = dy / length 
 
    shaft_end = ( 
        x2 - ux * head_length, 
        y2 - uy * head_length 
    ) 
 
    ax.plot( 
        [x1, shaft_end[0]], 
        [y1, shaft_end[1]], 
        color=ARROW_COLOR, 
        linewidth=ARROW_LINEWIDTH, 
        solid_capstyle="butt", 
        zorder=2 
    ) 
 
    draw_arrow_head( 
        ax, 
        start, 
        end, 
        head_length, 
        head_width 
    ) 
 
 
# ============================================================ 
# LINE 
# ============================================================ 
 
def draw_line(ax, start, end): 
 
    ax.plot( 
        [start[0], end[0]], 
        [start[1], end[1]], 
        color=ARROW_COLOR, 
        linewidth=ARROW_LINEWIDTH, 
        solid_capstyle="butt", 
        solid_joinstyle="miter", 
        zorder=2 
    ) 
 
 
# ============================================================ 
# ROUTED ARROW 
# ============================================================ 
 
def draw_routed_arrow( 
    ax, 
    points, 
    head_length=18, 
    head_width=12 
): 
 
    if len(points) < 2: 
        return 
 
    # Draw all segments except final segment 
    for i in range(len(points) - 2): 
 
        draw_line( 
            ax, 
            points[i], 
            points[i + 1] 
        ) 
 
    # Final segment contains arrowhead 
    draw_segment_arrow( 
        ax, 
        points[-2], 
        points[-1], 
        head_length, 
        head_width 
    ) 
 
 
# ============================================================ 
# AXES 
# ============================================================ 
 
def setup_axes(ax, x_max, y_max): 
 
    ax.set_xlim(0, x_max) 
    ax.set_ylim(y_max, 0) 
 
    ax.set_aspect("equal", adjustable="box") 
 
    ax.axis("off") 
 
    ax.set_position([ 
        0.04, 
        0.04, 
        0.92, 
        0.92 
    ]) 
 
 
# ============================================================ 
# SAVE PNG ONLY 
# ============================================================ 
 
def save_figure(fig, filename): 
 
    output = OUTPUT_DIR / f"{filename}.png" 
 
    fig.savefig( 
        output, 
        dpi=300, 
        facecolor="white", 
        edgecolor="white", 
        bbox_inches=None, 
        pad_inches=0.2 
    ) 
 
    plt.close(fig) 
 
    print(f"Created: {output}") 
 
 
# ============================================================ 
# FIGURE 1 
# OVERALL SYSTEM ARCHITECTURE 
# ============================================================ 
 
def create_figure_1(): 
 
    fig, ax = plt.subplots( 
        figsize=(18, 10), 
        dpi=300 
    ) 
 
    setup_axes(ax, 2150, 1350) 
 
    # -------------------------------------------------------- 
    # ROW 1 
    # -------------------------------------------------------- 
 
    react = create_box( 
        ax, 
        97, 349, 
        411, 469, 
        "React-Based\n3D Virtual World" 
    ) 
 
    asset = create_box( 
        ax, 
        463, 349, 
        777, 469, 
        "Digital Asset\nCreation" 
    ) 
 
    features = create_box( 
        ax, 
        829, 349, 
        1143, 469, 
        "Five Asset\nFeatures" 
    ) 
 
    api = create_box( 
        ax, 
        1195, 349, 
        1509, 469, 
        "Flask AI\nPrediction API" 
    ) 
 
    classifier = create_box( 
        ax, 
        1560, 349, 
        1874, 469, 
        "Random Forest\nClassifier" 
    ) 
 
    # -------------------------------------------------------- 
    # STORAGE ROW 
    # -------------------------------------------------------- 
 
    on_chain = create_box( 
        ax, 
        828, 723, 
        1142, 843, 
        "ON_CHAIN" 
    ) 
 
    off_chain = create_box( 
        ax, 
        1642, 723, 
        1956, 843, 
        "OFF_CHAIN" 
    ) 
 
    # -------------------------------------------------------- 
    # BLOCKCHAIN / API ROW 
    # -------------------------------------------------------- 
 
    metamask = create_box( 
        ax, 
        470, 977, 
        784, 1097, 
        "MetaMask" 
    ) 
 
    smart_contract = create_box( 
        ax, 
        836, 977, 
        1150, 1097, 
        "Smart Contract" 
    ) 
 
    hardhat = create_box( 
        ax, 
        1202, 977, 
        1516, 1097, 
        "Hardhat\nLocal Blockchain" 
    ) 
 
    external_api = create_box( 
        ax, 
        1642, 977, 
        1956, 1097, 
        "External Off-Chain\nStorage API" 
    ) 
 
    research = create_box( 
        ax, 
        956, 1190, 
        1478, 1310, 
        "Research Logging" 
    ) 
 
    # ======================================================== 
    # ROW 1 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        react["right"], 
        asset["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        asset["right"], 
        features["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        features["right"], 
        api["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        api["right"], 
        classifier["left"] 
    ) 
 
    # ======================================================== 
    # RANDOM FOREST → STORAGE BRANCH 
    # ======================================================== 
 
    classifier_center_x = 1717 
    branch_y = 650 
 
    # Classifier → branch 
    draw_line( 
        ax, 
        classifier["bottom"], 
        (classifier_center_x, branch_y) 
    ) 
 
    # Branch line 
    draw_line( 
        ax, 
        (985, branch_y), 
        (1799, branch_y) 
    ) 
 
    # ON_CHAIN arrow 
    draw_segment_arrow( 
        ax, 
        (985, branch_y), 
        (985, 723) 
    ) 
 
    # OFF_CHAIN arrow 
    draw_segment_arrow( 
        ax, 
        (1799, branch_y), 
        (1799, 723) 
    ) 
 
    # ======================================================== 
    # METAMASK → SMART CONTRACT → HARDHAT 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        metamask["right"], 
        smart_contract["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        smart_contract["right"], 
        hardhat["left"] 
    ) 
 
    # ======================================================== 
    # ON_CHAIN → SMART CONTRACT 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        (993, 843), 
        (993, 977) 
    ) 
 
    # ======================================================== 
    # OFF_CHAIN → EXTERNAL STORAGE API 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        (1799, 843), 
        (1799, 977) 
    ) 
 
    # ======================================================== 
    # HARDHAT → RESEARCH LOGGING 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        hardhat["bottom"], 
        (1359, 1190) 
    ) 
 
    # ======================================================== 
    # EXTERNAL API → RESEARCH LOGGING 
    # ======================================================== 
 
    draw_routed_arrow( 
        ax, 
        [ 
            external_api["bottom"], 
            (1799, 1253), 
            (1478, 1253) 
        ] 
    ) 
 
    save_figure( 
        fig, 
        "Figure1_Overall_System_Architecture" 
    ) 
 
 
# ============================================================ 
# FIGURE 2 
# RANDOM FOREST CLASSIFICATION WORKFLOW 
# ============================================================ 
 
def create_figure_2(): 
 
    fig, ax = plt.subplots( 
        figsize=(18, 10), 
        dpi=300 
    ) 
 
    setup_axes(ax, 2600, 1300) 
 
    # -------------------------------------------------------- 
    # ROW 1 
    # -------------------------------------------------------- 
 
    records = create_box( 
        ax, 
        119, 389, 
        531, 509, 
        "50,000 Records" 
    ) 
 
    preparation = create_box( 
        ax, 
        610, 389, 
        1053, 509, 
        "Data Preparation" 
    ) 
 
    split = create_box( 
        ax, 
        1132, 389, 
        1512, 509, 
        "80:20 Split" 
    ) 
 
    random_forest = create_box( 
        ax, 
        1599, 389, 
        2011, 527, 
        "Random Forest" 
    ) 
 
    prediction = create_box( 
        ax, 
        2097, 389, 
        2509, 527, 
        "Storage Class\nPrediction" 
    ) 
 
    # -------------------------------------------------------- 
    # INPUT FEATURES 
    # -------------------------------------------------------- 
 
    input_features = create_box( 
        ax, 
        1615, 842, 
        1995, 1015, 
        "Input Features\n" 
        "Asset Size\n" 
        "Importance\n" 
        "Update Frequency\n" 
        "Transaction Cost\n" 
        "Ownership Requirement", 
        fontsize=10 
    ) 
 
    # -------------------------------------------------------- 
    # STORAGE 
    # -------------------------------------------------------- 
 
    on_chain = create_box( 
        ax, 
        2040, 842, 
        2250, 1015, 
        "ON_CHAIN", 
        fontsize=13 
    ) 
 
    off_chain = create_box( 
        ax, 
        2300, 842, 
        2510, 1015, 
        "OFF_CHAIN", 
        fontsize=13 
    ) 
 
    # -------------------------------------------------------- 
    # MODEL EVALUATION 
    # -------------------------------------------------------- 
 
    evaluation = create_box( 
        ax, 
        1000, 1180, 
        1580, 1300, 
        "Model Evaluation", 
        fontsize=13 
    ) 
 
    # ======================================================== 
    # TOP ROW CONNECTIONS 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        records["right"], 
        preparation["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        preparation["right"], 
        split["left"] 
    ) 
 
    # ======================================================== 
    # 80:20 SPLIT → RANDOM FOREST 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        (1512, 449), 
        (1599, 449) 
    ) 
 
    # Random Forest → Storage Class Prediction 
    draw_segment_arrow( 
        ax, 
        random_forest["right"], 
        prediction["left"] 
    ) 
 
    # ======================================================== 
    # INPUT FEATURES → RANDOM FOREST 
    # ======================================================== 
 
    draw_segment_arrow( 
        ax, 
        (1805, 842), 
        (1805, 527) 
    ) 
 
    # ======================================================== 
    # STORAGE CLASS PREDICTION → STORAGE 
    # ======================================================== 
 
    prediction_center_x = 2303 
    branch_y = 696 
 
    # Prediction → branch 
    draw_line( 
        ax, 
        (prediction_center_x, 527), 
        (prediction_center_x, branch_y) 
    ) 
 
    # Horizontal branch 
    draw_line( 
        ax, 
        (2145, branch_y), 
        (2405, branch_y) 
    ) 
 
    # ON_CHAIN 
    draw_segment_arrow( 
        ax, 
        (2145, branch_y), 
        (2145, 842) 
    ) 
 
    # OFF_CHAIN 
    draw_segment_arrow( 
        ax, 
        (2405, branch_y), 
        (2405, 842) 
    ) 
 
    # ======================================================== 
    # ON_CHAIN → MODEL EVALUATION 
    # ======================================================== 
 
    draw_routed_arrow( 
        ax, 
        [ 
            (2145, 1015), 
            (2145, 1065), 
            (1215, 1065), 
            (1215, 1180) 
        ] 
    ) 
 
    # ======================================================== 
    # OFF_CHAIN → MODEL EVALUATION 
    # ======================================================== 
 
    draw_routed_arrow( 
        ax, 
        [ 
            (2405, 1015), 
            (2405, 1125), 
            (1357, 1125), 
            (1357, 1180) 
        ] 
    ) 
 
    save_figure( 
        fig, 
        "Figure2_Random_Forest_Classification_Workflow" 
    ) 
 
 
# ============================================================ 
# FIGURE 3 
# END-TO-END ASSET STORAGE WORKFLOW 
# ============================================================ 
 
def create_figure_3(): 
 
    fig, ax = plt.subplots( 
        figsize=(18, 10), 
        dpi=300 
    ) 
 
    setup_axes(ax, 2600, 1250) 
 
    # -------------------------------------------------------- 
    # ROW 1 
    # -------------------------------------------------------- 
 
    user = create_box( 
        ax, 
        119, 326, 
        397, 446, 
        "User" 
    ) 
 
    react = create_box( 
        ax, 
        491, 326, 
        888, 446, 
        "React 3D\nVirtual World" 
    ) 
 
    land = create_box( 
        ax, 
        998, 326, 
        1356, 446, 
        "Select Virtual Land" 
    ) 
 
    asset = create_box( 
        ax, 
        1457, 326, 
        1839, 446, 
        "Generate Digital Asset" 
    ) 
 
    flask = create_box( 
        ax, 
        1941, 326, 
        2323, 457, 
        "Flask AI API" 
    ) 
 
    # -------------------------------------------------------- 
    # STORAGE 
    # -------------------------------------------------------- 
 
    on_chain = create_box( 
        ax, 
        1580, 740, 
        1962, 883, 
        "ON_CHAIN" 
    ) 
 
    off_chain = create_box( 
        ax, 
        2047, 740, 
        2429, 883, 
        "OFF_CHAIN" 
    ) 
 
    # -------------------------------------------------------- 
    # RESEARCH LOGGING 
    # -------------------------------------------------------- 
 
    research = create_box( 
        ax, 
        1000, 1079, 
        1580, 1210, 
        "Research Logging" 
    ) 
 
    # -------------------------------------------------------- 
    # TOP CONNECTIONS 
    # -------------------------------------------------------- 
 
    draw_segment_arrow( 
        ax, 
        user["right"], 
        react["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        react["right"], 
        land["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        land["right"], 
        asset["left"] 
    ) 
 
    draw_segment_arrow( 
        ax, 
        asset["right"], 
        flask["left"] 
    ) 
 
    # -------------------------------------------------------- 
    # FLASK → STORAGE 
    # -------------------------------------------------------- 
 
    draw_line( 
        ax, 
        flask["bottom"], 
        (2132, 620) 
    ) 
 
    draw_line( 
        ax, 
        (1771, 620), 
        (2238, 620) 
    ) 
 
    draw_segment_arrow( 
        ax, 
        (1771, 620), 
        (1771, 740) 
    ) 
 
    draw_segment_arrow( 
        ax, 
        (2238, 620), 
        (2238, 740) 
    ) 
 
    # -------------------------------------------------------- 
    # ON_CHAIN → RESEARCH 
    # -------------------------------------------------------- 
 
    draw_routed_arrow( 
        ax, 
        [ 
            (1771, 883), 
            (1771, 955), 
            (1200, 955), 
            (1200, 1079) 
        ] 
    ) 
 
    # -------------------------------------------------------- 
    # OFF_CHAIN → RESEARCH 
    # -------------------------------------------------------- 
 
    draw_routed_arrow( 
        ax, 
        [ 
            (2238, 883), 
            (2238, 1015), 
            (1375, 1015), 
            (1375, 1079) 
        ] 
    ) 
 
    save_figure( 
        fig, 
        "Figure3_End_to_End_Asset_Storage_Workflow" 
    ) 
 
 
# ============================================================ 
# MAIN 
# ============================================================ 
 
if __name__ == "__main__": 
 
    print() 
    print("Generating PNG research figures...") 
    print() 
 
    create_figure_1() 
    create_figure_2() 
    create_figure_3() 
 
    print() 
    print("============================================") 
    print("ALL 3 PNG FIGURES GENERATED SUCCESSFULLY") 
    print("============================================") 
    print() 
    print("Output folder:") 
    print(OUTPUT_DIR) 
    print() 
    print("Generated:") 
    print("Figure1_Overall_System_Architecture.png") 
    print("Figure2_Random_Forest_Classification_Workflow.png") 
    print("Figure3_End_to_End_Asset_Storage_Workflow.png") 
    print()