from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.barcharts import HorizontalBarChart

from io import BytesIO
from accounts.models import Task

# Génération rapport PDF
def generate_project_report(project):
    # Buffer mémoire PDF
    buffer = BytesIO()
    # Configuration document PDF
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=35,
        leftMargin=35,
        topMargin=40,
        bottomMargin=30
    )
    # Styles par défaut
    styles = getSampleStyleSheet()
    # Liste contenu PDF
    elements = []
    # Couleurs utilisées
    PRIMARY = colors.HexColor("#2563EB")
    DARK = colors.HexColor("#0F172A")
    LIGHT = colors.HexColor("#F8FAFC")
    BORDER = colors.HexColor("#CBD5E1")
    SUCCESS = colors.HexColor("#16A34A")
    # Style titre principal
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=28,
        leading=32,
        alignment=TA_CENTER,
        textColor=DARK,
        spaceAfter=10
    )
    # Style sous-titre
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=11,
        alignment=TA_CENTER,
        textColor=colors.grey,
        spaceAfter=25
    )
    # Style sections
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=16,
        leading=20,
        textColor=PRIMARY,
        spaceAfter=15
    )
    # Style texte normal
    normal_style = styles["BodyText"]

    # Titre rapport
    elements.append(
        Paragraph("RAPPORT DU PROJET", title_style)
    )
    # Nom projet
    elements.append(
        Paragraph(
            f"{project.name}",
            subtitle_style
        )
    )
    # Ligne séparation
    elements.append(
        HRFlowable(
            width="100%",
            thickness=1,
            color=BORDER
        )
    )
    # Espace vertical
    elements.append(Spacer(1, 20))
# KPIs projet
    kpi_data = [[
        # Statut projet
        Paragraph(
            f"<b>Status</b><br/>{project.status}",
            normal_style
    ),
        # Budget projet
        Paragraph(
            f"<b>Budget</b><br/>{project.budget} DT",
            normal_style
    ),
        # Progression prédite
        Paragraph(
            f"<b>Progression</b><br/>{project.predicted_progress}%",
            normal_style
    ),

]]
   # Tableau KPIs
    kpi_table = Table(kpi_data, colWidths=[170,170,170])
    # Style tableau KPIs
    kpi_table.setStyle(TableStyle([

        ('BACKGROUND', (0,0), (-1,-1), LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER),

        ('TEXTCOLOR', (0,0), (-1,-1), DARK),

        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),

        ('FONTSIZE', (0,0), (-1,-1), 12),

        ('BOTTOMPADDING', (0,0), (-1,-1), 18),
        ('TOPPADDING', (0,0), (-1,-1), 18),

        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    # Ajout tableau KPIs
    elements.append(kpi_table)

    elements.append(Spacer(1, 30))
     # Informations projet
    elements.append(
        Paragraph("Informations du projet", section_style)
    )
     # Données projet
    info_data = [
        ["Chef de projet", project.chef_projet.username if project.chef_projet else "-"],
        ["Budget utilisé", f"{project.budget_used} DT"],
        ["Coût prévisionnel", f"{project.predicted_cost} DT"],
        ["Date de début", str(project.start_date)],
        ["Date de fin", str(project.end_date)],
    ]
    # Tableau informations
    info_table = Table(info_data, colWidths=[220, 280])
    # Style tableau informations
    info_table.setStyle(TableStyle([

        ('BACKGROUND', (0,0), (0,-1), PRIMARY),
        ('TEXTCOLOR', (0,0), (0,-1), colors.white),

        ('BACKGROUND', (1,0), (1,-1), LIGHT),

        ('GRID', (0,0), (-1,-1), 0.5, BORDER),

        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),

        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 12),

    ]))
    # Ajout tableau infos
    elements.append(info_table)

    elements.append(Spacer(1, 30))
    # Membres équipe
    elements.append(
        Paragraph("Membres de l'équipe", section_style)
    )
    # Entête tableau membres
    members_data = [["Nom", "Email", "Équipe"]]
    # Parcours membres projet
    for member in project.members.all():
        # Nom complet
        members_data.append([
            f"{member.first_name} {member.last_name}",
            # Email membre
            member.email,
            # Nom équipe
            member.team.name if member.team else "-"
        ])
    # Tableau membres
    members_table = Table(
        members_data,
        colWidths=[170, 220, 110]
    )
    # Style tableau membres
    members_table.setStyle(TableStyle([

        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),

        ('ROWBACKGROUNDS', (0,1), (-1,-1),
         [colors.white, LIGHT]),

        ('GRID', (0,0), (-1,-1), 0.5, BORDER),

        ('BOTTOMPADDING', (0,0), (-1,0), 14),
        ('TOPPADDING', (0,0), (-1,0), 14),

    ]))
    # Ajout tableau membres
    elements.append(members_table)

    elements.append(Spacer(1, 30))
    # Tableau tâches
    elements.append(
        Paragraph("Aperçu des tâches", section_style)
    )
     # Tâches projet
    tasks = Task.objects.filter(project=project)
    # Entête tableau tâches
    task_data = [[
    "Tâche",
    "Assigné à",
    "Heures",
    "Coût",
    "Statut"
]] 
    # Parcours tâches
    for task in tasks:

        task_data.append([
            # Titre tâche
            task.title,
            # User assigné
            task.assigned_to.username if task.assigned_to else "-",
            # Heures tâche
            str(task.hours),
            # Coût tâche
            f"{task.cost} DT",
            # Statut tâche
            task.status
        ])
    # Tableau tâches
    task_table = Table(
        task_data,
        colWidths=[150,110,60,80,100]
    )
    # Style tableau tâches
    task_table.setStyle(TableStyle([

        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),

        ('ROWBACKGROUNDS', (0,1), (-1,-1),
         [colors.white, colors.HexColor("#EFF6FF")]),

        ('GRID', (0,0), (-1,-1), 0.5, BORDER),

        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('TOPPADDING', (0,0), (-1,0), 12),

    ]))
    # Ajout tableau tâches
    elements.append(task_table)

    elements.append(Spacer(1, 35))
 
# Génération PDF
    # Construit document PDF
    doc.build(elements)
    # Récupère contenu PDF
    pdf = buffer.getvalue()
    # Ferme buffer mémoire
    buffer.close()
    # Retourne fichier PDF
    return pdf