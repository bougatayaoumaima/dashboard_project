from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import parser_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
from accounts.serializers import LoginSerializer, UserSerializer

User = get_user_model()

# Login API
class LoginView(TokenObtainPairView):
    # Serializer login
    serializer_class = LoginSerializer

# Test authentication
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_protected(request):
    # User connecté
    return Response({
        "message": "Vous êtes authentifié",
        "user": request.user.username
    })

# My profile API
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
# Accepte image/fichier
@parser_classes([MultiPartParser, FormParser])
def my_profile(request):
     # User connecté
    user = request.user

    if request.method == "GET":
        # Retourne profil
        serializer = UserSerializer(user)
        return Response(serializer.data)

    if request.method == "PUT":
        # Modifier profil
        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True,
            context={"request": request}
        )
         # Vérifie données
        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "Profil mis à jour avec succès",
                "data": serializer.data
            })

        return Response(
            {
                "error": "Erreur lors de la mise à jour du profil",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
# Change password API
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user
    # Nouveau password
    password = request.data.get("password")
    # Vérifie password
    if not password:
        return Response(
            {"error": "Le mot de passe est obligatoire"},
            status=status.HTTP_400_BAD_REQUEST
        )
    # Change password
    user.set_password(password)
    # Désactive changement obligatoire
    user.must_change_password = False
    user.save()

    return Response({
        "message": "Mot de passe mis à jour avec succès"
    })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

# Reset user password
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def reset_user_password(request, user_id):
    # Vérifie admin système
    if request.user.role.name != "SYSTEM_ADMIN":
        return Response(
            {"error": "Accès refusé"},
            status=403
        )

    try:
        #cherche user
        user = User.objects.get(id=user_id)

    except User.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable"},
            status=404
        )
    # Password par défaut    
    user.set_password("123")
    # Force changement password
    user.must_change_password = True

    user.save()

    return Response({
        "message": "Mot de passe réinitialisé avec succès"
    })