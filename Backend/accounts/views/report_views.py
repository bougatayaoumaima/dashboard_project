from django.http import HttpResponse

from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from accounts.models import Project
from accounts.services.reporting import generate_project_report

# API téléchargement rapport projet PDF
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_project_report(request, project_id):

    try:
        project = Project.objects.get(id=project_id)

    except Project.DoesNotExist:
        return HttpResponse(
            "Projet introuvable",
            status=404
        )

    user = request.user

   
    # Vérifie si utilisateur est PMO
    is_pmo = (
        user.role and user.role.name == "PMO"
    )

    

    if not ( is_pmo ):
        return HttpResponse(
            "Accès refusé",
            status=403
        )
    # Génération du rapport PDF
    pdf = generate_project_report(project)
    # Création réponse HTTP PDF
    response = HttpResponse(
        pdf,
        content_type='application/pdf'
    )
    # Force téléchargement fichier PDF
    response['Content-Disposition'] = (
        f'attachment; filename="rapport_{project.name}.pdf"'
    )

    return response