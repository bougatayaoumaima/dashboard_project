from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Count, Avg, Sum
from datetime import date, timedelta

from django.contrib.auth import get_user_model

from accounts.models import (
    Project,
    Task,
    ProjectAlert
)

User = get_user_model()

from accounts.services.prediction import (
    get_project_dataset,
    update_project_predictions
)
from django.db.models.functions import TruncWeek
from ..permissions import IsSystemAdmin
from collections import defaultdict
from datetime import timedelta

from django.utils.timezone import now
from django.db.models.functions import TruncWeek
from django.db.models import Count

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Task
# Statistiques projets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_stats(request):
    # Si PMO
    if request.user.role.name == "PMO":
        projects = Project.objects.filter(created_by=request.user)
    # Si admin système
    elif request.user.role.name == "SYSTEM_ADMIN":
        projects = Project.objects.all()
    # Sinon chef projet
    else:
        projects = Project.objects.filter(chef_projet=request.user)
    # Compte projets par statut
    stats = projects.values("status").annotate(count=Count("id"))
    # Données initiales
    data = {
        "en_attente": 0,
        "en_cours": 0,
        "terminee": 0,
        "total": projects.count()
    }
    # Ajoute résultats
    for s in stats:
        data[s["status"]] = s["count"]
    # Évite division par zéro
    total = data["total"] or 1
    # Pourcentage chaque status
    data["en_attente_pct"] = round((data["en_attente"] / total) * 100, 1)
    data["en_cours_pct"] = round((data["en_cours"] / total) * 100, 1)
    data["terminee_pct"] = round((data["terminee"] / total) * 100, 1)

    return Response(data)
# Dashboard stats
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_project_stats(request):
    # Sélection projets selon rôle
    if request.user.role.name == "PMO":
        projects = Project.objects.filter(created_by=request.user)

    elif request.user.role.name == "SYSTEM_ADMIN":
        projects = Project.objects.all()

    else:
        projects = Project.objects.filter(chef_projet=request.user)
    # Retour statistiques simples
    return Response({
        "total": projects.count(),
        "en_attente": projects.filter(status="en_attente").count(),
        "en_cours": projects.filter(status="en_cours").count(),
        "terminee": projects.filter(status="terminee").count()
    })

# Moyennes projets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def projects_avg_stats(request):
    # Sélection projets
    if request.user.role.name == "PMO":
        projects = Project.objects.filter(created_by=request.user)

    elif request.user.role.name == "SYSTEM_ADMIN":
        projects = Project.objects.all()

    else:
        projects = Project.objects.filter(chef_projet=request.user)
    # Moyenne budgets
    avg_cost = projects.aggregate(avg=Avg("budget"))["avg"] or 0

    total_progress = 0
    # Nombre projets
    count = projects.count()
    # Parcours projets
    for p in projects:

        tasks = p.task_set.all()
         # Vérifie tâches existantes
        if tasks.exists():

            done = tasks.filter(status="terminee").count()

            total = tasks.count()
            # Calcul progression
            total_progress += (done / total) * 100
    # Moyenne progression
    avg_progress = total_progress / count if count > 0 else 0

    return Response({
        "avg_progress": round(avg_progress, 1),
        "avg_cost": round(avg_cost, 2),
        "total_projects": count
    })
# Statistiques utilisateurs
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def users_stats(request):
     # Compte users par rôle
    role_stats = User.objects.values(
        "role__name"
    ).annotate(count=Count("id"))
    # Données initiales
    data = {
        "SYSTEM_ADMIN": 0,
        "PMO": 0,
        "CHEF_PROJET": 0,
        "MEMBRE": 0,
        "total": User.objects.count()
    }
     # Ajoute résultats
    for s in role_stats:

        role_name = s["role__name"]

        if role_name:
            data[role_name] = s["count"]

    return Response(data)
# Analyse projet + prédictions
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_analytics(request, project_id):

    try:
        # Cherche projet
        project = Project.objects.get(id=project_id)

    except Project.DoesNotExist:
        return Response(
            {"error": "Projet introuvable"},
            status=404
        )
    # Met à jour prédictions IA
    update_project_predictions(project)
    # Historique projet
    data = get_project_dataset(project)
    # Si aucune donnée
    if not data:
        return Response({
            "history": [],
            "future": [],
            "prediction_progress": 0,
            "prediction_cost": 0
        })
     # Jours restants
    remaining_days = (
        (project.end_date - date.today()).days
        if project.end_date else 7
    )
    # Limite entre 1 et 30 jours
    remaining_days = max(1, min(remaining_days, 30))
    # Valeurs prédites
    prediction_progress = project.predicted_progress
    prediction_cost = project.predicted_cost
    # Dernière donnée historique
    last = data[-1]

    future = []
    # Génération données futures
    for i in range(1, remaining_days + 1):

        ratio = i / remaining_days

        future.append({
            "date": str(last["date"] + timedelta(days=i)),
            # Progression future
            "execution_progress": round(
                last["progress"] +
                (prediction_progress - last["progress"]) * ratio,
                2
            ),
            # Coût futur
            "total_cost": round(
                last["total_cost"] +
                (prediction_cost - last["total_cost"]) * ratio,
                2
            )
        })
     # Historique formaté
    history = [
        {
            "date": str(d["date"]),
            "execution_progress": d["progress"],
            "total_cost": d["total_cost"]
        }
        for d in data
    ]

    return Response({
        "history": history,
        "future": future,
        "prediction_progress": prediction_progress,
        "prediction_cost": prediction_cost
    })
