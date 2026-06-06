from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from django.db.models import Sum

from accounts.models import Project
from accounts.models import Task
from django.contrib.auth import get_user_model

from accounts.serializers import ProjectSerializer
from accounts.pagination import UserPagination
from accounts.permissions import IsPMO

from accounts.services.prediction import update_project_predictions
from django.http import HttpResponse
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

User = get_user_model()

# API projets (liste + création)
class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    # Filtres URL
    def get(self, request):
        pmo_id = request.GET.get("pmo_id")
        chef_projet = request.GET.get("chef_projet")
        status_param = request.GET.get("status")
        search = request.GET.get("search")
        # Si admin système
        if request.user.role and request.user.role.name == "SYSTEM_ADMIN":
            # Affiche tous les projets
            projects = Project.objects.all().order_by("-id")
            if pmo_id:
                 # Filtre projets par PMO
                projects = projects.filter(created_by_id=pmo_id).order_by("-id")
        # Si PMO
        elif request.user.role and request.user.role.name == "PMO":
            # Affiche projets créés par lui
            projects = Project.objects.filter(created_by=request.user).order_by("-id")
        # Si chef projet
        elif request.user.role and request.user.role.name == "CHEF_PROJET":
            # Affiche projets gérés par lui
            projects = Project.objects.filter(chef_projet=request.user).order_by("-id")

        else:
            projects = Project.objects.none()

        if chef_projet:
            projects = projects.filter(chef_projet_id=chef_projet)

        if status_param:
            projects = projects.filter(status=status_param)

        if search:
            projects = projects.filter(name__icontains=search)

        paginator = UserPagination()
        result_page = paginator.paginate_queryset(projects, request)

        serializer = ProjectSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
         # Vérifie que utilisateur est PMO
        if not IsPMO().has_permission(request, None):
            return Response({"error": "Seul le PMO peut créer des projets"}, status=403)
        # Création serializer projet
        serializer = ProjectSerializer(data=request.data)

        if serializer.is_valid():
            # Sauvegarde projet
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
# API détail projet
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_detail(request, pk):

    try:
        # Recherche projet
        project = Project.objects.get(id=pk)
    except Project.DoesNotExist:
        return Response({"error": "Projet introuvable"}, status=404)

    if request.method == "GET":
        # Vérifie retard projet
        project.check_delay()
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    if request.method == "PUT":
        # Vérifie permissions modification
        if (project.chef_projet != request.user and request.user.role.name != "PMO"):
            return Response({"error": "Accès refusé"}, status=403)
         # Mise à jour projet
        serializer = ProjectSerializer(project, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

    if request.method == "DELETE":
         # Seul PMO peut supprimer
        if not IsPMO().has_permission(request, None):
            return Response(
                {"error": "Only PMO can delete project"},
                status=403
            )

        # Empêche suppression projet actif
        if project.status == "en_cours":
            return Response({
                "error": "Impossible de supprimer un projet en cours "
            }, status=400)
        # Suppression projet
        project.delete()

        return Response({"message": "Projet supprimé avec succès "})
# API ajout membres au projet
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_members_to_project(request):
    # Données reçues
    project_id = request.data.get("project_id")
    members_ids = request.data.get("members", [])
    
    if not project_id:
        return Response(
            {"error": "Le champ project_id est obligatoire"},
            status=400
        )
    # Vérifie sélection membres
    if not members_ids:
        return Response(
            {
                "error": "Veuillez sélectionner au moins un membre"
            },
            status=400
        )

    try:
        project = Project.objects.get(id=project_id)

    except Project.DoesNotExist:
        return Response(
            {"error": "Projet introuvable"},
            status=404
        )

    if project.chef_projet != request.user:
        return Response(
            {"error": "Accès refusé"},
            status=403
        )
    # Récupère membres sélectionnés
    members = User.objects.filter(
        id__in=members_ids,
        role__name="MEMBRE"
    )
     # Membres actuels
    old_members = project.members.all()
    # Membres supprimés
    removed_members = old_members.exclude(id__in=members_ids)

    for member in removed_members:
        # Vérifie tâches assignées
        has_tasks = Task.objects.filter(
            project=project,
            assigned_to=member
        ).exists()

        if has_tasks:
            return Response(
                {
                    "error": f"{member.first_name} possède des tâches assignées dans ce projet"
                },
                status=400
            )
     # Mise à jour équipe projet
    project.members.set(members)

    return Response({"message": "Équipe mise à jour avec succès"})

# API suppression membre projet
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_member(request):

    project_id = request.data.get("project_id")
    member_id = request.data.get("member_id")

    try:
        project = Project.objects.get(id=project_id)
        user = User.objects.get(id=member_id)
    except:
        return Response({"error": "Introuvable"}, status=404)

    if project.chef_projet != request.user:
        return Response({"error": "Accès refusé"}, status=403)

    tasks = Task.objects.filter(project=project, assigned_to=user)
    # Empêche suppression si tâches terminées
    if tasks.filter(status="terminee").exists():
        return Response({"error": "Impossible de supprimer ce membre : il possède des tâches terminées"}, status=400)
    # Calcule coût total tâches
    total_cost = tasks.aggregate(total=Sum("cost"))["total"] or 0
    # Restaure budget projet
    project.budget_used -= total_cost
    if project.budget_used < 0:
        project.budget_used = 0

    project.save()
    # Supprime tâches membre
    tasks.delete()
    # Recalcule prédictions projet
    update_project_predictions(project)
    # Retire membre du projet
    project.members.remove(user)

    return Response({"message": "Membre supprimé et budget restauré"})
# API détails équipe projet
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_team_detail(request, project_id):

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"error": "Introuvable"}, status=404)
    # Vérifie chef projet
    if project.chef_projet != request.user:
        return Response({"error": "Accès refusé"}, status=403)

    members_data = []
    # Parcours membres projet
    for member in project.members.all():
        # Tâches membre
        tasks = Task.objects.filter(project=project, assigned_to=member)

        total = tasks.count()
        done = tasks.filter(status="terminee").count()
       # Calcul progression membre
        progress = int((done / total) * 100) if total > 0 else 0
        # Ajout données membre
        members_data.append({
            "id": member.id,
            "name": member.first_name,
            "progress": progress,
            "tasks": [{
                "id": t.id,
                "title": t.title,
                "status": t.status
                } for t in tasks]})

    return Response({
        "project": project.name,
        "members": members_data
    })
# API métriques projet
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_metrics(request, project_id):
    # Récupère tâches projet
    tasks = Task.objects.filter(project_id=project_id)
    data = []
    # Construction métriques
    for t in tasks:
        data.append({
            "date": t.deadline,
            "cost": t.cost,
            "progress": t.progress if hasattr(t, "progress") else 0
        })

    return Response(data)

