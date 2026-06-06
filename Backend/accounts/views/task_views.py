from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.models import Task
from accounts.models import Project
from django.contrib.auth import get_user_model

from accounts.serializers import TaskSerializer
from accounts.pagination import UserPagination
from accounts.permissions import IsChefProjet

User = get_user_model()
# API liste + création tâches
class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupération ID projet depuis URL
        project_id = request.GET.get("project")
        # Si utilisateur est chef projet
        if request.user.role and request.user.role.name == "CHEF_PROJET":
            # Affiche tâches de ses projets uniquement
            tasks = Task.objects.filter(
                project__chef_projet=request.user
            ).order_by("-id")
        # Si utilisateur est membre
        elif request.user.role and request.user.role.name == "MEMBRE":
           # Affiche uniquement ses tâches
            tasks = Task.objects.filter(
                assigned_to=request.user,
                project__members=request.user
            ).order_by("-id")

        else:
            # Admin / PMO voient toutes les tâches
            tasks = Task.objects.all().order_by("-id")
             # Filtre par projet si nécessaire
            if project_id:
                tasks = tasks.filter(project_id=project_id)
        # Conversion données en JSON
        serializer = TaskSerializer(tasks, many=True)

        return Response(serializer.data)

    def post(self, request):
        # Vérifie si utilisateur est chef projet
        if not IsChefProjet().has_permission(request, None):
            return Response(
                {"error": "Seul le chef de projet peut créer des tâches"},
                status=403
            )
        # Récupération données envoyées
        project_id = request.data.get("project")
        assigned_id = request.data.get("assigned_to")

        try:
            # Recherche projet et utilisateur assigné
            project = Project.objects.get(id=project_id)
            assigned_user = User.objects.get(id=assigned_id)

        except:
            return Response(
                {"error": "Projet ou utilisateur introuvable"},
                status=404
            )
        # Vérifie que chef projet possède le projet
        if project.chef_projet != request.user:
            return Response(
                {"error": "Accès refusé"},
                status=403
            )
        # Vérifie que utilisateur est membre
        if not assigned_user.role or assigned_user.role.name != "MEMBRE":
            return Response(
                {"error": "L'utilisateur n'est pas un membre de l'équipe"},
                status=400
            )
        # Vérifie que membre appartient au projet
        if assigned_user not in project.members.all():
            return Response(
                {"error": "Cet utilisateur ne fait pas partie du projet"},
                status=400
            )
        # Création serializer tâche
        serializer = TaskSerializer(
            data=request.data,
            context={"project": project}
        )

        if serializer.is_valid():
            # Sauvegarde tâche
            task = serializer.save(
                project=project,
                assigned_to=assigned_user,
                created_by=request.user
            )

            # Définit nombre initial des tâches du projet
            if project.initial_tasks == 0:
                total_tasks = Task.objects.filter(project=project).count()

                if total_tasks > 0:
                    project.initial_tasks = total_tasks
                    project.save(update_fields=["initial_tasks"])

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
# API détail tâche
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):

    try:
        # Recherche tâche
        task = Task.objects.get(id=pk)

    except Task.DoesNotExist:
        return Response(
            {"error": "Tâche introuvable"},
            status=404
        )

    if request.method == "GET":
        # Retourne détails tâche
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    if request.method == "PUT":
        # Vérifie accès modification
        if (
            task.project.chef_projet != request.user
            and task.assigned_to != request.user
        ):
            return Response(
                {"error": "Accès refusé"},
                status=403
            )
        # Mise à jour tâche
        serializer = TaskSerializer(
            task,
            data=request.data,
            partial=True,
            context={"project": task.project}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    if request.method == "DELETE":
        # Vérifie permissions suppression
        if (
            task.assigned_to != request.user
            and task.project.chef_projet != request.user
        ):
            return Response(
                {"error": "Accès refusé"},
                status=403
            )
        # Empêche suppression tâche terminée
        if task.status == "terminee":
            return Response({
                "error": "Impossible de supprimer une tâche terminée"
            }, status=400)
        # Suppression tâche
        task.delete()

        return Response({
            "message": "Tâche supprimée avec succès"
        })


# API mise à jour statut tâche(membre)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_task_status(request, pk):

    try:
        # Recherche tâche
        task = Task.objects.get(id=pk)

    except Task.DoesNotExist:
        return Response(
            {"error": "Tâche introuvable"},
            status=404
        )
    # Vérifie que tâche appartient au membre
    if task.assigned_to != request.user:
        return Response(
            {"error": "Accès refusé"},
            status=403
        ) 
     # Nouveau statut envoyé
    new_status = request.data.get("status")

    # Vérifie transitions autorisées
    if task.status == "en_attente" and new_status not in ["en_attente", "en_cours"]:
        return Response(
            {"error": "Transition de statut invalide"},
            status=400
        )

    if task.status == "en_cours" and new_status not in ["en_cours", "terminee"]:
        return Response(
            {"error": "Transition de statut invalide"},
            status=400
        )
    # Tâche terminée devient non modifiable
    if task.status == "terminee" and new_status != "terminee":
        return Response(
            {"error": "Une tâche terminée ne peut plus être modifiée"},
            status=400
        )
    # Mise à jour statut
    task.status = new_status
    task.save()

    return Response({
        "message": "Statut mis à jour avec succès"
    })


# API mes tâches 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    # Récupère tâches assignées à utilisateur connecté
    tasks = Task.objects.filter(
        assigned_to=request.user,
        project__members=request.user
    ).order_by("-id")

    serializer = TaskSerializer(tasks, many=True)

    return Response(serializer.data)

# API tâches d’un membre dans un projet
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_tasks(request, member_id, project_id):

    tasks = Task.objects.filter(
        assigned_to_id=member_id,
        project_id=project_id
    )

    data = []

    for t in tasks:
        data.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "chef_projet": (
    f"{t.project.chef_projet.first_name} {t.project.chef_projet.last_name}"
    if t.project.chef_projet else None
)
        })

    return Response(data)