from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Q

from ..serializers import UserSerializer
from ..pagination import UserPagination
from ..permissions import IsSystemAdmin
from ..models import Role
from ..models import Role, Team, SubTeam

from ..serializers import (
    RoleSerializer,
    TeamSerializer,
    SubTeamSerializer
)

User = get_user_model()

# API simple pour afficher liste utilisateurs
class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        # Récupération de quelques infos utilisateurs
        users = User.objects.all().values(
            "id",
            "username",
            "role"
        )

        return Response(users)

# API gestion utilisateurs (liste + création)
class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        # Liste des utilisateurs sauf admin
        users = User.objects.exclude(
            role__name="SYSTEM_ADMIN"
        ).order_by("-id")
        # Paramètres de filtre envoyés par URL
        role = request.GET.get("role")
        team = request.GET.get("team")
        sub_team = request.GET.get("sub_team")
        search = request.GET.get("search")
        # Filtre par rôle
        if role:
            users = users.filter(role__name=role)
        # Filtre par équipe
        if team:
            users = users.filter(team__id=team)
         # Filtre par sous-équipe
        if sub_team:
            users = users.filter(sub_team__id=sub_team)
        # Recherche par nom ou email
        if search:
            users = users.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )

        paginator = UserPagination()

        result_page = paginator.paginate_queryset(
            users,
            request
        )
        # Conversion des données en JSON
        serializer = UserSerializer(
            result_page,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )
    # Création d’un nouvel utilisateur
    def post(self, request):

        serializer = UserSerializer(
            data=request.data,
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# API détails utilisateur
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get_object(self, id):
        # Recherche utilisateur par ID
        try:
            return User.objects.get(id=id)

        except User.DoesNotExist:
            return None

    def get(self, request, id):
        # Récupération utilisateur
        user = self.get_object(id)

        if not user:
            return Response(
                {"error": "Utilisateur introuvable"},
                status=404
            )
        # Conversion données utilisateur vers JSON
        serializer = UserSerializer(user)

        return Response(serializer.data)

    def put(self, request, id):

        user = self.get_object(id)

        if not user:
            return Response(
                {"error": "Utilisateur introuvable"},
                status=404
            )
        # Modification des données utilisateur
        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, id):

        user = self.get_object(id)

        if not user:
            return Response(
                {"error": "Utilisateur introuvable"},
                status=404
            )
        # Empêche admin de désactiver son propre compte
        if user == request.user:
            return Response(
                {"error": "Vous ne pouvez pas désactiver votre propre compte"},
                status=400
            )
       # Désactivation utilisateur
        user.is_active = False
        user.save()

        return Response({
            "message": "Utilisateur désactivé avec succès"
        })

# API activation utilisateur
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsSystemAdmin])
def activate_user(request, id):

    try:
        # Recherche utilisateur
        user = User.objects.get(id=id)

    except User.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable"},
            status=404
        )
    # Réactivation compte
    user.is_active = True
    user.save()

    return Response({
        "message": "Utilisateur activé avec succès"
    })

# API liste chefs projets
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_chef_projet(request):
    # Récupère uniquement chefs projets
    users = User.objects.filter(
        role__name="CHEF_PROJET"
    )

    serializer = UserSerializer(users, many=True)

    return Response(serializer.data)

# API liste membres
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_membres(request):
    # Récupère membres actifs
    users = User.objects.filter(
        role__name="MEMBRE",
        is_active=True
    )

    serializer = UserSerializer(users, many=True)

    return Response(serializer.data)

# API liste PMO
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_pmo(request):
    # Récupère utilisateurs PMO
    users = User.objects.filter(
        role__name="PMO"
    )

    serializer = UserSerializer(users, many=True)

    return Response(serializer.data)


# API rôles (liste + création)
class RoleListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Liste des rôles
        roles = Role.objects.all().order_by("id")

        serializer = RoleSerializer(
            roles,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        # Création nouveau rôle
        serializer = RoleSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=201
            )

        return Response(serializer.errors, status=400)

# API détails rôle
class RoleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):

        try:
            # Recherche rôle par ID
            return Role.objects.get(id=pk)

        except Role.DoesNotExist:
            return None

    def get(self, request, pk):

        role = self.get_object(pk)

        if not role:
            return Response(
                {"error": "Rôle introuvable"},
                status=404
            )

        serializer = RoleSerializer(role)

        return Response(serializer.data)

    def put(self, request, pk):

        role = self.get_object(pk)
        # Modification rôle
        serializer = RoleSerializer(
            role,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):

        role = self.get_object(pk)

        if not role:
            return Response(
                {"error": "Rôle introuvable"},
                status=404
            )
        # Vérifie si rôle utilisé par users
        if User.objects.filter(role=role).exists():

            return Response(
                {
                    "error": "Impossible de supprimer ce rôle car il est attribué à des utilisateurs"
                },
                status=400
            )
        # Suppression rôle
        role.delete()

        return Response(
            {"message": "Rôle supprimé avec succès"},
            status=204
        )

# API équipes (liste + création)
class TeamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupère toutes les équipes
        teams = Team.objects.all()
         # Conversion des équipes en JSON
        serializer = TeamSerializer(
            teams,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        # Création nouvelle équipe
        serializer = TeamSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

# API détails équipe
class TeamDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):

        try:
            # Recherche équipe par ID
            return Team.objects.get(id=pk)

        except Team.DoesNotExist:
            return None

    def get(self, request, pk):
        # Récupération équipe
        team = self.get_object(pk)

        serializer = TeamSerializer(team)

        return Response(serializer.data)

    def put(self, request, pk):

        team = self.get_object(pk)
        # Mise à jour équipe
        serializer = TeamSerializer(
            team,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):

        team = self.get_object(pk)

        if not team:
            return Response(
                {"error": "Équipe introuvable"},
                status=404
            )
        # Vérifie si équipe utilisée par users
        if User.objects.filter(team=team).exists():

            return Response(
                {
                    "error": "Impossible de supprimer cette équipe car elle est attribuée à des utilisateurs"
                },
                status=400
            )
        # Vérifie présence sous-équipes liées
        if SubTeam.objects.filter(team=team).exists():

            return Response(
                {
                    "error": "Impossible de supprimer cette équipe car elle contient des sous-équipes"
                },
                status=400
            )

        team.delete()

        return Response(status=204)

# API sous-équipes (liste + création)
class SubTeamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupère sous-équipes avec leurs équipes
        subteams = SubTeam.objects.select_related(
            "team"
        )
        # Conversion JSON
        serializer = SubTeamSerializer(
            subteams,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        # Création nouvelle sous-équipe
        serializer = SubTeamSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

# API détails sous-équipe
class SubTeamDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):

        try:
            return SubTeam.objects.get(id=pk)

        except SubTeam.DoesNotExist:
            return None

    def get(self, request, pk):

        subteam = self.get_object(pk)

        serializer = SubTeamSerializer(subteam)

        return Response(serializer.data)

    def put(self, request, pk):

        subteam = self.get_object(pk)
        # Mise à jour sous-équipe
        serializer = SubTeamSerializer(
            subteam,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):

        subteam = self.get_object(pk)

        if not subteam:
            return Response(
                {"error": "Sous-équipe introuvable"},
                status=404
            )
        # Vérifie si sous-équipe utilisée par users
        if User.objects.filter(sub_team=subteam).exists():

            return Response(
                {
                    "error": "Impossible de supprimer cette sous-équipe car elle est attribuée à des utilisateurs"
                },
                status=400
            )
        # Suppression sous-équipe
        subteam.delete()

        return Response(status=204)