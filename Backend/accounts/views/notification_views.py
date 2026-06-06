from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import Notification,Project
from accounts.serializers import NotificationSerializer

# API notifications non lues utilisateur
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    for project in Project.objects.all():
        project.check_delay()
    # Récupère notifications non lues
    notifications = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).order_by('-created_at')
    # Conversion notifications en JSON
    serializer = NotificationSerializer(notifications, many=True)

    return Response({
        "message": "Notifications récupérées avec succès",
        "data": serializer.data
    })
# API nombre notifications non lues
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    # Compte notifications non lues
    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return Response({
        "message": "Nombre de notifications non lues récupéré",
        "count": count
    })
# API marquer notification comme lue
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):

    try:
        # Recherche notification utilisateur
        notif = Notification.objects.get(
            id=pk,
            user=request.user
        ) 
        # Marque notification comme lue
        notif.is_read = True
        notif.save()

        return Response({
            "message": "Notification marquée comme lue"
        })

    except Notification.DoesNotExist:

        return Response(
            {
                "error": "Notification introuvable"
            },
            status=404
        )
# API marquer toutes notifications comme lues
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    # Type notification optionnel
    notif_type = request.data.get("type")
    # Notifications non lues utilisateur
    queryset = Notification.objects.filter(
        user=request.user,
        is_read=False
    )
     # Filtre par type si envoyé
    if notif_type:
        queryset = queryset.filter(type=notif_type)
    # Mise à jour notifications
    queryset.update(is_read=True)

    return Response({
        "message": "Toutes les notifications ont été marquées comme lues"
    })

# API historique notifications lues
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_history(request):
    # Récupère notifications lues
    notifications = Notification.objects.filter(
        user=request.user,
        is_read=True
    ).exclude(type="warning").order_by('-created_at')

    serializer = NotificationSerializer(
        notifications,
        many=True
    )

    return Response({
        "message": "Historique des notifications récupéré avec succès",
        "data": serializer.data
    })