# Prédictions mes projets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_projects_predictions(request):
     # Sélection projets
    if request.user.role.name == "PMO":
        projects = Project.objects.filter(created_by=request.user)

    elif request.user.role.name == "SYSTEM_ADMIN":
        projects = Project.objects.all()

    else:
        projects = Project.objects.filter(chef_projet=request.user)

    data = []
     # Parcours projets
    for project in projects:
        # Update prédictions
        update_project_predictions(project)
        # Ajoute données
        data.append({
            "id": project.id,
            "name": project.name,
            "predicted_progress": project.predicted_progress,
            "predicted_cost": project.predicted_cost,
            "status": project.status
        })

    return Response(data)

# Alertes projet
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_alerts(request, project_id):
     # Alertes actives
    alerts = ProjectAlert.objects.filter(
        project_id=project_id,
        is_active=True
    )
    # Format JSON
    data = [
        {
            "message": a.message,
            "type": a.alert_type
        }
        for a in alerts
    ]

    return Response(data)
# Statistiques alertes
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alerts_stats(request):
    # Sélection alertes selon rôle
    if request.user.role.name == "PMO":

        alerts = ProjectAlert.objects.filter(
            project__created_by=request.user,
            is_active=True
        )

    elif request.user.role.name == "SYSTEM_ADMIN":

        alerts = ProjectAlert.objects.filter(
            is_active=True
        )

    else:

        alerts = ProjectAlert.objects.filter(
            project__chef_projet=request.user,
            is_active=True
        )
    # Nombre total alertes
    total = alerts.count()
    # Compte alertes par type
    stats = alerts.values("alert_type").annotate(
        count=Count("id")
    )
    # Données initiales
    data = {
        "DELAY": 0,
        "BUDGET": 0,
        "EFFICIENCY": 0,
        "FUTURE_INEFFICIENCY": 0,
        "total": total
    }
     # Ajoute résultats
    for s in stats:
        data[s["alert_type"]] = s["count"]

    total = total or 1
    # Liste types alertes
    keys = [
        "DELAY",
        "BUDGET",
        "EFFICIENCY",
        "FUTURE_INEFFICIENCY"
    ]
    # Calcul pourcentages
    for key in keys:
        data[f"{key}_pct"] = round(
            (data[key] / total) * 100,
            1
        )

    return Response(data)
# Évolution tâches
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tasks_evolution(request):
     # Tâches créées par semaine
    created_tasks = (
        Task.objects
        .annotate(week=TruncWeek("created_at"))
        .values("week")
        .annotate(total=Count("id"))
        .order_by("week")
    )
     # Tâches terminées
    completed_tasks = (
        Task.objects
        .filter(status="terminee")
        .annotate(week=TruncWeek("created_at"))
        .values("week")
        .annotate(total=Count("id"))
        .order_by("week")
    )
     # Tâches en retard
    delayed_tasks = (
        Task.objects
        .filter(
            deadline__lt=now().date()
        )
        .exclude(status="terminee")
        .annotate(week=TruncWeek("created_at"))
        .values("week")
        .annotate(total=Count("id"))
        .order_by("week")
    )
     # Structure résultats
    data = defaultdict(lambda: {
        "created": 0,
        "terminee": 0,
        "delayed": 0
    })
    # Ajoute créées
    for item in created_tasks:

        week = item["week"].strftime("Semaine %W")

        data[week]["created"] = item["total"]
    # Ajoute terminées
    for item in completed_tasks:

        week = item["week"].strftime("Semaine %W")

        data[week]["terminee"] = item["total"]
     # Ajoute retard
    for item in delayed_tasks:

        week = item["week"].strftime("Semaine %W")

        data[week]["delayed"] = item["total"]

    final_data = []
     # Prépare format final
    for week, values in data.items():

        final_data.append({
            "week": week,
            **values
        })
    # Trie semaines
    final_data = sorted(
        final_data,
        key=lambda x: x["week"]
    )

    return Response(final_data)